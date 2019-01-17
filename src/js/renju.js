import { Controller, EState } from './controller'
// import './my.css'

const main = () => {
  // let appDom = document.getElementById('app')
  let setting = document.getElementById('app-setting')
  let canvas = document.getElementById('app-canvas')
  let btnAiFrist = document.getElementById('btn-ai-frist')
  let info = document.getElementById('board-info')
  let btnUndo = document.getElementById('btn-board-undo')
  let btnDebug = document.getElementById('btn-board-debug')
  let sizeRange = document.getElementById('board-size')
  let nWinRange = document.getElementById('board-nwin')
  let sizeLabel = document.getElementById('board-size-value')
  let nWinLabel = document.getElementById('board-nwin-value')

  let controller = new Controller(canvas, info, btnAiFrist, sizeRange.valueAsNumber, nWinRange.valueAsNumber)

  btnUndo.onclick = (e) => {
    controller.Undo()
  }
  btnDebug.onclick = (e) => {
    btnDebug.value = controller.changeMode()
  }
  // 为了兼容ie11
  nWinRange.onmouseup = nWinRange.oninput = (e) => {
    nWinLabel.innerText = nWinRange.value
    controller.changeNWin(nWinRange.valueAsNumber)
  }
  sizeRange.onmouseup = sizeRange.oninput = (e) => {
    const value = isNaN(sizeRange.valueAsNumber) ? 15 : sizeRange.valueAsNumber
    sizeLabel.innerText = value
    nWinRange.value = value < 5 ? value : 5
    nWinRange.oninput(e)
    controller.changeSize(value)
    controller.state = EState.start
  }
  // 收起
  info.onclick = setting.onclick = function (e) { // 这里不能用lambda表达式，因为this需要动态绑定
    if (e.target.id !== this.id) { // 不处理子元素冒泡上来的事件
      return
    }
    this.style.height === '20px'
      ? this.style.height = 'auto'
      : this.style.height = '20px'
  }
}

window.onload = (e) => {
  main()
}
