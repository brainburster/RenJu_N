/**
 * 棋盘分析类，能够分析整个棋盘，与单个棋子的分数
 */
class Analyser {
  /** 获得整个棋盘的估值 */
  static getScore(board, color) {
    const {
      nWin,
    } = board;
    let ooooCount = 0;
    let xooooCount = 0;
    let oooCount = 0;
    let xoooCount = 0;
    let ooCount = 0;
    let xooCount = 0;

    for (let direction = 0; direction < 4; direction += 1) {
      const analysisArrays = Analyser.getBoardAnalysisArrays(board, direction);
      for (const analysisArray of analysisArrays) {
        const [oooooo, ooooo, oooo, xoooo, ooo, xooo, oo,
          xoo,
        ] = Analyser.getWinCount(nWin, color, analysisArray);
        if (color === -1 && oooooo > 0) {
          return -100000;
        }
        if (ooooo > 0) {
          return 100000;
        }
        ooooCount += oooo;
        xooooCount += xoooo;
        oooCount += ooo;
        xoooCount += xooo;
        ooCount += oo;
        xooCount += xoo;
      }
    }

    if (ooooCount >= 1) {
      return 90000 + ooooCount * 2400; // <99600
    }
    if (oooCount + xooooCount >= 2 && nWin > 3) {
      return 90000 + (oooCount + xooooCount) * 1000;
    }

    return xooooCount * 300 + oooCount * (nWin > 3 ? 1 : 0) * 150
      + xoooCount * (nWin > 3 ? 1 : 0) * 100
      + ooCount * (nWin > 4 ? 1 : 0) * 50 + xooCount * (nWin > 4 ? 1 : 0);
  }

  /** 当前棋子是否导致了游戏结束（不包括平局） */
  static isWin(board, place) {
    if (place === undefined) {
      throw new Error('分析的位置不能为空');
    }

    const {
      color,
    } = place;
    const {
      nWin,
    } = board;
    let winCount;

    if (nWin === 1) {
      return true;
    }
    const analysisArrays = this.getPlaceAnalysisArrays(board, place, nWin);
    for (let direction = 0; direction < analysisArrays.length; direction += 1) {
      winCount = 0;
      for (const value of analysisArrays[direction]) {
        if (value === color) {
          winCount += 1;
          if (winCount >= nWin) {
            return true;
          }
        } else {
          winCount = 0;
        }
      }
    }


    return false;
  }

  /** 判断是否犯规（禁手） */
  static isFoul(board, place) {
    if (place === undefined) {
      throw new Error('分析的位置不能为空');
    }
    const {
      color,
    } = place;
    const {
      nWin,
    } = board;
    const range = nWin + 1;
    if (color === 1) {
      return false;
    }
    let noooooo = 0;
    let noooo = 0;
    let nooo = 0;
    const analysisArrays = this.getPlaceAnalysisArrays(board, place, range);
    for (const analysisArray of analysisArrays) {
      const [oooooo, , oooo, xoooo, ooo] = Analyser.getWinCount(nWin, color, analysisArray);
      noooooo += oooooo;
      noooo += oooo + xoooo;
      nooo += ooo;
    }
    if (noooooo > 0) { // 长连禁手
      return '长连禁手';
    }
    if (nooo === 2) { // 33,433
      if (noooo === 0) {
        return '三三禁手';
      }
      if (noooo === 1) {
        return '四三三禁手';
      }
    } else if ((noooo === 2) && nooo < 2) { // 44,344
      if (nooo === 0) {
        return '四四禁手';
      }
      if (nooo === 1) {
        return '三四四禁手';
      }
    }
    return false;
  }

  /** 获得单个棋子的分数 */
  static getPlaceScore(board, place) {
    if (place === undefined) {
      throw new Error('分析的位置不能为空');
    }
    const {
      nWin,
    } = board;
    const range = nWin + 1;
    let score = 0;

    let analysisArrays = Analyser.getPlaceAnalysisArrays(board, place, range);
    for (const analysisArray of analysisArrays) {
      const [, ooooo, oooo, xoooo, ooo, xooo, oo,
        xoo,
      ] = Analyser.getWinCount(nWin, place.color, analysisArray);
      if (ooooo > 0) {
        return 100000;
      }
      const [, xxxxx, xxxx, oxxxx, xxx, oxxx, xx,
        oxx,
      ] = Analyser.getWinCount(nWin, -place.color, analysisArray);
      score += (ooooo - xxxxx) * 10000
        + (oooo - xxxx) * 1000 + (xoooo - oxxxx) * 300
        + (ooo - xxx) * 200 + (xooo - oxxx) * 30 + (oo - xx) * 30 + (xoo - oxx) * 1;
    }
    const backup = place.color;
    place.color = 0;
    analysisArrays = Analyser.getPlaceAnalysisArrays(board, place, range);
    for (const analysisArray of analysisArrays) {
      const [, ooooo, oooo, xoooo, ooo, xooo, oo,
        xoo,
      ] = Analyser.getWinCount(nWin, backup, analysisArray);
      const [, xxxxx, xxxx, oxxxx, xxx, oxxx, xx,
        oxx,
      ] = Analyser.getWinCount(nWin, -backup, analysisArray);
      score -= (ooooo - xxxxx) * 10000 + (oooo - xxxx) * 1000
        + (xoooo - oxxxx) * 300 + (ooo - xxx) * 200
        + (xooo - oxxx) * 30 + (oo - xx) * 20 + (xoo - oxx) * 1;
    }
    place.color = backup;
    return score;
  }

  /** 仅在本类调用 */
  static getWinCount(nWin, color, analysisArray) {
    const stackMaxLength = nWin + 1;
    const analysisStack = [];
    let count = 0;
    let oooooo = 0;
    let ooooo = 0;
    let oooo = 0;
    let xoooo = 0;
    let ooo = 0;
    let xooo = 0;
    let oo = 0;
    let xoo = 0;
    let lastColor = -color;
    let endBlock = 0;

    for (let index = 0; index < analysisArray.length; index += 1) {
      let value = isNaN(analysisArray[index]) ? -color : analysisArray[index];
      if (value === color || analysisStack.length > 0) {
        if (analysisStack.length === 0) {
          if (lastColor !== -color) {
            let researchIndex = analysisArray.lastIndexOf(-color, index);
            researchIndex = Math.max(researchIndex, Math.max(index - nWin + 2, 0));
            researchIndex = analysisArray.indexOf(color, researchIndex);
            if (researchIndex < index && researchIndex > 0) {
              index = researchIndex; // >=1
              value = analysisArray[index];
              lastColor = analysisArray[index - 1];
            }
          }

          analysisStack.push(lastColor);
        }

        analysisStack.push(value);

        // 计算连在一起的棋形
        if (analysisStack.length >= stackMaxLength
          || value === -color || index >= analysisArray.length - 1) {
          count = analysisStack.reduce((p, v) => p + (v === color ? 2 : 0), 0);
          if (count >= nWin * 2) {
            ooooo += 1; // 胜利
            if (color === -1 && (count > nWin * 2 || analysisArray[index + 1] === color)) {
              oooooo += 1; // 黑方禁手
            }
          }
          endBlock = analysisStack.lastIndexOf(color) + 1;
          endBlock = endBlock > analysisStack.length - 1 ? analysisStack.length - 1 : endBlock;
          endBlock = analysisStack[endBlock];
          if (endBlock !== 0) { // ooox
            count -= 1;
          } else if (analysisStack[0] !== 0) { // xooo
            count -= 1;
          }
          if (index - analysisArray.lastIndexOf(-color, index - 1)
            <= ((analysisStack[analysisStack.length - 1] === -color ? nWin : nWin - 1))) { // x_oo_x
            count = -10000;
          }
          switch (nWin * 2 - count) {
            case 2:
              oooo += 1;
              break;
            case 3:
              xoooo += 1;
              break;
            case 4:
              ooo += 1;
              break;
            case 5:
              xooo += 1;
              break;
            case 6:
              oo += 1;
              break;
            case 7:
              xoo += 1;
              break;
            default:
              break;
          }
          analysisStack.length = 0;
        }
      }
      lastColor = value;
    }
    return [oooooo, ooooo, oooo, xoooo, ooo, xooo, oo, xoo];
  }

  /** 仅在本类调用 */
  static getBoardAnalysisArrays(board, direction) {
    const {
      data,
    } = board;
    const {
      size,
    } = board;
    const analysisArrays = [];
    let analysisArray;
    let index = -1;
    let getIndex;
    let aStart = 0;

    switch (direction) {
      case 0:
        getIndex = (a, b) => board.getIndex(b, a); // →扫描
        break;
      case 1:
        getIndex = (a, b) => board.getIndex(a, b); // ↓扫描
        break;
      case 2:
        aStart = -size + 1; // 斜线要扫描size*2-1次
        getIndex = (a, b) => board.getIndex(a + b, b); // ↘扫描
        break;
      case 3:
        aStart = -size + 1;
        getIndex = (a, b) => board.getIndex(a + b, size - b - 1); // ↗扫描
        break;
      default:
        throw new Error(`direction : ${direction}`);
    }

    for (let a = aStart; a < size; a += 1) {
      analysisArray = [];
      for (let b = 0; b < size; b += 1) {
        index = getIndex(a, b);
        if (index < 0) {
          continue;
        }
        analysisArray.push(data[index]);
      }
      analysisArrays.push(analysisArray);
    }

    return analysisArrays;
  }

  /** 仅在本类调用 */
  static getPlaceAnalysisArrays(board, place, range) {
    if (place === undefined) {
      throw new Error('分析的位置不能为空');
    }
    const analysisArrays = [
      [],
      [],
      [],
      [],
    ];
    const {
      data,
    } = board;
    const {
      x,
    } = place;
    const {
      y,
    } = place;
    let index = 0;
    for (let i = -range - 1; i < range; i += 1) {
      if (i === 0) {
        for (let j = 0; j < analysisArrays.length; j += 1) {
          analysisArrays[j].push(place.color);
        }
        continue;
      }
      index = board.getIndex(i + x, y);
      if (index > -1) {
        analysisArrays[0].push(data[index]);
      }
      index = board.getIndex(x, i + y);
      if (index > -1) {
        analysisArrays[1].push(data[index]);
      }
      index = board.getIndex(i + x, i + y);
      if (index > -1) {
        analysisArrays[2].push(data[index]);
      }
      index = board.getIndex(i + x, y - i);
      if (index > -1) {
        analysisArrays[3].push(data[index]);
      }
    }
    return analysisArrays;
  }
}
/** 导出 */
export default Analyser;
