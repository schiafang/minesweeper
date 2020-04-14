
const GAME_STATE = {
  FirstClickAwaits: "FirstClickAwaits",
  GameInProgress: "GameInProgress",
  GameFinished: "GameFinished"
}
//----------------------- View -----------------------//
const view = {
  /**
   * displayFields() 
   * 顯示踩地雷的遊戲版圖在畫面上
   */
  displayFields(rows, cols) {
    const fieldContent = document.querySelector('.gamefield')
    fieldContent.innerHTML = Array.from(Array(rows * cols).keys()).map(index => `<div class="field coverd" data-index="${index}"></div>`).join('')
  },
  /** 
   * showFieldContent() 
   * 更改單一格子的內容，顯示數字或是海洋
   */
  showFieldContent(fieldIndex) {
    document.querySelector(`[data-index="${fieldIndex}"]`).classList.remove('coverd')
    if (model.fields[fieldIndex].type === "ocean") {
      document.querySelector(`[data-index="${fieldIndex}"]`).style.background = '#F0F7F9'
    } else {
      document.querySelector(`[data-index="${fieldIndex}"]`).style.background = '#F0F7F9'
      document.querySelector(`[data-index="${fieldIndex}"]`).classList.add('number')
      document.querySelector(`[data-index="${fieldIndex}"]`).innerText = `${model.fields[fieldIndex].number}`
    }
  },
  /**
   * renderTime() 
   * 顯示經過的遊戲時間在畫面上。
   */
  renderTime(time) {
    const timer = document.querySelector('#timer')
  },
  /**
   * renderFlagCount() 
   * 顯示剩餘地雷數(旗子數量)
   */
  renderFlagCount() {
    const flagCounter = document.querySelector('#flag-counter')
    flagCounter.innerText = model.flags
  },
  /**
   * showBoard() 
   * 遊戲結束時，顯示所有地雷
   */
  showBoard() {
    model.fields.forEach(item => {
      if (item.type === "mine") {
        document.querySelector(`[data-index="${item.index}"]`).innerHTML = `<i class="fas fa-bomb"></i>`
      }
    })
  },
  /**
   * showAllBoard()
   * 測試畫面，將遊戲的全部格子內容顯示出來
   */
  showAllBoard() {
    model.fields.forEach(item => {
      if (item.type === "mine") {
        document.querySelector(`[data-index="${item.index}"]`).innerHTML = `<i class="fas fa-bomb"></i>`
      } else if (item.type === "ocean") {
        document.querySelector(`[data-index="${item.index}"]`).style.background = '#F0F7F9'
      } else {
        document.querySelector(`[data-index="${item.index}"]`).innerHTML = `<div class="number">${item.number}</div>`
      }
    })
  },
  /**
   * showFlag()
   * 放置旗子顯示在格子上
   */
  showFlag(field) {
    if ((model.fields[field].isFlagged === false) && (model.fields[field].isDigged !== true)) {
      model.fields[field].isFlagged = true
      document.querySelector(`[data-index="${field}"]`).classList.add('fas', 'fa-flag')
      model.flags -= 1
      view.renderFlagCount()
    } else if ((model.fields[field].isFlagged === true)) {
      model.fields[field].isFlagged = 'question'
      document.querySelector(`[data-index="${field}"]`).classList.remove('fas', 'fa-flag')
      document.querySelector(`[data-index="${field}"]`).classList.add('fas', 'fa-question')
    } else if ((model.fields[field].isFlagged === 'question')) {
      model.fields[field].isFlagged = false
      document.querySelector(`[data-index="${field}"]`).classList.remove('fas', 'fa-question')
      model.flags += 1
      view.renderFlagCount()
    }
  }
}
//-------------------- Controller --------------------//
const controller = {
  currentState: GAME_STATE.FirstClickAwaits,
  /**
   * createGame() 
   * 顯示遊戲畫面 > 埋地雷 > 遊戲計時、地雷計數
   */
  createGame(numberOfRows, numberOfCols, numberOfMines) {
    view.displayFields(numberOfRows, numberOfCols)
    model.numberOfRows = numberOfRows
    controller.setMinesAndFields(numberOfRows, numberOfCols, numberOfMines)
    model.flags = model.mines.length
    view.renderFlagCount()
    //view.showAllBoard()
  },
  /**
   * setMinesAndFields()
   * 設定格子的內容，產生地雷的編號
   */
  setMinesAndFields(numberOfRows, numberOfCols, numberOfMines) {
    model.fields = Array.from(Array(numberOfRows * numberOfCols).keys())
    model.mines = utility.getRandomNumberArray(numberOfRows * numberOfCols).slice(0, numberOfMines)
    model.fields.map(index => { model.fields[index] = controller.getFieldData(index) })
  },
  /**
   * getFieldData()
   * 取得單一格子的內容，決定這個格子是海洋還是號碼(幾號)
   */
  getFieldData(fieldIdx) {
    function getFieldAround() {
      const row = model.numberOfRows
      const fieldAround = []
      if (fieldIdx - row >= 0) {                                              // not in Top-Row
        fieldAround.push(fieldIdx - row)                                      // Top
        if (fieldIdx % row !== 0) fieldAround.push(fieldIdx - row - 1)        // Top-Left
        if (fieldIdx % row + 1 !== row) fieldAround.push(fieldIdx - row + 1)  // Top-Right
      }
      if (fieldIdx + row < model.fields.length) {                             // not in Bottom-Row
        fieldAround.push(fieldIdx + row)                                      // Bottom
        if (fieldIdx % row !== 0) fieldAround.push(fieldIdx + row - 1)        // Bottom-Left
        if (fieldIdx % row + 1 !== row) fieldAround.push(fieldIdx + row + 1)  // Bottom-Right
      }
      if (fieldIdx % row !== 0) fieldAround.push(fieldIdx - 1)                // Left
      if (fieldIdx % row + 1 !== row) fieldAround.push(fieldIdx + 1)          // Right

      return fieldAround
    }
    if (model.isMine(fieldIdx)) {
      return {
        index: fieldIdx,
        type: 'mine',
        isFlagged: false
      }
    } else {
      let number = 0
      getFieldAround().map(index => { number = model.isMine(index) ? number + 1 : number })
      if (number === 0) {
        return {
          index: fieldIdx,
          type: 'ocean',
          isDigged: false,
          isFlagged: false
        }
      } return {
        index: fieldIdx,
        type: 'number',
        number: number,
        isDigged: false,
        isFlagged: false
      }
    }
  },
  /**
   * dig()
   * 使用者挖格子時要執行的函式
   * 號碼或海洋 => 顯示格子 / 地雷 => 遊戲結束
   */
  dig(field) {
    model.fields[field].isDigged = true
    if (model.fields[field].type === 'mine') {
      document.querySelector(`[data-index="${field}"]`).style.backgroundColor = 'red'
      view.showBoard()
      alert('BOOOOOOOOOOM!')
      this.currentState = GAME_STATE.GameFinished
    } else if (model.fields[field].isFlagged === false) {
      view.showFieldContent(field)
      this.currentState = GAME_STATE.GameInProgress
    }
  },
  /**
   * reset() 重新開始
   */
  reset() {
    controller.createGame(9, 9, 12)
    this.currentState = GAME_STATE.FirstClickAwaits
  },
  /**
   * spreadOcean() 展開海洋格子
   */
  spreadOcean(field) { }
}
//---------------------- Model ----------------------//
const model = {
  mines: [],
  fields: [],
  flags: [],
  /**
   * isMine() 檢查編號是否為地雷
   */
  isMine(fieldIdx) { return this.mines.includes(fieldIdx) },
  /** 遊戲版圖row數 */
  numberOfRows: []
}
//----------------------- Utility -----------------------//
const utility = {
  /**
   * getRandomNumberArray(count) 
   * 取得一個隨機排列、範圍從 0~count 的數字陣列
   */
  getRandomNumberArray(count) {
    const number = [...Array(count).keys()]
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }

    return number
  }
}
//---------------------- Listener ----------------------//
// 阻止預設右鍵
this.addEventListener('contextmenu', event => {
  event.preventDefault()
})
// 重新開始
document.querySelector('#reset').addEventListener('click', event => controller.reset())
// 點擊左鍵事件
document.querySelector('.gamefield').addEventListener('click', event => {
  if (controller.currentState !== GAME_STATE.GameFinished) {
    controller.dig(event.target.dataset.index)
    console.log(model.fields[event.target.dataset.index])
  }
})
// 點擊右鍵事件
document.querySelector('.gamefield').addEventListener('contextmenu', event => {
  if (controller.currentState !== GAME_STATE.GameFinished) {
    view.showFlag(event.target.dataset.index)
    console.log(model.fields[event.target.dataset.index])
  }
})
//---------------------- Execute -----------------------//
controller.createGame(9, 9, 12)

