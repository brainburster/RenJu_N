/**
 * 走法类
 */
class Place {
  constructor(x, y, color, score = 0) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.score = score;
  }
}

/**
 * 构造棋盘
 * @param  {number} size 棋盘大小
 * @param  {number} nWin 多少个子连在一起算赢
 * @param  {number[]} data 构造数据
 */
class Board {
  constructor(size = 15, nWin = 5, data = []) {
    if (size < 0 || nWin < 0) {
      throw new Error(`size or nWin < 0,\n size : ${size} \n nWin : ${nWin}`);
    }
    this.size = size;
    this.nWin = nWin;
    this.data = new Array(size * size);
    this.initData(size, data);
  }

  getXY(index) {
    const x = index % this.size;
    const y = Math.floor(index / this.size);
    return {
      x,
      y,
    };
  }

  getIndex(x, y) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) {
      return -1;
    }
    return x + y * this.size;
  }

  clone() {
    const newBoard = new Board(this.size, this.nWin, this.data /* .clone() */);
    return newBoard;
  }

  hash() {
    const hashcode = this.data.hash();
    return hashcode;
  }

  getColor(x, y) {
    return this.data[this.getIndex(x, y)];
  }

  placeStone(place) {
    const index = this.getIndex(place.x, place.y);
    if (place.x < 0 || place.x >= this.size || this.data[index] !== 0) {
      return false;
    }
    this.data[index] = place.color;
    return true;
  }

  debug(x, y) {
    const index = this.getIndex(x, y);
    let color = this.data[index];
    switch (color) {
      case 0:
        color = 1;
        break;
      case 1:
        color = -1;
        break;
      case -1:
        color = 0;
        break;
      default:
        break;
    }
    this.data[index] = color;
  }

  clearStone(x, y) {
    const index = this.getIndex(x, y);
    if (index < 0) {
      return false;
    }
    this.data[index] = 0;
    return true;
  }

  undo(place) {
    return this.clearStone(place.x, place.y);
  }

  initData(size, data = []) {
    this.data.length = size * size;
    for (let i = 0; i < size * size; i += 1) {
      if (data[i] === -1 || data[i] === 1) {
        this.data[i] = data[i];
      } else {
        this.data[i] = 0;
      }
    }
  }

  /**
   * 没有创建新对象
   */
  reSet(size, nWin, data = []) {
    if (size <= 0 || nWin <= 0) {
      throw new Error(`size or nWin <= 0,\n size : ${size} \n nWin : ${nWin}`);
    }
    this.size = size;
    this.nWin = nWin;
    this.initData(size, data);
  }
}

export {
  Board,
  Place,
};
