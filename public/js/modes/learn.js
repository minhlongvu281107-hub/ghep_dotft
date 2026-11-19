/**
 * Chế độ Học (Bảng tra cứu công thức)
 * - Lưới 10 nguyên liệu cơ bản, chọn nguyên liệu để xem toàn bộ đồ ghép được từ nó
 * - Ô tìm kiếm thông minh theo tên tiếng Việt, tiếng Anh hoặc từ khóa chỉ số
 * - Bộ lọc danh mục: Sát thương AD, Sát thương AP, Chống chịu, Hỗ trợ, Ấn Tộc Hệ
 */
class LearnMode {
  constructor() {
    this.container = document.getElementById('learn-mode-view');
    this.selectedComponent = 'all'; // 'all' hoặc id nguyên liệu
    this.searchQuery = '';
    this.activeCategory = 'all';
    
    this.initElements();
  }

  initElements() {
    this.compBar = document.getElementById('learn-comp-bar');
    this.searchInput = document.getElementById('learn-search-input');
    this.categoryFilters = document.getElementById('learn-category-filters');
    this.itemsGrid = document.getElementById('learn-items-grid');
    this.resultsCount = document.getElementById('learn-results-count');

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.renderItems();
      });
    }

    if (this.categoryFilters) {
      this.categoryFilters.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-chip');
        if (!btn) return;
        window.soundManager.playClick();
        this.categoryFilters.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.dataset.category;
        this.renderItems();
      });
    }
  }

  init() {
    this.renderComponentBar();
    this.renderItems();
  }

  renderComponentBar() {
    if (!this.compBar) return;
    const comps = window.dataManager.getAllComponents();
    this.compBar.innerHTML = '';

    // Nút "Tất cả"
    const allBtn = document.createElement('button');
    allBtn.className = `comp-pill ${this.selectedComponent === 'all' ? 'active' : ''}`;
    allBtn.innerHTML = `<span>🌟</span> <span>Tất cả</span>`;
    allBtn.addEventListener('click', () => {
      window.soundManager.playClick();
      this.selectedComponent = 'all';
      this.updateActiveCompPill();
      this.renderItems();
    });
    this.compBar.appendChild(allBtn);

    // 10 Nguyên liệu
    comps.forEach(c => {
      const btn = document.createElement('button');
      btn.className = `comp-pill ${this.selectedComponent === c.id ? 'active' : ''}`;
      btn.dataset.id = c.id;
      btn.innerHTML = `
        <img src="${c.icon}" alt="${c.name_vi}" />
        <span>${c.name_vi}</span>
      `;
      btn.addEventListener('click', () => {
        window.soundManager.playClick();
        if (this.selectedComponent === c.id) {
          this.selectedComponent = 'all'; // toggle bỏ chọn
        } else {
          this.selectedComponent = c.id;
        }
        this.updateActiveCompPill();
        this.renderItems();
      });
      this.compBar.appendChild(btn);
    });
  }

  updateActiveCompPill() {
    const pills = this.compBar.querySelectorAll('.comp-pill');
    pills.forEach(p => {
      if (this.selectedComponent === 'all' && !p.dataset.id) {
        p.classList.add('active');
      } else if (p.dataset.id === this.selectedComponent) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  renderItems() {
    if (!this.itemsGrid) return;
    let items = window.dataManager.getAllItems();

    // Lọc theo nguyên liệu được chọn
    if (this.selectedComponent !== 'all') {
      items = items.filter(it => it.recipe && it.recipe.includes(this.selectedComponent));
    }

    // Lọc theo danh mục
    if (this.activeCategory !== 'all') {
      if (this.activeCategory === 'damage_ad') {
        items = items.filter(it => it.category === 'damage_ad');
      } else if (this.activeCategory === 'damage_ap') {
        items = items.filter(it => it.category === 'damage_ap');
      } else if (this.activeCategory === 'tank') {
        items = items.filter(it => it.category === 'tank');
      } else if (this.activeCategory === 'utility') {
        items = items.filter(it => it.category === 'utility');
      }
    }

    // Lọc theo ô tìm kiếm
    if (this.searchQuery) {
      items = items.filter(it => {
        const text = `${it.name_vi} ${it.name_en} ${it.stats || ''} ${it.passive || ''} ${it.mnemonic || ''}`.toLowerCase();
        return text.includes(this.searchQuery);
      });
    }

    // Cập nhật số lượng
    if (this.resultsCount) {
      this.resultsCount.textContent = `Hiển thị ${items.length} trang bị`;
    }

    this.itemsGrid.innerHTML = '';

    if (items.length === 0) {
      this.itemsGrid.innerHTML = `
        <div class="empty-state">
          <p>🔍 Không tìm thấy trang bị nào phù hợp với bộ lọc hiện tại.</p>
          <button class="notebook-btn" onclick="window.learnMode.resetFilters()">Xóa bộ lọc</button>
        </div>
      `;
      return;
    }

    items.forEach(it => {
      const card = document.createElement('div');
      card.className = 'learn-card notebook-card';

      // Lấy 2 nguyên liệu
      const compA = it.recipe && it.recipe[0] ? window.dataManager.getComponent(it.recipe[0]) : null;
      const compB = it.recipe && it.recipe[1] ? window.dataManager.getComponent(it.recipe[1]) : null;

      card.innerHTML = `
        <div class="learn-header">
          <div class="learn-thumb">
            <img src="${it.icon}" alt="${it.name_vi}" loading="lazy" />
          </div>
          <div class="learn-title-block">
            <h3 class="learn-name-vi">${it.name_vi}</h3>
            <span class="learn-name-en">${it.name_en}</span>
          </div>
        </div>

        <!-- Công thức dạng hình ảnh A + B = Kết quả -->
        <div class="recipe-visual">
          <div class="recipe-comp" title="${compA ? compA.name_vi : ''}">
            ${compA ? `<img src="${compA.icon}" alt="${compA.name_vi}" />` : ''}
          </div>
          <span class="recipe-plus">+</span>
          <div class="recipe-comp" title="${compB ? compB.name_vi : ''}">
            ${compB ? `<img src="${compB.icon}" alt="${compB.name_vi}" />` : ''}
          </div>
          <span class="recipe-equals">=</span>
          <div class="recipe-result" title="${it.name_vi}">
            <img src="${it.icon}" alt="${it.name_vi}" />
          </div>
        </div>

        <div class="learn-stats">
          <strong>Chỉ số:</strong> ${it.stats || 'Đặc biệt'}
        </div>

        <div class="learn-desc-snippet">
          ${it.passive ? it.passive.substring(0, 110) + '...' : ''}
        </div>

        <button class="learn-detail-btn notebook-btn small-btn">
          📖 Xem chi tiết & Mẹo nhớ
        </button>
      `;

      card.querySelector('.learn-detail-btn').addEventListener('click', () => {
        window.soundManager.playClick();
        window.app.showItemDetailModal(it);
      });

      this.itemsGrid.appendChild(card);
    });
  }

  resetFilters() {
    this.selectedComponent = 'all';
    this.searchQuery = '';
    this.activeCategory = 'all';
    if (this.searchInput) this.searchInput.value = '';
    if (this.categoryFilters) {
      this.categoryFilters.querySelectorAll('.cat-chip').forEach((b, i) => {
        b.classList.toggle('active', i === 0);
      });
    }
    this.updateActiveCompPill();
    this.renderItems();
  }
}

window.learnMode = new LearnMode();

