/**
 * Quản lý dữ liệu trang bị và bộ nhớ học tập (Spaced Repetition / LocalStorage)
 */
class DataManager {
  constructor() {
    this.metadata = null;
    this.components = [];
    this.items = [];
    this.itemsMap = new Map();
    this.recipeMap = new Map(); // key: "compA+compB" (sorted) -> item
    this.storageKey = 'tft_learning_stats_v1';
    this.stats = this.loadStats();
  }

  loadDataPayload(data) {
    this.metadata = data.metadata;
    this.components = data.components || [];
    this.items = data.items || [];

    // Lập bản đồ tra cứu nhanh
    this.itemsMap.clear();
    this.recipeMap.clear();

    this.components.forEach(c => {
      this.itemsMap.set(c.id, c);
    });

    this.items.forEach(it => {
      this.itemsMap.set(it.id, it);
      if (it.recipe && it.recipe.length === 2) {
        const key = this.getRecipeKey(it.recipe[0], it.recipe[1]);
        this.recipeMap.set(key, it);
      }
    });

    console.log(`[DataManager] Đã tải thành công ${this.components.length} nguyên liệu và ${this.items.length} trang bị.`);
  }

  async init() {
    // 1. Ưu tiên dữ liệu nạp sẵn từ script data/items-data.js (chạy mượt khi mở file:// trực tiếp)
    if (window.TFT_ITEMS_DATA) {
      this.loadDataPayload(window.TFT_ITEMS_DATA);
      return true;
    }

    // 2. Dự phòng bằng fetch khi chạy trên Web Server (HTTP/HTTPS)
    try {
      const resp = await fetch('data/items.json');
      if (resp.ok) {
        const data = await resp.json();
        this.loadDataPayload(data);
        return true;
      }
    } catch (err) {
      console.warn('[DataManager] Không thể fetch dữ liệu qua HTTP:', err);
    }

    return false;
  }

  getRecipeKey(compA, compB) {
    return [compA, compB].sort().join('+');
  }

  getItem(id) {
    return this.itemsMap.get(id);
  }

  getComponent(id) {
    return this.components.find(c => c.id === id);
  }

  getAllComponents() {
    return this.components;
  }

  getAllItems() {
    return this.items;
  }

  // Tìm trang bị ghép từ 2 nguyên liệu
  findItemByRecipe(compA, compB) {
    const key = this.getRecipeKey(compA, compB);
    return this.recipeMap.get(key) || null;
  }

  // Lấy tất cả đồ có thể ghép từ 1 nguyên liệu
  getItemsByComponent(compId) {
    return this.items.filter(it => it.recipe && it.recipe.includes(compId));
  }

  // --- Quản lý thống kê học tập (Spaced Repetition) ---
  loadStats() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : { mistakes: {}, correct: {}, totalAnswered: 0 };
    } catch (e) {
      return { mistakes: {}, correct: {}, totalAnswered: 0 };
    }
  }

  saveStats() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.stats));
    } catch (e) {
      console.error('Không thể lưu stats vào localStorage', e);
    }
  }

  recordAnswer(itemId, isCorrect) {
    if (!this.stats.mistakes[itemId]) this.stats.mistakes[itemId] = 0;
    if (!this.stats.correct[itemId]) this.stats.correct[itemId] = 0;
    this.stats.totalAnswered++;

    if (isCorrect) {
      this.stats.correct[itemId]++;
    } else {
      this.stats.mistakes[itemId]++;
    }
    this.saveStats();
  }

  // Lấy danh sách các món người chơi hay sai nhất để ôn tập
  getTopMistakeItems(limit = 10) {
    const mistakeEntries = Object.entries(this.stats.mistakes)
      .filter(([id, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    const result = mistakeEntries
      .map(([id]) => this.getItem(id))
      .filter(Boolean);

    // Nếu người chơi chưa làm sai nhiều, bổ sung các món khó nhớ (như Trượng Hư Vô, Trái Tim Kiên Định, Nanh Nashor...)
    if (result.length < limit) {
      const priorityIds = ['void_staff', 'steadfast_heart', 'nashors_tooth', 'red_buff', 'evenshroud', 'crownguard', 'adaptive_helm'];
      for (const pid of priorityIds) {
        const it = this.getItem(pid);
        if (it && !result.some(r => r.id === it.id)) {
          result.push(it);
        }
        if (result.length >= limit) break;
      }
      // Nếu vẫn chưa đủ, lấy thêm từ danh sách chung
      for (const it of this.items) {
        if (!result.some(r => r.id === it.id)) {
          result.push(it);
        }
        if (result.length >= limit) break;
      }
    }

    return result.slice(0, limit);
  }

  clearStats() {
    this.stats = { mistakes: {}, correct: {}, totalAnswered: 0 };
    this.saveStats();
  }
}

window.dataManager = new DataManager();

