/**
 * Chế độ Nối Ảnh (Chế độ chính)
 * 3 Cột: Nguyên liệu 1 (Trái) | Nguyên liệu 2 (Giữa) | Đồ hoàn chỉnh (Phải)
 * Vẽ dây nối bằng SVG mượt mà, hỗ trợ cả chuột lẫn cảm ứng điện thoại
 */
class MatchMode {
  constructor() {
    this.container = document.getElementById('match-mode-view');
    this.svg = document.getElementById('match-svg-layer');
    this.stage = 1;
    this.itemsPerStage = 4; // 4-5 món mỗi màn
    this.currentItems = [];
    this.col1 = [];
    this.col2 = [];
    this.col3 = [];
    
    // Trạng thái nối hiện tại
    this.selectedCol1 = null; // { compId, element, pinX, pinY, index }
    this.selectedCol2 = null; // { compId, element, pinX, pinY, index }
    this.selectedCol3 = null; // { itemId, element, pinX, pinY, index }
    
    // Danh sách đường nối đã thành công
    this.completedCables = [];
    
    // Đường nối đang kéo dở
    this.draggingFrom = null; // { type: 'col1' | 'col2', ... }
    this.tempLine = null;
    this.tempLine2 = null;
    
    this.initEvents();
  }

  initEvents() {
    // Xử lý sự kiện kéo chuột / chạm màn hình trên toàn container
    const onPointerMove = (e) => {
      if (!this.draggingFrom) return;
      const rect = this.svg.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      if (clientX === undefined) return;

      const curX = clientX - rect.left;
      const curY = clientY - rect.top;
      this.updateTempLine(curX, curY);
    };

    const onPointerUp = (e) => {
      // Nếu thả tay ngoài vùng pin hợp lệ mà chưa hoàn thành thì hủy đường nối tạm
      if (this.draggingFrom) {
        this.clearTempLines();
        this.draggingFrom = null;
      }
    };

    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('resize', () => this.redrawAllCompletedLines());
  }

  // Khởi động màn chơi mới
  startStage(stageNumber = 1) {
    this.stage = stageNumber;
    this.clearBoard();

    // Cập nhật số lượng đồ theo màn (màn 1-2: 4 đồ, màn 3 trở đi: 5 đồ)
    this.itemsPerStage = this.stage >= 3 ? 5 : 4;

    const allItems = window.dataManager.getAllItems();
    if (!allItems || allItems.length === 0) return;

    // Chọn ngẫu nhiên itemsPerStage món đồ không trùng nhau
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    this.currentItems = shuffled.slice(0, this.itemsPerStage);

    // Chuẩn bị 3 cột
    // Cột 1: Nguyên liệu A
    // Cột 2: Nguyên liệu B
    // Cột 3: Đồ hoàn chỉnh C
    this.col1 = [];
    this.col2 = [];
    this.col3 = [];

    this.currentItems.forEach((it, idx) => {
      const [compA, compB] = it.recipe;
      // Ngẫu nhiên hoán đổi vị trí A và B cho phong phú
      const swap = Math.random() > 0.5;
      this.col1.push({
        pairId: it.id,
        compId: swap ? compB : compA,
        uniqueKey: `col1_${idx}`
      });
      this.col2.push({
        pairId: it.id,
        compId: swap ? compA : compB,
        uniqueKey: `col2_${idx}`
      });
      this.col3.push({
        itemId: it.id,
        uniqueKey: `col3_${idx}`
      });
    });

    // Trộn ngẫu nhiên từng cột để người chơi phải tìm
    this.col1.sort(() => 0.5 - Math.random());
    this.col2.sort(() => 0.5 - Math.random());
    this.col3.sort(() => 0.5 - Math.random());

    this.render();
  }

  clearBoard() {
    this.selectedCol1 = null;
    this.selectedCol2 = null;
    this.selectedCol3 = null;
    this.draggingFrom = null;
    this.completedCables = [];
    this.clearTempLines();
    this.svg.innerHTML = `
      <defs>
        <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#2ecc71" flood-opacity="0.8"/>
        </filter>
        <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#e74c3c" flood-opacity="0.8"/>
        </filter>
      </defs>
    `;
  }

  clearTempLines() {
    if (this.tempLine && this.tempLine.parentNode) {
      this.tempLine.parentNode.removeChild(this.tempLine);
    }
    this.tempLine = null;
    if (this.tempLine2 && this.tempLine2.parentNode) {
      this.tempLine2.parentNode.removeChild(this.tempLine2);
    }
    this.tempLine2 = null;
  }

  render() {
    const stageBadge = document.getElementById('match-stage-title');
    if (stageBadge) {
      stageBadge.textContent = `Màn ${this.stage} • Ghép ${this.itemsPerStage} trang bị`;
    }

    const col1El = document.getElementById('match-col-1');
    const col2El = document.getElementById('match-col-2');
    const col3El = document.getElementById('match-col-3');

    col1El.innerHTML = '';
    col2El.innerHTML = '';
    col3El.innerHTML = '';

    // Cột 1: Nguyên liệu 1
    this.col1.forEach((data, index) => {
      const comp = window.dataManager.getComponent(data.compId);
      const card = this.createCardElement(comp, 'col1', index, data.uniqueKey, true);
      col1El.appendChild(card);
    });

    // Cột 2: Nguyên liệu 2
    this.col2.forEach((data, index) => {
      const comp = window.dataManager.getComponent(data.compId);
      const card = this.createCardElement(comp, 'col2', index, data.uniqueKey, true);
      col2El.appendChild(card);
    });

    // Cột 3: Đồ hoàn chỉnh
    this.col3.forEach((data, index) => {
      const item = window.dataManager.getItem(data.itemId);
      const card = this.createCardElement(item, 'col3', index, data.uniqueKey, false);
      col3El.appendChild(card);
    });
  }

  createCardElement(item, colType, index, uniqueKey, isComponent) {
    const card = document.createElement('div');
    card.className = `match-card notebook-card ${colType}-card`;
    card.dataset.col = colType;
    card.dataset.index = index;
    card.dataset.key = uniqueKey;
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="card-pin pin-${colType}" title="Điểm nối"></div>
      <div class="card-thumb">
        <img src="${item.icon}" alt="${item.name_vi}" loading="lazy" />
      </div>
      <div class="card-label">
        <span class="name-vi">${item.name_vi}</span>
        <span class="name-en">${item.name_en}</span>
      </div>
      <div class="card-check">✓</div>
    `;

    // Điểm pin để nối
    const pin = card.querySelector('.card-pin');

    // Hỗ trợ cả chạm thẻ hoặc chạm pin
    const handleStartConnect = (e) => {
      e.stopPropagation();
      if (card.classList.contains('matched')) return;
      window.soundManager.playConnect();
      this.handleCardClick(card, colType, item.id);
    };

    card.addEventListener('click', handleStartConnect);

    // Kéo thả chuột/touch từ Pin
    const handleDragStart = (e) => {
      e.stopPropagation();
      if (card.classList.contains('matched')) return;
      window.soundManager.playConnect();
      this.startDragging(card, colType, item.id, e);
    };

    pin.addEventListener('mousedown', handleDragStart);
    pin.addEventListener('touchstart', handleDragStart, { passive: true });

    return card;
  }

  // Tọa độ trung tâm của điểm Pin so với SVG
  getPinCoords(cardEl) {
    const pin = cardEl.querySelector('.card-pin');
    const svgRect = this.svg.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    return {
      x: (pinRect.left + pinRect.width / 2) - svgRect.left,
      y: (pinRect.top + pinRect.height / 2) - svgRect.top
    };
  }

  // Xử lý chạm/click thẻ (hỗ trợ cách chơi Click-to-Connect cực dễ trên mobile)
  handleCardClick(cardEl, colType, id) {
    if (cardEl.classList.contains('matched')) return;

    if (colType === 'col1') {
      // Chọn/đổi cột 1
      if (this.selectedCol1) {
        this.selectedCol1.element.classList.remove('active-pin');
      }
      this.selectedCol1 = {
        element: cardEl,
        compId: id,
        ...this.getPinCoords(cardEl)
      };
      cardEl.classList.add('active-pin');
    } else if (colType === 'col2') {
      // Chọn/đổi cột 2
      if (this.selectedCol2) {
        this.selectedCol2.element.classList.remove('active-pin');
      }
      this.selectedCol2 = {
        element: cardEl,
        compId: id,
        ...this.getPinCoords(cardEl)
      };
      cardEl.classList.add('active-pin');
    } else if (colType === 'col3') {
      // Chọn/đổi cột 3
      if (this.selectedCol3) {
        this.selectedCol3.element.classList.remove('active-pin');
      }
      this.selectedCol3 = {
        element: cardEl,
        itemId: id,
        ...this.getPinCoords(cardEl)
      };
      cardEl.classList.add('active-pin');
    }

    // Cập nhật đường nối tạm giữa các điểm đã chọn
    this.renderSelectedPreviewLines();

    // Nếu đã chọn đủ cả 3 cột (Nguyên liệu 1 + Nguyên liệu 2 + Đồ hoàn chỉnh) -> Kiểm tra kết quả!
    if (this.selectedCol1 && this.selectedCol2 && this.selectedCol3) {
      this.validateCombination();
    }
  }

  // Kéo thả đường nối
  startDragging(cardEl, colType, id, e) {
    this.handleCardClick(cardEl, colType, id);
    this.draggingFrom = {
      cardEl,
      colType,
      id,
      coords: this.getPinCoords(cardEl)
    };
  }

  updateTempLine(curX, curY) {
    if (!this.draggingFrom) return;
    const start = this.draggingFrom.coords;

    if (!this.tempLine) {
      this.tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.tempLine.setAttribute('class', 'cable-cable temp-cable');
      this.svg.appendChild(this.tempLine);
    }

    const d = this.calculateBezierPath(start.x, start.y, curX, curY);
    this.tempLine.setAttribute('d', d);
  }

  renderSelectedPreviewLines() {
    this.clearTempLines();

    // Nối Col 1 sang Col 2 nếu cả hai đã chọn
    if (this.selectedCol1 && this.selectedCol2) {
      const p1 = this.getPinCoords(this.selectedCol1.element);
      const p2 = this.getPinCoords(this.selectedCol2.element);
      this.tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.tempLine.setAttribute('class', 'cable-cable pending-cable');
      this.tempLine.setAttribute('d', this.calculateBezierPath(p1.x, p1.y, p2.x, p2.y));
      this.svg.appendChild(this.tempLine);
    }

    // Nối Col 2 sang Col 3 nếu cả hai đã chọn
    if (this.selectedCol2 && this.selectedCol3) {
      const p2 = this.getPinCoords(this.selectedCol2.element);
      const p3 = this.getPinCoords(this.selectedCol3.element);
      this.tempLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.tempLine2.setAttribute('class', 'cable-cable pending-cable');
      this.tempLine2.setAttribute('d', this.calculateBezierPath(p2.x, p2.y, p3.x, p3.y));
      this.svg.appendChild(this.tempLine2);
    }
  }

  // Tính toán đường cong bezier dạng dây sạc/nét vẽ tay tự nhiên
  calculateBezierPath(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1) * 0.55;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }

  // Kiểm tra bộ 3 nguyên liệu A + B -> Đồ hoàn chỉnh C
  validateCombination() {
    const compA = this.selectedCol1.compId;
    const compB = this.selectedCol2.compId;
    const targetItemId = this.selectedCol3.itemId;

    const craftedItem = window.dataManager.findItemByRecipe(compA, compB);
    const isCorrect = (craftedItem && craftedItem.id === targetItemId);

    const el1 = this.selectedCol1.element;
    const el2 = this.selectedCol2.element;
    const el3 = this.selectedCol3.element;

    const p1 = this.getPinCoords(el1);
    const p2 = this.getPinCoords(el2);
    const p3 = this.getPinCoords(el3);

    if (isCorrect) {
      // ĐÚNG RỒI!
      window.soundManager.playSuccess();
      window.app.addScore(100);
      window.app.increaseStreak();
      window.dataManager.recordAnswer(targetItemId, true);

      // Tạo 2 đường cáp cố định màu xanh neon
      this.createPermanentCable(p1, p2, el1, el2);
      this.createPermanentCable(p2, p3, el2, el3);

      // Đánh dấu thẻ hoàn thành
      [el1, el2, el3].forEach(el => {
        el.classList.remove('active-pin');
        el.classList.add('matched');
      });

      this.completedCables.push({
        el1, el2, el3,
        item: craftedItem
      });

      // Bắn pháo hoa hiệu ứng
      this.createSparkleEffect(p3.x, p3.y);

      // Xóa lựa chọn hiện tại
      this.selectedCol1 = null;
      this.selectedCol2 = null;
      this.selectedCol3 = null;
      this.clearTempLines();

      // Kiểm tra xem đã hoàn thành toàn bộ màn chưa
      if (this.completedCables.length === this.itemsPerStage) {
        setTimeout(() => {
          this.handleStageComplete();
        }, 700);
      }
    } else {
      // SAI RỒI!
      window.soundManager.playError();
      window.app.resetStreak();
      window.dataManager.recordAnswer(targetItemId, false);

      // Vẽ đường dây màu đỏ rung nhẹ rồi biến mất
      this.showErrorCable(p1, p2, p3);

      [el1, el2, el3].forEach(el => {
        el.classList.add('shake-error');
        setTimeout(() => el.classList.remove('shake-error'), 450);
      });

      // Hủy chọn
      setTimeout(() => {
        if (el1) el1.classList.remove('active-pin');
        if (el2) el2.classList.remove('active-pin');
        if (el3) el3.classList.remove('active-pin');
        this.selectedCol1 = null;
        this.selectedCol2 = null;
        this.selectedCol3 = null;
        this.clearTempLines();
      }, 500);
    }
  }

  createPermanentCable(p1, p2, el1, el2) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'cable-cable correct-cable');
    path.setAttribute('d', this.calculateBezierPath(p1.x, p1.y, p2.x, p2.y));
    path.setAttribute('filter', 'url(#glow-green)');
    this.svg.appendChild(path);

    // Lưu để vẽ lại khi resize màn hình
    this.completedCables.push({ el1, el2, path });
  }

  showErrorCable(p1, p2, p3) {
    this.clearTempLines();
    const pathA = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathA.setAttribute('class', 'cable-cable wrong-cable');
    pathA.setAttribute('d', this.calculateBezierPath(p1.x, p1.y, p2.x, p2.y));
    pathA.setAttribute('filter', 'url(#glow-red)');

    const pathB = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathB.setAttribute('class', 'cable-cable wrong-cable');
    pathB.setAttribute('d', this.calculateBezierPath(p2.x, p2.y, p3.x, p3.y));
    pathB.setAttribute('filter', 'url(#glow-red)');

    this.svg.appendChild(pathA);
    this.svg.appendChild(pathB);

    setTimeout(() => {
      if (pathA.parentNode) pathA.parentNode.removeChild(pathA);
      if (pathB.parentNode) pathB.parentNode.removeChild(pathB);
    }, 600);
  }

  createSparkleEffect(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-burst';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.innerHTML = '✨🌟✨';
    this.container.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }

  redrawAllCompletedLines() {
    this.completedCables.forEach(c => {
      if (c.path && c.el1 && c.el2) {
        const p1 = this.getPinCoords(c.el1);
        const p2 = this.getPinCoords(c.el2);
        c.path.setAttribute('d', this.calculateBezierPath(p1.x, p1.y, p2.x, p2.y));
      }
    });
  }

  // Hoàn thành xuất sắc cả màn -> Hiện bảng ôn tập thẻ chi tiết
  handleStageComplete() {
    window.soundManager.playWin();
    window.app.addScore(250); // Thưởng qua màn
    window.app.showStageSummaryModal(this.currentItems, this.stage, () => {
      this.startStage(this.stage + 1);
    });
  }
}

window.matchMode = new MatchMode();

