import { Board, Place } from './board'
import { Renderer, EStoneColor } from './renderer'
import { Analyser } from './AI/analyser'
// import { GreedAI } from './AI/simpleAI'
import { GameTreeAI } from './AI/gameTreeAI'
import { Logger } from './logger'

var EState = {
  init: 0,
  start: 1,
  waitplayer: 2,
  waitAI: 3,
  end: 4
}

class Controller {
  constructor (canvas, info, btnAiFrist, size = 15, nWin = 5) {
    this.state = EState.init // 游戏的状态
    this.pointer = { x: NaN, y: NaN } // 落子提示
    this.playerColor = -1 // -1代表黑色
    this.stoneList = [] // 记录下过的棋子
    this.info = info
    this.canvas = canvas
    this.logger = new Logger(info)
    this.board = new Board(size, nWin)
    this.renderer = new Renderer(this)
    this.AI = new GameTreeAI(this, 8, 6, 2) // new GreedAI(this)

    canvas.onclick = (e) => {
      if (this.debugMode) {
        this.debugBoard(e.offsetX, e.offsetY)
        return false
      }

      switch (this.state) {
        case EState.init:
        case EState.start:
          btnAiFrist.disabled = true
          btnAiFrist.style.display = 'none'
        // eslint-disable-next-line no-fallthrough
        case EState.waitplayer:
          this.placeStone(e.offsetX, e.offsetY)
          break
        case EState.waitAI:
          this.log('别着急，AI正在思考对策')
          break
        case EState.end:
          // this.log('游戏已结束，请按f5刷新页面')
          window.confirm('游戏已结束，刷新页面?')
            ? window.location.reload()
            : window.alert('你也可以通过调整棋盘大小来刷新棋盘')
          break
        default:
          break
      }
      return false
    }

    canvas.onmousemove = (e) => {
      this.pointer.x = e.offsetX
      this.pointer.y = e.offsetY
    }

    btnAiFrist.onclick = (e) => {
      const center = Math.floor(this.board.size / 2)
      const place = new Place(center, center, -this.playerColor)
      this.board.placeStone(place)
      this.stoneList.push(place)
      this.swapColor()
      btnAiFrist.disabled = true
      btnAiFrist.style.display = 'none'
      this.info.innerText = `*\nAI先手默认下在中心点\n*`
    }
    this.renderer.updataLoop(60)// 渲染驱动
    this.state = EState.start
  }

  log (line1, line2, line3) {
    this.logger.log(line1, line2, line3)
  }

  update () {
    this.renderer.update()// 手动更新棋盘
  }

  /** 交换正常模式与debug模式 */
  changeMode () {
    this.debugMode = !this.debugMode
    return this.debugMode ? '正常模式' : '调试模式'// 按钮上显示的是反的
  }
  /** 修改棋盘大小 */
  changeSize (newSize) {
    this.board.reSet(newSize, this.board.nWin)
    this.stoneList.length = 0
  }
  /** 修改获胜所需的同一个方向上的棋子数量 */
  changeNWin (newNWin) {
    this.board.nWin = newNWin
  }

  Undo () {
    const point = this.stoneList.pop()
    if (point === undefined) {
      return
    }
    this.board.clearStone(point.x, point.y)
    this.playerColor *= -1
    this.state = EState.waitplayer
    this.log(`撤销${JSON.stringify(point)}`)
  }

  placeStone (offsetX, offsetY) {
    const gridSize = this.renderer.canvasSize / this.board.size
    const x = Math.round(offsetX / gridSize - 0.5)
    const y = Math.round(offsetY / gridSize - 0.5)
    const place = new Place(x, y, this.playerColor)

    let isOK = this.board.placeStone(place)
    if (!isOK) {
      return
    }
    this.stoneList.push(place)
    let isWin = Analyser.isWin(this.board, place)
    let score
    if (isWin) {
      this.log('你赢了')
      window.alert('你输了')
      this.state = EState.end
      return
    }
    this.state = EState.waitAI
    this.log('AI正在思考中')
    let data1 = new Date()
    this.AI.run(-this.playerColor, (best) => {
      if (best === null || isNaN(best.x) || isNaN(best.y)) {
        this.state = EState.end
        this.log('平局')
        window.alert('平局')
        return
      }
      score = best.score
      this.board.placeStone(best)
      let isWin = Analyser.isWin(this.board, best)
      this.stoneList.push(best)
      if (isWin) {
        this.state = EState.end
        this.log('你输了')
        window.alert('你输了')
        return
      }
      let data2 = new Date()
      let delayTime = Math.max(data2.getTime() - data1.getTime(), 20)
      this.log(
        `黑方分数:${Analyser.getScore(this.board, EStoneColor.black)}`,
        `白方分数:${Analyser.getScore(this.board, EStoneColor.white)}`,
        `AI估值:${score},AI思考时间:${delayTime / 1000}秒`
      )
      this.state = EState.waitplayer
    })

    // ...
  }

  debugBoard (offsetX, offsetY) {
    this.stoneList.length = 0
    const gridSize = this.renderer.canvasSize / this.board.size
    const x = Math.round(offsetX / gridSize - 0.5)
    const y = Math.round(offsetY / gridSize - 0.5)
    this.board.debug(x, y)
  }

  swapColor () {
    EStoneColor.white *= -1
    EStoneColor.black *= -1
  }
}

export {
  Controller,
  EState
}
