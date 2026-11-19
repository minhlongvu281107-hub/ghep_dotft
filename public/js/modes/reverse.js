/**
 * Chế độ Nối Ngược
 * Cho trước hình ảnh trang bị hoàn chỉnh, hỏi người chơi cần 2 nguyên liệu nào để ghép thành
 */
class ReverseMode {
  constructor() {
    this.container = document.getElementById('reverse-mode-view');
    this.currentItem = null;
    this.selectedComponents = []; // [compId, compId]
    this.streak = 0;
    this.questionCount = 0;
    
    this.initElements();
  }

  initElements() {
    this.targetCard = document.getElementById('reverse-target-card');
    this.slotA = document.getElementById('reverse-slot-a');
    this.slotB = document.getElementById('reverse-slot-b');
    this.componentsTray = document.getElementById('reverse-components-tray');
    this.feedbackEl = document.getElementById('reverse-feedback');
    this.nextBtn = document.getElementById('reverse-next-btn');
    this.resetPickBtn = document.getElementById('reverse-reset-pick');

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        window.soundManager.playClick();
        this.nextQuestion();
      });
    }

    if (this.resetPickBtn) {
      this.resetPickBtn.addEventListener('click', () => {
        window.soundManager.playClick();
        this.clearSelection();
      });
    }
  }

  start() {
    this.questionCount = 0;
    this.renderComponentsTray();
    this.nextQuestion();
  }

  renderComponentsTray() {
    if (!this.componentsTray) return;
    const comps = window.dataManager.getAllComponents();
    this.componentsTray.innerHTML = '';

    comps.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'reverse-comp-btn notebook-card';
      btn.dataset.id = c.id;
      btn.innerHTML = `
        <img src="${c.icon}" alt="${c.name_vi}" />
        <span class="comp-btn-name">${c.name_vi}</span>
      `;

      btn.addEventListener('click', () => {
        if (this.isAnswered) return;
        this.handleSelectComponent(c.id);
      });

      this.componentsTray.appendChild(btn);
    });
  }

  nextQuestion() {
    this.isAnswered = false;
    this.clearSelection();
    this.feedbackEl.innerHTML = '';
    this.feedbackEl.className = 'reverse-feedback';
    this.nextBtn.style.display = 'none';

    const allItems = window.dataManager.getAllItems();
    if (!allItems || allItems.length === 0) return;

    this.questionCount++;
    // Chọn ngẫu nhiên 1 món đồ
    this.currentItem = allItems[Math.floor(Math.random() * allItems.length)];

    // Cập nhật thẻ mục tiêu
    this.targetCard.innerHTML = `
      <div class="target-badge">Mục tiêu #${this.questionCount}</div>
      <div class="target-icon">
        <img src="${this.currentItem.icon}" alt="${this.currentItem.name_vi}" />
      </div>
      <h2 class="target-name">${this.currentItem.name_vi}</h2>
      <div class="target-en">${this.currentItem.name_en}</div>
      <div class="target-stats">${this.currentItem.stats || ''}</div>
      <p class="target-hint">👉 Hãy chọn 2 nguyên liệu bên dưới để ghép thành trang bị này!</p>
    `;
  }

  clearSelection() {
    this.selectedComponents = [];
    this.updateSlots();
  }

  updateSlots() {
    // Slot A
    if (this.selectedComponents[0]) {
      const compA = window.dataManager.getComponent(this.selectedComponents[0]);
      this.slotA.innerHTML = `
        <img src="${compA.icon}" alt="${compA.name_vi}" />
        <span>${compA.name_vi}</span>
      `;
      this.slotA.classList.add('filled');
    } else {
      this.slotA.innerHTML = `<span class="slot-placeholder">Mảnh 1</span>`;
      this.slotA.classList.remove('filled');
    }

    // Slot B
    if (this.selectedComponents[1]) {
      const compB = window.dataManager.getComponent(this.selectedComponents[1]);
      this.slotB.innerHTML = `
        <img src="${compB.icon}" alt="${compB.name_vi}" />
        <span>${compB.name_vi}</span>
      `;
      this.slotB.classList.add('filled');
    } else {
      this.slotB.innerHTML = `<span class="slot-placeholder">Mảnh 2</span>`;
      this.slotB.classList.remove('filled');
    }
  }

  handleSelectComponent(compId) {
    if (this.selectedComponents.length >= 2) {
      // Đã chọn đủ 2 thì xóa chọn lại từ đầu
      this.selectedComponents = [compId];
    } else {
      this.selectedComponents.push(compId);
    }

    window.soundManager.playConnect();
    this.updateSlots();

    if (this.selectedComponents.length === 2) {
      this.checkAnswer();
    }
  }

  checkAnswer() {
    this.isAnswered = true;
    const [c1, c2] = this.selectedComponents;
    const expected = this.currentItem.recipe;

    const isMatch = (
      (c1 === expected[0] && c2 === expected[1]) ||
      (c1 === expected[1] && c2 === expected[0])
    );

    const compExpected1 = window.dataManager.getComponent(expected[0]);
    const compExpected2 = window.dataManager.getComponent(expected[1]);

    if (isMatch) {
      window.soundManager.playSuccess();
      window.app.addScore(100);
      window.app.increaseStreak();
      window.dataManager.recordAnswer(this.currentItem.id, true);

      this.feedbackEl.className = 'reverse-feedback correct';
      this.feedbackEl.innerHTML = `
        <div class="feedback-badge">🎉 CHÍNH XÁC!</div>
        <p><strong>${this.currentItem.name_vi}</strong> = <strong>${compExpected1.name_vi}</strong> + <strong>${compExpected2.name_vi}</strong></p>
        <div class="feedback-mnemonic">💡 <em>${this.currentItem.mnemonic || ''}</em></div>
      `;
    } else {
      window.soundManager.playError();
      window.app.resetStreak();
      window.dataManager.recordAnswer(this.currentItem.id, false);

      this.feedbackEl.className = 'reverse-feedback wrong';
      this.feedbackEl.innerHTML = `
        <div class="feedback-badge">❌ CHƯA ĐÚNG RỒI!</div>
        <p>Công thức chuẩn của <strong>${this.currentItem.name_vi}</strong> là:</p>
        <div class="correct-formula-box">
          <img src="${compExpected1.icon}" /> ${compExpected1.name_vi}
          + 
          <img src="${compExpected2.icon}" /> ${compExpected2.name_vi}
        </div>
        <div class="feedback-mnemonic">💡 Mẹo nhớ: <em>${this.currentItem.mnemonic || ''}</em></div>
      `;
    }

    this.nextBtn.style.display = 'inline-block';
  }
}

window.reverseMode = new ReverseMode();

