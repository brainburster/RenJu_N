/**
 * 棋盘分析类，能够分析整个棋盘，与单个棋子的分数
 */
class Analyser {
  /** 获得整个棋盘的估值 */
  static getScore (board, color) {
    const nWin = board.nWin
    let ooooCount = 0
    let xooooCount = 0
    let oooCount = 0
    let xoooCount = 0
    let ooCount = 0
    let xooCount = 0

    for (let direction = 0; direction < 4; ++direction) {
      const analysisArrays = Analyser.getBoardAnalysisArrays(board, direction)
      for (let analysisArray of analysisArrays) {
        const [ ooooo, oooo, xoooo, ooo, xooo, oo, xoo ] = Analyser.getWinCount(nWin, color, analysisArray)
        if (ooooo > 0) {
          return 100000
        }
        ooooCount += oooo
        xooooCount += xoooo
        oooCount += ooo
        xoooCount += xooo
        ooCount += oo
        xooCount += xoo
      }
    }

    if (ooooCount >= 1) {
      return 90000 + ooooCount * 2400 // <99600
    } else if (oooCount + xooooCount >= 2 && nWin > 3) {
      return 90000 + (oooCount + xooooCount) * 1000
    }

    return xooooCount * 300 + oooCount * (nWin > 3 ? 1 : 0) * 150 + xoooCount * (nWin > 3 ? 1 : 0) * 100 + ooCount * (nWin > 4 ? 1 : 0) * 50 + xooCount * (nWin > 4 ? 1 : 0)
  }
  /** 当前棋子是否导致了游戏结束（不包括平局） */
  static isWin (board, place) {
    if (place === undefined) {
      throw new Error('分析的位置不能为空')
    }

    // if (board.getColor(place.x, place.y) !== place.color) {
    //   board = board.clone()
    //   board.placeStone(place)
    // }
    const color = place.color
    const nWin = board.nWin
    let winCount

    if (nWin === 1) {
      return true
    } else {
      let analysisArrays = this.getPlaceAnalysisArrays(board, place, nWin)
      for (let direction = 0; direction < 4; ++direction) {
        winCount = 0
        for (const value of analysisArrays[direction]) {
          if (value === color) {
            if (++winCount >= nWin) {
              return true
            }
          } else {
            winCount = 0
          }
        }
      }
    }

    return false
  }
  /** 获得单个棋子的分数 */
  static getPlaceScore (board, place) {
    if (place === undefined) {
      throw new Error('分析的位置不能为空')
    }
    const nWin = board.nWin
    const range = nWin + 1

    let score = 0
    // 先计算下了这一步的分数
    const isOk = board.placeStone(place)
    if (!isOk) {
      throw new Error(`in Analyser.getPlaceScore() x:${place.x},y:${place.y}`)
    }
    let analysisArrays = Analyser.getPlaceAnalysisArrays(board, place, range)
    for (const analysisArray of analysisArrays) {
      const [ ooooo, oooo, xoooo, ooo, xooo, oo, xoo ] = Analyser.getWinCount(nWin, place.color, analysisArray)
      const [ xxxxx, xxxx, oxxxx, xxx, oxxx, xx, oxx ] = Analyser.getWinCount(nWin, -place.color, analysisArray)
      score += (ooooo - xxxxx) * 10000 + (oooo - xxxx) * 1000 + (xoooo - oxxxx) * 300 + (ooo - xxx) * 200 + (xooo - oxxx) * 30 + (oo - xx) * 30 + (xoo - oxx) * 1
    }
    // 还原棋盘，再计算一次，然后两次做差
    board.undo(place)
    analysisArrays = Analyser.getPlaceAnalysisArrays(board, place, range)
    for (const analysisArray of analysisArrays) {
      const [ ooooo, oooo, xoooo, ooo, xooo, oo, xoo ] = Analyser.getWinCount(nWin, place.color, analysisArray)
      const [ xxxxx, xxxx, oxxxx, xxx, oxxx, xx, oxx ] = Analyser.getWinCount(nWin, -place.color, analysisArray)
      score -= (ooooo - xxxxx) * 10000 + (oooo - xxxx) * 1000 + (xoooo - oxxxx) * 300 + (ooo - xxx) * 200 + (xooo - oxxx) * 30 + (oo - xx) * 20 + (xoo - oxx) * 1
    }
    return score
  }
  /** 仅在本类调用 */
  static getWinCount (nWin, color, analysisArray) {
    const stackMaxLength = nWin + 1
    const analysisStack = []
    let count = 0
    let ooooo = 0
    let oooo = 0
    let xoooo = 0
    let ooo = 0
    let xooo = 0
    let oo = 0
    let xoo = 0
    let lastColor = -color
    let endBlock = 0

    for (let index = 0; index < analysisArray.length; ++index) {
      let value = isNaN(analysisArray[index]) ? -color : analysisArray[index]
      if (value === color || analysisStack.length > 0) {
        // 这段的用意是，让 o_ooo_o 这种线性复杂棋形被理解为 [o_ooo, ooo_o]
        if (analysisStack.length === 0) {
          let researchIndex = analysisArray.lastIndexOf(-color, index)
          researchIndex = researchIndex > (index - nWin + 1 > 0 ? index - nWin + 1 : 0) ? researchIndex : (index - nWin + 1 > 0 ? index - nWin + 1 : 0)
          researchIndex = analysisArray.indexOf(color, researchIndex + 1)
          if (researchIndex < index && researchIndex > 0) {
            index = researchIndex // >=1
            value = analysisArray[index]
            lastColor = analysisArray[index - 1]
          }

          analysisStack.push(lastColor)
        }

        analysisStack.push(value)

        // 计算连在一起的棋形
        if (analysisStack.length >= stackMaxLength || value === -color || index >= analysisArray.length - 1) {
          count = 0
          analysisStack.forEach((v) => { if (v === color) { count += 2 } })
          if (count >= nWin * 2) {
            ooooo += 1
          }
          endBlock = analysisStack.lastIndexOf(color) + 1
          endBlock = endBlock > analysisStack.length - 1 ? analysisStack.length - 1 : endBlock
          endBlock = analysisStack[endBlock]
          if (endBlock !== 0) { // ooox
            count -= 1
          }
          if (analysisStack[0] !== 0) { // xooo
            count -= 1
          }
          if (index - analysisArray.lastIndexOf(-color, index - 1) <= ((analysisStack[analysisStack.length - 1] === -color ? nWin : nWin - 1))) { // x_oo_x
            count = -10000
          }
          switch (nWin * 2 - count) {
            case -2:
            case -1:
            case 0:
            case 1:
            case 2:
              oooo += 1
              break
            case 3:
              xoooo += 1
              break
            case 4:
              ooo += 1
              break
            case 5:
              xooo += 1
              break
            case 6:
              oo += 1
              break
            case 7:
              xoo += 1
              break
            default:
              break
          }
          analysisStack.length = 0
        }
      }
      lastColor = value
    }
    return [ ooooo, oooo, xoooo, ooo, xooo, oo, xoo ]
  }
  /** 仅在本类调用 */
  static getBoardAnalysisArrays (board, direction) {
    const data = board.data
    const size = board.size
    const analysisArrays = []
    let analysisArray
    let index = -1
    let getIndex
    let aStart = 0

    switch (direction) {
      case 0:
        getIndex = (a, b) => board.getIndex(b, a) // →扫描
        break
      case 1:
        getIndex = (a, b) => board.getIndex(a, b) // ↓扫描
        break
      case 2:
        aStart = -size + 1 // 斜线要扫描size*2-1次
        getIndex = (a, b) => board.getIndex(a + b, b) // ↘扫描
        break
      case 3:
        aStart = -size + 1
        getIndex = (a, b) => board.getIndex(a + b, size - b - 1) // ↗扫描
        break
      default:
        throw new Error(`direction : ${direction}`)
    }

    for (let a = aStart; a < size; ++a) {
      analysisArray = []
      for (let b = 0; b < size; ++b) {
        index = getIndex(a, b)
        if (index < 0) { continue }
        analysisArray.push(data[index])
      }
      analysisArrays.push(analysisArray)
    }

    return analysisArrays
  }
  /** 仅在本类调用 */
  static getPlaceAnalysisArrays (board, place, range) {
    if (place === undefined) {
      throw new Error('分析的位置不能为空')
    }
    const analysisArrays = [[], [], [], []]// 4个方向
    const data = board.data
    const x = place.x
    const y = place.y
    let index = 0
    for (let i = -range + 1; i < range; i++) {
      index = board.getIndex(i + x, y)
      if (index > -1) { analysisArrays[0].push(data[index]) }
      index = board.getIndex(x, i + y)
      if (index > -1) { analysisArrays[1].push(data[index]) }
      index = board.getIndex(i + x, i + y)
      if (index > -1) { analysisArrays[2].push(data[index]) }
      index = board.getIndex(i + x, y - i)
      if (index > -1) { analysisArrays[3].push(data[index]) }
    }
    return analysisArrays
  }
}
/** 导出 */
export {
  Analyser
}
