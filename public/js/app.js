/**
 * Ứng dụng Ghép Đồ TFT Mùa 18 (Enchanted Wilds)
 * Điều phối chính: Chuyển đổi tab, điểm số, chuỗi thắng, Modal flashcard giải thích
 */
class App {
  constructor() {
    this.currentTab = 'match';
    this.score = 0;
    this.streak = 0;
    this.maxStreak = parseInt(localStorage.getItem('tft_max_streak') || '0', 10);
    this.initElements();
  }

  async start() {
    console.log('[App] Khởi động ứng dụng Ghép Đồ TFT...');
    const loaded = await window.dataManager.init();
    if (!loaded) {
      alert('Không thể tải dữ liệu trang bị. Vui lòng thử tải lại trang!');
      return;
    }

    this.updateScoreUI();
    this.updateSoundBtnUI();

    // Khởi tạo các chế độ
    window.matchMode.startStage(1);
    window.learnMode.init();

    // Xử lý chuyển tab
    this.initTabNavigation();
    this.initModalEvents();
  }

  initElements() {
    this.scoreEl = document.getElementById('hud-score');
    this.streakEl = document.getElementById('hud-streak');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.modalOverlay = document.getElementById('flashcard-modal');
    this.modalContent = document.getElementById('modal-card-body');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const muted = window.soundManager.toggleMute();
        this.updateSoundBtnUI();
        if (!muted) window.soundManager.playSuccess();
      });
    }
  }

  updateSoundBtnUI() {
    if (!this.soundToggleBtn) return;
    const muted = window.soundManager.isMuted();
    this.soundToggleBtn.innerHTML = muted ? '🔇 Âm thanh: Tắt' : '🔊 Âm thanh: Bật';
    this.soundToggleBtn.classList.toggle('muted', muted);
  }

  initTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        window.soundManager.playClick();
        const tabTarget = btn.dataset.tab;
        this.switchTab(tabTarget);
      });
    });
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Cập nhật nút tab
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    // Cập nhật các view
    document.querySelectorAll('.mode-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById(`${tabName}-mode-view`);
    if (activeView) {
      activeView.classList.add('active');
    }

    // Kích hoạt logic tương ứng
    if (tabName === 'match') {
      window.matchMode.redrawAllCompletedLines();
    } else if (tabName === 'learn') {
      window.learnMode.renderItems();
    } else if (tabName === 'reverse') {
      window.reverseMode.start();
    } else if (tabName === 'review') {
      window.reviewMode.render();
    }
  }

  // Quản lý Điểm & Chuỗi thắng
  addScore(points) {
    this.score += points;
    this.updateScoreUI();
  }

  increaseStreak() {
    this.streak++;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
      localStorage.setItem('tft_max_streak', this.maxStreak.toString());
    }
    this.updateScoreUI();
  }

  resetStreak() {
    this.streak = 0;
    this.updateScoreUI();
  }

  updateScoreUI() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.streakEl) {
      this.streakEl.textContent = this.streak;
      if (this.streak >= 3) {
        this.streakEl.parentElement.classList.add('on-fire');
      } else {
        this.streakEl.parentElement.classList.remove('on-fire');
      }
    }
  }

  // --- Modal Flashcard giải thích chi tiết từng trang bị ---
  initModalEvents() {
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }

    // Phím Esc đóng modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('show');
    }
  }

  showItemDetailModal(item) {
    if (!item || !this.modalContent) return;

    const compA = item.recipe && item.recipe[0] ? window.dataManager.getComponent(item.recipe[0]) : null;
    const compB = item.recipe && item.recipe[1] ? window.dataManager.getComponent(item.recipe[1]) : null;

    let whenToUseHtml = '';
    if (item.when_to_use && Array.isArray(item.when_to_use)) {
      whenToUseHtml = `
        <ul class="modal-list">
          ${item.when_to_use.map(point => `<li>${point}</li>`).join('')}
        </ul>
      `;
    }

    this.modalContent.innerHTML = `
      <div class="modal-card notebook-card">
        <div class="modal-header-row">
          <div class="modal-thumb">
            <img src="${item.icon}" alt="${item.name_vi}" />
          </div>
          <div class="modal-title-box">
            <span class="modal-tag">Trang bị Hoàn Chỉnh</span>
            <h2>${item.name_vi}</h2>
            <div class="modal-en">${item.name_en}</div>
          </div>
        </div>

        <!-- Công thức ghép dạng trực quan -->
        <div class="modal-recipe-bar">
          <div class="m-comp">
            ${compA ? `<img src="${compA.icon}" /> <span>${compA.name_vi}</span>` : 'Mảnh 1'}
          </div>
          <span class="m-plus">+</span>
          <div class="m-comp">
            ${compB ? `<img src="${compB.icon}" /> <span>${compB.name_vi}</span>` : 'Mảnh 2'}
          </div>
          <span class="m-equals">=</span>
          <div class="m-result">
            <img src="${item.icon}" /> <span>${item.name_vi}</span>
          </div>
        </div>

        <div class="modal-section">
          <h4>📊 Chỉ số cơ bản:</h4>
          <p class="modal-stats-text">${item.stats || 'Không có chỉ số cộng thêm.'}</p>
        </div>

        <div class="modal-section">
          <h4>💡 Nội tại (Nói dễ hiểu cho người mới):</h4>
          <p class="modal-passive-text">${item.passive || 'Không có hiệu ứng nội tại.'}</p>
        </div>

        <div class="modal-section">
          <h4>🎯 Khi nào nên dùng:</h4>
          ${whenToUseHtml}
        </div>

        ${item.mnemonic ? `
          <div class="modal-section modal-mnemonic-box">
            <h4>🧠 Mẹo nhớ công thức vui:</h4>
            <div class="mnemonic-quote">"${item.mnemonic}"</div>
          </div>
        ` : ''}

        <div class="modal-disclaimer">
          ⚠️ <em>Gợi ý mang tính tham khảo, meta thay đổi theo patch.</em>
        </div>

        <div class="modal-action-row">
          <button class="notebook-btn" onclick="window.app.closeModal()">Đã hiểu, đóng lại</button>
        </div>
      </div>
    `;

    this.modalOverlay.classList.add('show');
  }

  // Modal tổng kết khi qua màn
  showStageSummaryModal(itemsJustSolved, stageNumber, onNextStage) {
    if (!this.modalContent) return;

    this.modalContent.innerHTML = `
      <div class="modal-card notebook-card summary-card">
        <div class="summary-celebrate">
          <div class="crown-icon">👑🎉🌟</div>
          <h2>XUẤT SẮC! HOÀN THÀNH MÀN ${stageNumber}!</h2>
          <p class="summary-subtitle">Bạn đã ghép thành công ${itemsJustSolved.length} trang bị sau đây. Hãy đọc nhanh để ghi nhớ kiến thức nhé:</p>
        </div>

        <div class="summary-items-list">
          ${itemsJustSolved.map(it => {
            const cA = window.dataManager.getComponent(it.recipe[0]);
            const cB = window.dataManager.getComponent(it.recipe[1]);
            return `
              <div class="summary-item-row notebook-card">
                <img class="summary-row-icon" src="${it.icon}" />
                <div class="summary-row-info">
                  <strong>${it.name_vi} (${it.name_en})</strong>
                  <div class="summary-row-recipe">
                    Ghép từ: <img src="${cA.icon}" /> ${cA.name_vi} + <img src="${cB.icon}" /> ${cB.name_vi}
                  </div>
                  <div class="summary-row-desc">${it.passive ? it.passive.substring(0, 95) + '...' : ''}</div>
                  <div class="summary-row-tip">💡 <em>${it.mnemonic || ''}</em></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="modal-action-row">
          <button id="modal-next-stage-btn" class="notebook-btn primary-btn large-btn">
            Tiếp Tục Màn ${stageNumber + 1} ➡️
          </button>
        </div>
      </div>
    `;

    document.getElementById('modal-next-stage-btn').addEventListener('click', () => {
      this.closeModal();
      if (onNextStage) onNextStage();
    });

    this.modalOverlay.classList.add('show');
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.start();
});

