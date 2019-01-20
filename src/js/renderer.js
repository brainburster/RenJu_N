let EStoneColor = {
  empty: 0,
  black: -1,
  white: 1,
  error: undefined
}
/** 渲染类，管理canvas绘图 */
class Renderer {
  constructor (controller, canvasSize = 15 * 30) {
    this.controller = controller
    this.canvas = controller.canvas
    this.context = controller.canvas.getContext('2d')
    this.canvas.setAttribute('height', canvasSize)
    this.canvas.setAttribute('width', canvasSize)
    this.canvasSize = canvasSize
  }

  /** 绘制落子提示 */
  drawPointer (offsetX, offsetY, gridSize, color) {
    if (isNaN(offsetX) || isNaN(offsetY)) {
      return
    }
    const x = (Math.round(offsetX / gridSize - 0.5) + 0.5) * gridSize
    const y = (Math.round(offsetY / gridSize - 0.5) + 0.5) * gridSize
    this.context.beginPath()
    this.context.arc(x, y, gridSize / 2 - 1, 0, 360, false)
    if (color === EStoneColor.black) {
      this.context.fillStyle = '#000000AA'
      this.context.fill()
    } else if (color === EStoneColor.white) {
      this.context.fillStyle = '#FFFFFFAA'
      this.context.fill()
    }
    this.context.closePath()
  }

  /** 更新一帧 */
  update () {
    const board = this.controller.board
    const pointer = this.controller.pointer
    const stoneList = this.controller.stoneList
    const currentColor = this.controller.playerColor
    this.context.clearRect(0, 0, this.canvasSize, this.canvasSize)
    let gridSize = this.canvasSize / board.size

    this.context.beginPath()
    for (let i = 0; i < board.size; i++) {
      this.context.moveTo(i * gridSize + gridSize / 2, gridSize / 2)
      this.context.lineTo(i * gridSize + gridSize / 2, (board.size - 1) * gridSize + gridSize / 2)
      this.context.moveTo(gridSize / 2, i * gridSize + gridSize / 2)
      this.context.lineTo((board.size - 1) * gridSize + gridSize / 2, i * gridSize + gridSize / 2)
    }
    this.context.stroke()
    this.context.closePath()

    this.drawPointer(pointer.x, pointer.y, gridSize, currentColor)

    let sign = stoneList[stoneList.length - 1]
    if (sign !== undefined) {
      this.context.beginPath()
      this.context.arc((sign.x + 0.5) * gridSize, (sign.y + 0.5) * gridSize, gridSize / 2, 0, 360, false)
      this.context.fillStyle = 'darkgray'
      this.context.fill()
      this.context.closePath()
    }

    board.data.forEach((color, index) => {
      let { x, y } = board.getXY(index)
      x = (x + 0.5) * gridSize
      y = (y + 0.5) * gridSize
      this.context.beginPath()
      this.context.arc(x, y, gridSize / 2 - 2, 0, 360, false)
      if (color === EStoneColor.black) {
        this.context.fillStyle = 'black'
        this.context.fill()
      } else if (color === EStoneColor.white) {
        this.context.fillStyle = 'white'
        this.context.fill()
      }
      this.context.closePath()
    })

    stoneList.forEach((point, index) => {
      let x = (point.x + 0.50) * gridSize
      let y = (point.y + 0.50) * gridSize
      if (index > 8) { // index+1>=10
        this.context.font = `${gridSize * 0.55}px Georgia, 'Times new roman'`
      } else {
        this.context.font = `${gridSize * 0.6}px Georgia, 'Times new roman'`
      }
      if (point.color === EStoneColor.black) {
        this.context.fillStyle = 'white'
      } else if (point.color === EStoneColor.white) {
        this.context.fillStyle = 'black'
      }
      this.context.textBaseline = 'middle'
      this.context.textAlign = 'center'
      this.context.fillText(index + 1, x, y)
    })
  }

  /** GameLoop */
  updataLoop (fps = 60) {
    setTimeout(() => {
      this.update()
      this.updataLoop(fps)
    }, fps / 1000)
  }
}

export {
  Renderer,
  EStoneColor
}
