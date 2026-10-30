// ============================================================
// SECTION 1: CONSTANTS & DEFAULT DATA
// ============================================================

/**
 * Tujuh kategori bawaan yang selalu tersedia dan tidak dapat dihapus.
 * Urutan ini dipertahankan — kategori kustom pengguna ditambahkan setelah daftar ini.
 * Requirement 5.1
 */
var DEFAULT_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Belanja',
  'Lain-lain'
];

/** Kunci localStorage yang digunakan seluruh aplikasi */
var STORAGE_KEYS = {
  TRANSACTIONS: 'ebv_transactions',
  CATEGORIES:   'ebv_categories',
  THEME:        'ebv_theme'
};

// ============================================================
// SECTION 2: STATE / STORE
// ============================================================

/**
 * Objek state terpusat aplikasi.
 * Semua perubahan data dilakukan melalui objek ini, diikuti
 * pemanggilan fungsi render yang relevan untuk memperbarui DOM.
 *
 * transactions       — Array<Transaction>  semua transaksi yang tersimpan
 * categories         — Array<string>       daftar kategori (default + kustom)
 * theme              — 'light' | 'dark'    tema tampilan saat ini
 * activeView         — string              section yang sedang ditampilkan
 * activeMonthFilter  — 'YYYY-MM' | null    bulan yang dipilih di ringkasan bulanan
 */
var AppState = {
  transactions:      [],
  categories:        DEFAULT_CATEGORIES.slice(), // salinan agar default tidak termutasi
  theme:             'light',
  activeView:        'dashboard',
  activeMonthFilter: null
};

// ============================================================
// SECTION 3: LOCALSTORAGE UTILITIES
// ============================================================

/**
 * Checks whether localStorage is accessible in the current browser context.
 * Some browsers (e.g. Safari in private mode) throw when writing to localStorage.
 *
 * If unavailable, inserts a dismissible Indonesian-language warning banner at the
 * top of the page. The app continues to function in-memory for the session.
 *
 * @returns {boolean} true if localStorage is available, false otherwise
 *
 * Requirements: 8.3
 */
function checkLocalStorageAvailable() {
  try {
    var testKey = '__ebv_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    // Render warning banner only once
    if (!document.getElementById('ls-warning-banner')) {
      var banner = document.createElement('div');
      banner.id = 'ls-warning-banner';
      banner.setAttribute('role', 'alert');
      banner.style.cssText = [
        'background:#c0392b',
        'color:#fff',
        'padding:12px 16px',
        'text-align:center',
        'font-size:14px',
        'position:sticky',
        'top:0',
        'z-index:9999'
      ].join(';');
      banner.textContent =
        'Peringatan: Data tidak dapat disimpan karena penyimpanan lokal browser tidak tersedia.';
      // Prepend to body (or document if body not ready)
      var target = document.body || document.documentElement;
      target.insertBefore(banner, target.firstChild);
    }
    return false;
  }
}

/**
 * Loads all persisted data from localStorage into AppState.
 * Called once during app initialisation (init()).
 *
 * - Transactions  → AppState.transactions  (key: ebv_transactions)
 * - Categories    → AppState.categories    (key: ebv_categories)
 * - Theme         → AppState.theme         (key: ebv_theme)
 *
 * Each key is parsed independently so a corrupt entry in one key
 * does not prevent the others from loading. Corrupt / missing data
 * falls back to the current AppState default values.
 *
 * Requirements: 8.2, 8.4
 */
function loadFromStorage() {
  // --- Transactions ---
  try {
    var rawTxn = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (rawTxn !== null) {
      var parsed = JSON.parse(rawTxn);
      if (Array.isArray(parsed)) {
        AppState.transactions = parsed;
      }
    }
  } catch (e) {
    console.warn('[EBV] Data transaksi di localStorage korup, menggunakan default kosong.', e);
    AppState.transactions = [];
  }

  // --- Categories ---
  try {
    var rawCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (rawCat !== null) {
      var parsedCat = JSON.parse(rawCat);
      if (Array.isArray(parsedCat) && parsedCat.length > 0) {
        AppState.categories = parsedCat;
      }
    }
  } catch (e) {
    console.warn('[EBV] Data kategori di localStorage korup, menggunakan kategori default.', e);
    AppState.categories = DEFAULT_CATEGORIES.slice();
  }

  // --- Theme ---
  try {
    var rawTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (rawTheme === 'light' || rawTheme === 'dark') {
      AppState.theme = rawTheme;
    }
  } catch (e) {
    console.warn('[EBV] Data tema di localStorage korup, menggunakan tema default.', e);
  }
}

/**
 * Persists the current transactions array to localStorage.
 * Silently skips if localStorage is unavailable (in-memory mode).
 *
 * Requirements: 8.1, 8.4
 */
function saveTransactions() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.TRANSACTIONS,
      JSON.stringify(AppState.transactions)
    );
  } catch (e) {
    console.warn('[EBV] Gagal menyimpan transaksi ke localStorage.', e);
  }
}

/**
 * Persists the current categories array to localStorage.
 * Silently skips if localStorage is unavailable (in-memory mode).
 *
 * Requirements: 8.1, 8.4
 */
function saveCategories() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(AppState.categories)
    );
  } catch (e) {
    console.warn('[EBV] Gagal menyimpan kategori ke localStorage.', e);
  }
}

/**
 * Persists the chosen theme preference to localStorage.
 * Also updates AppState.theme to keep state and storage in sync.
 *
 * @param {'light'|'dark'} theme - The theme to save
 *
 * Requirements: 7.3, 8.1
 */
function saveTheme(theme) {
  AppState.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.warn('[EBV] Gagal menyimpan preferensi tema ke localStorage.', e);
  }
}

// ============================================================
// SECTION 4: DATA UTILITIES (pure functions)
// ============================================================

/** Nama bulan dalam bahasa Indonesia (indeks 0 = Januari) */
var INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Menghitung saldo: total pemasukan dikurangi total pengeluaran.
 *
 * @param {Array} transactions - Array of Transaction objects
 * @returns {number} Saldo bersih (bisa negatif)
 *
 * Requirements: 2.1, 2.2
 */
function calculateBalance(transactions) {
  var income  = calculateTotalByType(transactions, 'income');
  var expense = calculateTotalByType(transactions, 'expense');
  return income - expense;
}

/**
 * Menghitung total jumlah transaksi berdasarkan tipe.
 *
 * @param {Array}  transactions - Array of Transaction objects
 * @param {string} type         - 'income' atau 'expense'
 * @returns {number} Total jumlah untuk tipe yang diberikan
 *
 * Requirements: 2.1, 2.2
 */
function calculateTotalByType(transactions, type) {
  var total = 0;
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].type === type) {
      total += transactions[i].amount;
    }
  }
  return total;
}

/**
 * Mengelompokkan transaksi berdasarkan bulan (YYYY-MM), dihitung
 * income/expense/net per bulan, dan diurutkan dari bulan terbaru ke terlama.
 *
 * @param {Array} transactions - Array of Transaction objects
 * @returns {Array<MonthSummary>} Daftar ringkasan bulanan
 *
 * MonthSummary: { key, label, income, expense, net, transactions }
 *
 * Requirements: 6.1, 6.2, 6.4
 */
function groupByMonth(transactions) {
  // Kumpulkan semua kunci bulan unik
  var monthMap = {};
  for (var i = 0; i < transactions.length; i++) {
    var txn = transactions[i];
    var monthKey = txn.date.substring(0, 7); // "YYYY-MM"
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = {
        key:          monthKey,
        label:        _buildMonthLabel(monthKey),
        income:       0,
        expense:      0,
        net:          0,
        transactions: []
      };
    }
    monthMap[monthKey].transactions.push(txn);
    if (txn.type === 'income') {
      monthMap[monthKey].income += txn.amount;
    } else if (txn.type === 'expense') {
      monthMap[monthKey].expense += txn.amount;
    }
  }

  // Hitung net dan kumpulkan ke array
  var result = [];
  var keys = Object.keys(monthMap);
  for (var j = 0; j < keys.length; j++) {
    var entry = monthMap[keys[j]];
    entry.net = entry.income - entry.expense;
    result.push(entry);
  }

  // Urutkan dari bulan terbaru ke terlama (string YYYY-MM bisa dibandingkan langsung)
  result.sort(function (a, b) {
    if (a.key > b.key) return -1;
    if (a.key < b.key) return  1;
    return 0;
  });

  return result;
}

/**
 * Helper: Membuat label bulan dalam bahasa Indonesia dari kunci "YYYY-MM".
 * Contoh: "2024-10" → "Oktober 2024"
 *
 * @param {string} monthKey - Format "YYYY-MM"
 * @returns {string}
 */
function _buildMonthLabel(monthKey) {
  var parts = monthKey.split('-');
  var year  = parts[0];
  var month = parseInt(parts[1], 10); // 1-based
  return INDONESIAN_MONTHS[month - 1] + ' ' + year;
}

/**
 * Mengembalikan hanya transaksi yang berasal dari bulan yang diberikan.
 *
 * @param {Array}  transactions - Array of Transaction objects
 * @param {string} monthKey     - Format "YYYY-MM"
 * @returns {Array<Transaction>} Subset transaksi dari bulan tersebut
 *
 * Requirements: 6.3
 */
function filterByMonth(transactions, monthKey) {
  var result = [];
  for (var i = 0; i < transactions.length; i++) {
    if (transactions[i].date.substring(0, 7) === monthKey) {
      result.push(transactions[i]);
    }
  }
  return result;
}

/**
 * Menghitung data grafik pengeluaran per kategori.
 * Hanya transaksi bertipe 'expense' yang dihitung.
 * Persentase dijamin menjumlahkan ke tepat 100 (penanganan floating-point rounding
 * dilakukan dengan menyesuaikan elemen terakhir setelah pembulatan).
 *
 * @param {Array} transactions - Array of Transaction objects
 * @returns {Array<{category: string, amount: number, percentage: number}>}
 *          Diurutkan berdasarkan amount (terbesar dulu). Array kosong jika tidak ada pengeluaran.
 *
 * Requirements: 4.1, 4.4
 */
function computeChartData(transactions) {
  // Kumpulkan total pengeluaran per kategori
  var categoryMap = {};
  var grandTotal  = 0;

  for (var i = 0; i < transactions.length; i++) {
    var txn = transactions[i];
    if (txn.type !== 'expense') continue;
    grandTotal += txn.amount;
    if (!categoryMap[txn.category]) {
      categoryMap[txn.category] = 0;
    }
    categoryMap[txn.category] += txn.amount;
  }

  if (grandTotal === 0) {
    return [];
  }

  // Bangun array mentah dan urutkan berdasarkan amount (terbesar dulu)
  var items = [];
  var categories = Object.keys(categoryMap);
  for (var j = 0; j < categories.length; j++) {
    var cat = categories[j];
    items.push({
      category:   cat,
      amount:     categoryMap[cat],
      percentage: 0  // dihitung berikutnya
    });
  }

  items.sort(function (a, b) { return b.amount - a.amount; });

  // Hitung persentase dengan koreksi rounding agar total = 100
  var runningTotal = 0;
  for (var k = 0; k < items.length; k++) {
    if (k < items.length - 1) {
      // Bulatkan ke 2 desimal
      var pct = Math.round((items[k].amount / grandTotal) * 10000) / 100;
      items[k].percentage = pct;
      runningTotal += pct;
    } else {
      // Elemen terakhir mendapatkan sisa agar total tepat 100
      items[k].percentage = Math.round((100 - runningTotal) * 100) / 100;
    }
  }

  return items;
}

/**
 * Mengurutkan array transaksi dari tanggal terbaru ke terlama.
 * Mengembalikan array baru — tidak mengubah array input.
 *
 * @param {Array} transactions - Array of Transaction objects
 * @returns {Array<Transaction>} Array baru yang sudah diurutkan
 *
 * Requirements: 3.1
 */
function sortByDateDesc(transactions) {
  var copy = transactions.slice();
  copy.sort(function (a, b) {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return  1;
    return 0;
  });
  return copy;
}

// ============================================================
// SECTION 5: FORMATTING UTILITIES (pure functions)
// ============================================================

/**
 * Formats a numeric amount as Indonesian Rupiah (IDR).
 * Uses dot (.) as the thousands separator per IDR convention.
 *
 * @param {number} amount - Non-negative number to format
 * @returns {string} - e.g. "Rp 150.000" or "Rp 1.500.000"
 *
 * Requirements: 1.7, 2.1, 2.2
 */
function formatIDR(amount) {
  var rounded = Math.round(amount);
  var str = String(Math.abs(rounded));
  var result = '';
  var offset = str.length % 3; // digits before the first dot
  for (var i = 0; i < str.length; i++) {
    // After the leading group, insert a dot every 3 digits
    if (i > 0 && (i - offset) % 3 === 0) {
      result += '.';
    }
    result += str[i];
  }
  return 'Rp ' + result;
}

/**
 * Formats an ISO date string ("YYYY-MM-DD") as "DD/MM/YYYY".
 * Day and month are zero-padded to two digits.
 *
 * @param {string} isoDateString - Date in "YYYY-MM-DD" format
 * @returns {string} - e.g. "25/10/2024"
 *
 * Requirements: 1.6
 */
function formatDate(isoDateString) {
  var parts = isoDateString.split('-');
  var yyyy = parts[0];
  var mm   = parts[1];
  var dd   = parts[2];
  return dd + '/' + mm + '/' + yyyy;
}

// ============================================================
// SECTION 6: VALIDATION (pure functions)
// ============================================================

/**
 * Validates transaction form data before saving.
 * All checks are performed and all errors are collected before returning.
 *
 * @param {Object} formData
 * @param {string} formData.amount      - Raw string value from the amount input
 * @param {string} formData.type        - 'income' | 'expense'
 * @param {string} formData.category    - Selected category name, or empty string
 * @param {string} formData.date        - Date string in 'YYYY-MM-DD' format, or empty
 * @param {string} formData.description - Optional description, may be empty
 * @returns {{ valid: boolean, errors: string[] }}
 *
 * Requirements: 1.3, 1.4, 1.5
 */
function validateTransaction(formData) {
  var errors = [];

  // --- Amount validation ---
  var rawAmount = formData.amount === undefined || formData.amount === null
    ? ''
    : String(formData.amount).trim();

  if (rawAmount === '') {
    errors.push('Jumlah tidak boleh kosong');
  } else {
    var numAmount = Number(rawAmount);
    if (isNaN(numAmount)) {
      errors.push('Jumlah harus berupa angka');
    } else if (numAmount <= 0) {
      errors.push('Jumlah harus lebih dari nol');
    }
  }

  // --- Category validation ---
  var category = formData.category === undefined || formData.category === null
    ? ''
    : String(formData.category).trim();

  if (category === '') {
    errors.push('Pilih kategori transaksi');
  }

  // --- Date validation ---
  var date = formData.date === undefined || formData.date === null
    ? ''
    : String(formData.date).trim();

  if (date === '') {
    errors.push('Tanggal tidak boleh kosong');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates a new custom category name against the existing category list.
 * Duplicate detection is case-insensitive.
 *
 * @param {string}   name               - Raw string from the category name input
 * @param {string[]} existingCategories - Current array of all category names
 * @returns {{ valid: boolean, error: string }}
 *
 * Requirements: 5.2, 5.3, 5.4
 */
function validateCategoryName(name, existingCategories) {
  var trimmed = name === undefined || name === null ? '' : String(name).trim();

  if (trimmed === '') {
    return { valid: false, error: 'Nama kategori tidak boleh kosong' };
  }

  var lowerNew = trimmed.toLowerCase();
  for (var i = 0; i < existingCategories.length; i++) {
    if (existingCategories[i].toLowerCase() === lowerNew) {
      return { valid: false, error: "Kategori '" + existingCategories[i] + "' sudah ada" };
    }
  }

  return { valid: true, error: '' };
}

// ============================================================
// ============================================================
// SECTION 7: UI RENDERING
// ============================================================

/**
 * Renders the dashboard section with balance card, summary cards, and transaction form.
 * Requirement: 2.1, 2.2, 2.4, 2.5
 */
function renderDashboard() {
  // Balance card
  var balance = calculateBalance(AppState.transactions);
  var balanceEl = document.getElementById('dashboard-balance');
  if (balanceEl) {
    balanceEl.textContent = formatIDR(balance);
    balanceEl.className = 'balance-value ' + (balance < 0 ? 'balance-negative' : 'balance-positive');
  }

  // Summary cards
  var incomeEl = document.getElementById('summary-income');
  var expenseEl = document.getElementById('summary-expense');
  if (incomeEl) {
    incomeEl.textContent = formatIDR(calculateTotalByType(AppState.transactions, 'income'));
  }
  if (expenseEl) {
    expenseEl.textContent = formatIDR(calculateTotalByType(AppState.transactions, 'expense'));
  }

  // Transaction form category dropdown
  var categorySelect = document.getElementById('transaction-category');
  if (categorySelect) {
    categorySelect.innerHTML = '';
    for (var i = 0; i < AppState.categories.length; i++) {
      var opt = document.createElement('option');
      opt.value = AppState.categories[i];
      opt.textContent = AppState.categories[i];
      categorySelect.appendChild(opt);
    }
  }
}

/**
 * Renders the transaction list (history section).
 * Requirement: 1.6, 1.7, 3.1, 3.2, 3.3, 3.4
 */
function renderTransactionList(transactions) {
  var container = document.getElementById('transaction-list-container');
  if (!container) return;

  var sorted = sortByDateDesc(transactions);

  if (sorted.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<span class="empty-icon">📝</span>' +
        '<div class="empty-text">Belum ada transaksi</div>' +
        '<div class="empty-subtext">Tambah transaksi pertama Anda untuk mulai mencatat keuangan.</div>' +
      '</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < sorted.length; i++) {
    var txn = sorted[i];
    var typeClass = txn.type === 'income' ? 'income' : 'expense';
    var typeLabel = txn.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    html +=
      '<div class="transaction-item ' + typeClass + '" data-id="' + txn.id + '">' +
        '<div class="transaction-body">' +
          '<div class="transaction-top">' +
            '<span class="transaction-amount">' + formatIDR(txn.amount) + '</span>' +
            '<span class="transaction-type-badge">' + typeLabel + '</span>' +
          '</div>' +
          '<div class="transaction-meta">' +
            '<span class="transaction-category">' + txn.category + '</span>' +
            '<span class="transaction-date">' + formatDate(txn.date) + '</span>' +
          '</div>' +
          (txn.description ? '<div class="transaction-description">' + txn.description + '</div>' : '') +
        '</div>' +
        '<button class="btn-danger transaction-delete" aria-label="Hapus transaksi">' +
          '🗑️' +
        '</button>' +
      '</div>';
  }
  container.innerHTML = html;
}

/**
 * Renders the monthly summary section.
 * Requirement: 6.1, 6.2, 6.3, 6.4, 6.5
 */
function renderMonthly() {
  var container = document.getElementById('monthly-container');
  if (!container) return;

  var monthlySummaries = groupByMonth(AppState.transactions);

  if (monthlySummaries.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<span class="empty-icon">📅</span>' +
        '<div class="empty-text">Belum ada data bulanan</div>' +
        '<div class="empty-subtext">Tambah transaksi untuk melihat ringkasan bulanan.</div>' +
      '</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < monthlySummaries.length; i++) {
    var summary = monthlySummaries[i];
    var isActive = AppState.activeMonthFilter === summary.key ? 'active' : '';
    var netClass = summary.net >= 0 ? 'positive' : 'negative';
    html +=
      '<div class="month-card ' + isActive + '" data-month="' + summary.key + '">' +
        '<div class="month-card-header">' +
          '<span class="month-label">' + summary.label + '</span>' +
          '<span class="month-net ' + netClass + '">' + formatIDR(summary.net) + '</span>' +
        '</div>' +
        '<div class="month-stats">' +
          '<div class="month-stat income">' +
            '<span class="stat-label">Pemasukan</span>' +
            '<span class="stat-value">' + formatIDR(summary.income) + '</span>' +
          '</div>' +
          '<div class="month-stat expense">' +
            '<span class="stat-label">Pengeluaran</span>' +
            '<span class="stat-value">' + formatIDR(summary.expense) + '</span>' +
          '</div>' +
        '</div>' +
        (AppState.activeMonthFilter === summary.key && summary.transactions.length > 0
          ? '<div class="month-transactions">' +
              '<div class="month-transactions-title">Transaksi ' + summary.label + '</div>' +
              renderTransactionListHTML(summary.transactions) +
            '</div>'
          : '') +
      '</div>';
  }
  container.innerHTML = html;
}

/**
 * Helper: Builds HTML for transaction list used in monthly section.
 */
function renderTransactionListHTML(transactions) {
  var sorted = sortByDateDesc(transactions);
  if (sorted.length === 0) return '';

  var html = '';
  for (var i = 0; i < sorted.length; i++) {
    var txn = sorted[i];
    var typeClass = txn.type === 'income' ? 'income' : 'expense';
    html +=
      '<div class="transaction-item ' + typeClass + '" style="margin:var(--space-2) 0; padding:var(--space-3) var(--space-4);">' +
        '<div class="transaction-body">' +
          '<div class="transaction-top">' +
            '<span class="transaction-amount">' + formatIDR(txn.amount) + '</span>' +
            '<span class="transaction-type-badge">' + (txn.type === 'income' ? 'Income' : 'Expense') + '</span>' +
          '</div>' +
          '<div class="transaction-meta">' +
            '<span class="transaction-category">' + txn.category + '</span>' +
            '<span class="transaction-date">' + formatDate(txn.date) + '</span>' +
          '</div>' +
          (txn.description ? '<div class="transaction-description">' + txn.description + '</div>' : '') +
        '</div>' +
      '</div>';
  }
  return html;
}

/**
 * Renders the categories section.
 * Requirement: 5.1, 5.2, 5.6
 */
function renderCategories() {
  var container = document.getElementById('category-list-container');
  if (!container) return;

  var html = '';
  for (var i = 0; i < AppState.categories.length; i++) {
    var cat = AppState.categories[i];
    var isDefault = DEFAULT_CATEGORIES.indexOf(cat) !== -1;
    html +=
      '<div class="category-item">' +
        '<div>' +
          '<span class="category-name">' + cat + '</span>' +
          (isDefault ? '<span class="category-badge">Bawaan</span>' : '') +
        '</div>' +
        (!isDefault
          ? '<button class="btn-danger" data-delete-category="' + cat + '">×</button>'
          : '') +
      '</div>';
  }
  container.innerHTML = html;
}

/**
 * Displays an error message below the specified form element.
 * @param {string} elementId - ID of the form input/label
 * @param {string} message   - Error message in Indonesian
 */
function showError(elementId, message) {
  var el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.className = 'form-error';
  }
}

/**
 * Clears the error message for the specified form element.
 * @param {string} elementId - ID of the form input/label
 */
function clearError(elementId) {
  var el = document.getElementById(elementId);
  if (el) {
    el.textContent = '';
    el.className = 'form-error';
  }
}

/**
 * Renders all sections of the app.
 * Called during initialization and after any state change.
 */
function renderAll() {
  renderDashboard();
  renderTransactionList(AppState.transactions);
  renderChart();
  renderMonthly();
  renderCategories();

  // Show active section, hide others
  var sections = ['dashboard', 'history', 'chart', 'monthly', 'categories'];
  for (var i = 0; i < sections.length; i++) {
    var sectionEl = document.getElementById('section-' + sections[i]);
    if (sectionEl) {
      sectionEl.classList.toggle('active', AppState.activeView === sections[i]);
    }
  }

  // Update nav tab active states
  var tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.view === AppState.activeView);
  });
}

// ============================================================
// SECTION 8: CHART RENDERING (CSS bar chart)
// ============================================================

/**
 * Renders the expense chart using CSS-based bar chart (div-based, no Canvas API).
 * Requirement: 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * - Calls computeChartData(AppState.transactions) for category data
 * - Renders bars as <div> elements with inline width=XX%
 * - Uses data-color-index attribute for bar coloring (1-14)
 * - Displays value and percentage for each category
 * - Renders legend with color dots and labels
 * - Shows Indonesian empty state message if no expenses
 */
function renderChart() {
  var container = document.getElementById('chart-content');
  if (!container) return;

  var chartData = computeChartData(AppState.transactions);

  // Empty state — no expenses
  if (chartData.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<span class="empty-icon">📊</span>' +
        '<div class="empty-text">Belum ada data pengeluaran</div>' +
        '<div class="empty-subtext">Tambah transaksi bertipe "Pengeluaran" untuk melihat distribusi kategori.</div>' +
      '</div>';
    return;
  }

  // Build chart HTML
  var html =
    '<div class="chart-title">Distribusi Pengeluaran per Kategori</div>';

  for (var i = 0; i < chartData.length; i++) {
    var item = chartData[i];
    var colorIndex = (i % 14) + 1; // Cycle through 1-14
    html +=
      '<div class="chart-bar-row">' +
        '<div class="chart-bar-label">' + item.category + '</div>' +
        '<div class="chart-bar-track">' +
          '<div class="chart-bar" style="width:' + item.percentage + '%"' +
               ' data-color-index="' + colorIndex + '">' +
          '</div>' +
        '</div>' +
        '<div class="chart-bar-value">' +
          formatIDR(item.amount) +
          '<br><span style="color:var(--color-text-muted)">' +
            item.percentage.toFixed(1) + '%' +
          '</span>' +
        '</div>' +
      '</div>';
  }

  // Legend
  html += '<div class="chart-legend">';
  for (var j = 0; j < chartData.length; j++) {
    var item = chartData[j];
    var colorIndex = (j % 14) + 1;
    html +=
      '<div class="chart-legend-item">' +
        '<div class="chart-legend-dot" data-color-index="' + colorIndex + '"></div>' +
        '<div>' +
          '<span>' + item.category + '</span>' +
          '<span style="color:var(--color-text-muted); margin-left:4px;">' +
            item.percentage.toFixed(1) + '%' +
          '</span>' +
        '</div>' +
      '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

// ============================================================
// SECTION 9: EVENT HANDLERS
// ============================================================

/**
 * Handles form submission for adding a new transaction.
 * Requirement: 1.1, 1.3, 1.4, 1.5
 *
 * - Prevents default form submission
 * - Gets form values: amount, type, category, date, description
 * - Calls validateTransaction() and checks errors.length
 * - If invalid: loops through errors and calls showError() for each field
 * - If valid: creates Transaction object with ID = 'txn_' + Date.now()
 * - Pushes to AppState.transactions, calls saveTransactions(), calls renderAll()
 * - Resets form fields after successful save
 */
function handleAddTransaction(event) {
  event.preventDefault();

  // Get form values
  var form = event.target;
  var amount = form.amount.value;
  var type = form.querySelector('input[name="type"]:checked').value;
  var category = form.querySelector('#transaction-category').value;
  var date = form.date.value;
  var description = form.description.value;

  // Create formData object for validation
  var formData = {
    amount: amount,
    type: type,
    category: category,
    date: date,
    description: description
  };

  // Validate transaction
  var validation = validateTransaction(formData);
  var errors = validation.errors;

  if (errors.length > 0) {
    // Display errors for each invalid field
    for (var i = 0; i < errors.length; i++) {
      var error = errors[i];
      // Determine which field this error corresponds to
      if (error.indexOf('Jumlah') !== -1) {
        showError('amount-error', error);
      } else if (error.indexOf('kategori') !== -1) {
        showError('category-error', error);
      } else if (error.indexOf('Tanggal') !== -1) {
        showError('date-error', error);
      }
    }
    return;
  }

  // Create Transaction object with unique ID
  var transaction = {
    id: 'txn_' + Date.now(),
    amount: Number(amount),
    type: type,
    category: category,
    date: date,
    description: description
  };

  // Add toAppState and save
  AppState.transactions.push(transaction);
  saveTransactions();
  renderAll();

  // Reset form fields
  form.reset();
}

/**
 * Handles adding a new custom category.
 * Requirement: 5.2, 5.3, 5.4, 5.6
 *
 * - Prevents default form submission
 * - Gets category name from form input
 * - Calls validateCategoryName() with existing categories
 * - If invalid: calls showError() for the field
 * - If valid: pushes to AppState.categories, calls saveCategories(), calls renderAll()
 * - Resets form field after successful save
 */
function handleAddCategory(event) {
  event.preventDefault();
  
  var input = document.getElementById('new-category');
  var errorEl = document.getElementById('category-name-error');
  
  if (!input) return;
  
  var categoryName = input.value;
  
  // Validate category name
  var validation = validateCategoryName(categoryName, AppState.categories);
  
  if (!validation.valid) {
    showError('category-name-error', validation.error);
    return;
  }
  
  // Clear any existing error
  clearError('category-name-error');
  
  // Add to AppState.categories
  AppState.categories.push(categoryName);
  
  // Save to localStorage
  saveCategories();
  
  // Re-render UI
  renderAll();
  
  // Reset form field
  input.value = '';
}

// ============================================================
// SECTION 10: INITIALIZATION
// ============================================================

/**
 * Applies theme to the application.
 * Uses AppState.theme if set, otherwise falls back to system preference (prefers-color-scheme).
 * Requirement: 7.4, 7.5
 *
 * @param {'light'|'dark'} [theme] - Optional theme to force
 */
function applyTheme(theme) {
  var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var activeTheme = theme || (AppState.theme || (systemPrefersDark ? 'dark' : 'light'));
  
  AppState.theme = activeTheme;
  document.body.setAttribute('data-theme', activeTheme);
}

/**
 * Initializes the application.
 * Calls checkLocalStorageAvailable(), loads from storage, applies theme,
 * sets up all event listeners, and renders initial UI.
 * Requirement: 7.4, 7.5, 8.2, 8.3
 */
function init() {
  // 1. Check localStorage availability and show banner if needed
  checkLocalStorageAvailable();

  // 2. Load data from localStorage into AppState
  loadFromStorage();

  // 3. Apply theme: use AppState.theme if set, otherwise fallback to prefers-color-scheme
  applyTheme();

  // 4. Set up event listeners

  // Transaction form submit
  var transactionForm = document.getElementById('transaction-form');
  if (transactionForm) {
    transactionForm.addEventListener('submit', handleAddTransaction);
  }

  // Category form submit
  var categoryForm = document.getElementById('category-form');
  if (categoryForm) {
    categoryForm.addEventListener('submit', handleAddCategory);
  }

  // Event delegation: delete transaction buttons
  // Attach to the container that holds transaction items
  var transactionListContainer = document.getElementById('transaction-list-container');
  if (transactionListContainer) {
    transactionListContainer.addEventListener('click', function(event) {
      // Find the closest delete button ancestor
      var deleteBtn = event.target.closest('.transaction-delete');
      if (deleteBtn) {
        // Find the closest transaction item to get the ID
        var item = deleteBtn.closest('.transaction-item');
        if (item) {
          var id = item.dataset.id;
          if (id) {
            handleDeleteTransaction(id);
          }
        }
      }
    });
  }

  // Event delegation: delete category buttons
  // Attach to the container that holds category items
  var categoryListContainer = document.getElementById('category-list-container');
  if (categoryListContainer) {
    categoryListContainer.addEventListener('click', function(event) {
      // Find the closest delete button ancestor
      var deleteBtn = event.target.closest('[data-delete-category]');
      if (deleteBtn) {
        var categoryName = deleteBtn.dataset.deleteCategory;
        if (categoryName) {
          handleDeleteCategory(categoryName);
        }
      }
    });
  }

  // Theme toggle button click
  var themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', handleThemeToggle);
  }

  // Navigation tab clicks (event delegation on nav-bar)
  var navBar = document.getElementById('nav-bar');
  if (navBar) {
    navBar.addEventListener('click', function(event) {
      var tab = event.target.closest('.nav-tab');
      if (tab) {
        var view = tab.dataset.view;
        if (view) {
          handleNavigation(view);
        }
      }
    });
  }

  // 5. Render all sections
  renderAll();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);

/**
 * Deletes a transaction by ID.
 * Filters AppState.transactions to keep only transactions where id !== given id.
 * Persists changes to localStorage then re-renders all sections.
 *
 * @param {string} id - The ID of the transaction to delete
 *
 * Requirements: 1.2
 */
function handleDeleteTransaction(id) {
  AppState.transactions = AppState.transactions.filter(function (txn) {
    return txn.id !== id;
  });
  saveTransactions();
  renderAll();
}

/**
 * Toggles the theme between 'light' and 'dark'.
 * Requirement: 7.1, 7.2, 7.3
 */
function handleThemeToggle() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', AppState.theme);
  saveTheme(AppState.theme);
}

/**
 * Navigates to the specified view.
 * Hides all sections and shows the active section.
 * Requirement: 9.3
 *
 * @param {string} view - The view to navigate to ('dashboard', 'history', 'chart', 'monthly', 'categories')
 */
function handleNavigation(view) {
  AppState.activeView = view;
  
  // Hide all sections by removing .active class
  var sections = ['dashboard', 'history', 'chart', 'monthly', 'categories'];
  for (var i = 0; i < sections.length; i++) {
    var sectionEl = document.getElementById('section-' + sections[i]);
    if (sectionEl) {
      sectionEl.classList.remove('active');
    }
  }
  
  // Show the active section by adding .active class
  var activeSectionEl = document.getElementById('section-' + view);
  if (activeSectionEl) {
    activeSectionEl.classList.add('active');
  }
}

/**
 * Handles deletion of a custom category.
 * Requirement 5.5
 *
 * - Shows a confirmation dialog in Indonesian
 * - If confirmed:
 *   - Changes all transactions using this category to "Lain-lain"
 *   - Removes the category from AppState.categories
 *   - Persists changes via saveTransactions() and saveCategories()
 *   - Re-renders the UI via renderAll()
 *
 * @param {string} name - The name of the category to delete
 */
function handleDeleteCategory(name) {
  var confirmMessage =
    "Apakah Anda yakin ingin menghapus kategori '" + name + "'? " +
    "Semua transaksi yang menggunakan kategori ini akan dipindahkan ke 'Lain-lain'.";
  
  if (!window.confirm(confirmMessage)) {
    return;
  }

  // Update transactions: change category to "Lain-lain"
  for (var i = 0; i < AppState.transactions.length; i++) {
    if (AppState.transactions[i].category === name) {
      AppState.transactions[i].category = 'Lain-lain';
    }
  }

  // Remove category from categories array
  var filteredCategories = [];
  for (var j = 0; j < AppState.categories.length; j++) {
    if (AppState.categories[j] !== name) {
      filteredCategories.push(AppState.categories[j]);
    }
  }
  AppState.categories = filteredCategories;

  // Persist and re-render
  saveTransactions();
  saveCategories();
  renderAll();
}
