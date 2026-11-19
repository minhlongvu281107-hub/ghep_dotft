/**
 * Chế độ Ôn Tập (Spaced Repetition)
 * - Tự động ưu tiên những món đồ người chơi hay nối sai nhất từ LocalStorage
 * - Thống kê tiến độ học tập và bài luyện tập tập trung
 */
class ReviewMode {
  constructor() {
    this.container = document.getElementById('review-mode-view');
    this.initElements();
  }

  initElements() {
    this.statsSummary = document.getElementById('review-stats-summary');
    this.itemsList = document.getElementById('review-items-list');
    this.startQuizBtn = document.getElementById('review-start-quiz-btn');
    this.clearStatsBtn = document.getElementById('review-clear-stats-btn');

    if (this.clearStatsBtn) {
      this.clearStatsBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ lịch sử câu sai không?')) {
          window.dataManager.clearStats();
          this.render();
        }
      });
    }

    if (this.startQuizBtn) {
      this.startQuizBtn.addEventListener('click', () => {
        window.soundManager.playClick();
        this.startReviewQuiz();
      });
    }
  }

  render() {
    const stats = window.dataManager.stats;
    const mistakeItems = window.dataManager.getTopMistakeItems(12);

    let totalMistakes = 0;
    Object.values(stats.mistakes).forEach(v => totalMistakes += v);
    let totalCorrect = 0;
    Object.values(stats.correct).forEach(v => totalCorrect += v);
    const totalAns = stats.totalAnswered || (totalMistakes + totalCorrect);
    const accRate = totalAns > 0 ? Math.round((totalCorrect / totalAns) * 100) : 100;

    // Render tóm tắt
    if (this.statsSummary) {
      this.statsSummary.innerHTML = `
        <div class="stat-pill">
          <span class="stat-num">${totalAns}</span>
          <span class="stat-lbl">Tổng số câu đã làm</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num ${accRate >= 80 ? 'good' : 'warning'}">${accRate}%</span>
          <span class="stat-lbl">Độ chính xác</span>
        </div>
        <div class="stat-pill">
          <span class="stat-num text-danger">${totalMistakes}</span>
          <span class="stat-lbl">Số lần nối sai</span>
        </div>
      `;
    }

    // Render danh sách món cần ôn tập
    if (this.itemsList) {
      this.itemsList.innerHTML = '';

      if (mistakeItems.length === 0) {
        this.itemsList.innerHTML = `
          <div class="empty-state">
            <p>🎉 Tuyệt vời! Bạn chưa từng ghép sai món nào cả.</p>
            <p>Hãy qua chế độ <strong>Nối Ảnh</strong> hoặc <strong>Nối Ngược</strong> để thử sức thêm nhé!</p>
          </div>
        `;
        return;
      }

      mistakeItems.forEach(item => {
        const mistakeCount = stats.mistakes[item.id] || 0;
        const compA = window.dataManager.getComponent(item.recipe[0]);
        const compB = window.dataManager.getComponent(item.recipe[1]);

        const card = document.createElement('div');
        card.className = 'review-card notebook-card';
        card.innerHTML = `
          <div class="review-card-top">
            <img class="review-icon" src="${item.icon}" alt="${item.name_vi}" />
            <div class="review-info">
              <h4>${item.name_vi}</h4>
              <span class="review-en">${item.name_en}</span>
              ${mistakeCount > 0 ? `<span class="mistake-badge">⚠️ Đã sai ${mistakeCount} lần</span>` : `<span class="recommend-badge">⭐ Đồ quan trọng cần nhớ</span>`}
            </div>
          </div>

          <div class="recipe-visual mini-recipe">
            <img src="${compA.icon}" title="${compA.name_vi}" />
            <span>+</span>
            <img src="${compB.icon}" title="${compB.name_vi}" />
            <span>=</span>
            <img src="${item.icon}" title="${item.name_vi}" />
          </div>

          <div class="review-mnemonic">
            <em>💡 ${item.mnemonic || 'Ghi nhớ công thức thật kỹ nhé!'}</em>
          </div>

          <button class="notebook-btn small-btn review-btn-learn">
            📖 Xem thẻ giải thích chi tiết
          </button>
        `;

        card.querySelector('.review-btn-learn').addEventListener('click', () => {
          window.soundManager.playClick();
          window.app.showItemDetailModal(item);
        });

        this.itemsList.appendChild(card);
      });
    }
  }

  startReviewQuiz() {
    // Chuyển sang Nối Ngược với các câu hỏi lấy từ danh sách sai
    window.app.switchTab('reverse');
  }
}

window.reviewMode = new ReviewMode();

