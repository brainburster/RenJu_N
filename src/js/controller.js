import {
  Board,
  Place,
} from './board';
import {
  Renderer,
  EStoneColor,
} from './renderer';
import Analyser from './AI/analyser';
import GameTreeAI from './AI/gameTreeAI';
import AIWorker from './AI/AI.worker';
import Logger from './logger';

const EState = {
  init: 0,
  start: 1,
  waitplayer: 2,
  waitAI: 3,
  end: 4,
};

class Controller {
  constructor(canvas, info, btnAiFrist, size = 15, nWin = 5,
    breadth = 8, depth = 8, timelimit = 300, foulRule = true) {
    this.state = EState.init; // 游戏的状态
    this.foulRule = foulRule; // 是否有禁手规则
    this.pointer = {
      x: NaN,
      y: NaN,
    }; // 落子提示
    this.playerColor = -1; // -1代表黑色
    this.stoneList = []; // 记录下过的棋子
    this.foulList = []; // 禁手提示
    this.lastTime = new Date();
    this.breadth = breadth;
    this.depth = depth;
    this.timelimit = timelimit;
    this.info = info;
    this.canvas = canvas;
    this.logger = new Logger(info);
    this.board = new Board(size, nWin);
    this.renderer = new Renderer(this);

    // 是否为IE
    this.isIE = !!window.ActiveXObject || 'ActiveXObject' in window;

    this.registerAI();

    canvas.onmouseup = () => {
      this.pointer.x = NaN;
      this.pointer.y = NaN;
    };

    canvas.onclick = (e) => {
      if (this.debugMode) {
        this.debugBoard(e.offsetX, e.offsetY);
        btnAiFrist.disabled = true;
        btnAiFrist.style.display = 'none';
        return false;
      }

      switch (this.state) {
        case EState.init:
        case EState.start:
          btnAiFrist.disabled = true;
          btnAiFrist.style.display = 'none';
          // eslint-disable-next-line no-fallthrough
        case EState.waitplayer:
          this.placeStone(e.offsetX, e.offsetY);
          break;
        case EState.waitAI:
          this.log('别着急，AI正在思考对策');
          break;
        case EState.end:
          window.confirm('游戏已结束，刷新页面?')
            ? window.location.reload()
            : window.alert('你也可以通过调整棋盘大小来刷新棋盘');
          break;
        default:
          break;
      }
      return false;
    };

    canvas.onmousemove = (e) => {
      this.pointer.x = e.offsetX;
      this.pointer.y = e.offsetY;
    };

    btnAiFrist.onclick = () => {
      const center = Math.floor(this.board.size / 2);
      const place = new Place(center, center, this.playerColor);
      this.board.placeStone(place);
      this.stoneList.push(place);
      // this.swapColor()
      this.playerColor *= -1;
      btnAiFrist.disabled = true;
      btnAiFrist.style.display = 'none';
      this.log('AI先手默认下在中心点');
    };

    this.renderer.updataLoop(60); // 渲染驱动
    this.state = EState.start;
  }

  log(line1, line2, line3) {
    this.logger.log(line1, line2, line3);
  }

  update() {
    this.renderer.update(); // 手动更新棋盘
  }

  /** 交换正常模式与debug模式 */
  changeMode() {
    this.debugMode = !this.debugMode;
    this.debugMode
      ? this.log('1.点击空白交叉点会生成白棋',
        '2.点击白棋会变成黑棋',
        '3.点击黑棋会使其消失')
      : this.log('取消调试模式');
    return this.debugMode ? '正常模式' : '调试模式'; // 按钮上显示的是反的
  }

  /** 修改棋盘大小 */
  changeSize(newSize) {
    this.board.reSet(newSize, this.board.nWin);
    this.stoneList.length = 0;
  }

  /** 修改获胜所需的同一个方向上的棋子数量 */
  changeNWin(newNWin) {
    this.board.nWin = newNWin;
  }

  undo(twice = true, lastUndo = undefined) {
    if (this.stoneList.length === 0) {
      this.board.reSet(this.board.size, this.board.nWin);
      this.log('已清理棋盘');
      return;
    }
    const point = this.stoneList.pop();
    if (point === undefined) {
      return;
    }
    if (twice) {
      twice = point.color !== this.playerColor;
    }
    this.board.undo(point);
    this.playerColor *= -1;
    this.state = EState.waitplayer;
    this.log(
      `撤销:${lastUndo === undefined ? '*' : JSON.stringify(lastUndo)}`,
      `撤销:${lastUndo === undefined ? '*' : JSON.stringify(point)}`,
      '撤销完毕',
    );
    // 递归
    if (twice) {
      this.undo(false, point);
    }
  }

  placeStone(offsetX, offsetY) {
    const gridSize = this.renderer.canvasSize / this.board.size;
    const x = Math.round(offsetX / gridSize - 0.5);
    const y = Math.round(offsetY / gridSize - 0.5);
    const place = new Place(x, y, this.playerColor);

    const isOK = this.board.placeStone(place);
    if (!isOK) {
      return;
    }
    this.stoneList.push(place);
    if (this.foulRule) {
      let isFoul = Analyser.isFoul(this.board, place);
      if (isFoul) {
        isFoul = `你输了：${isFoul}`;
        this.log(isFoul);
        window.alert(isFoul);
        this.state = EState.end;
        return;
      }
    }
    const isWin = Analyser.isWin(this.board, place);
    if (isWin) {
      this.log('你赢了');
      window.alert('你赢了');
      this.state = EState.end;
      return;
    }
    this.state = EState.waitAI;
    this.log('AI正在思考中');
    this.lastTime = new Date();

    this.runAI();
  }

  runAI() {
    if (this.isIE) { // 启动单线程版本的AI
      this.AI.init(this.board, this.breadth, this.depth, 2, this.timelimit);
      this.AI.run(-this.playerColor, this.foulRule, this.aiBehavior);
    } else { // 把数据传给多线程版的AI
      this.AIWorker.postMessage({
        color: -this.playerColor,
        board: this.board, // 传输过程经过了json化，因此接口被破坏了，需要在AI.worker.js中修复
        depth: this.depth,
        breadth: this.breadth,
        timelimit: this.timelimit,
        foulRule: this.foulRule,
      });
    }
  }

  registerAI() {
    this.aiBehavior = (best) => {
      if (best === null || isNaN(best.x) || isNaN(best.y)) {
        this.state = EState.end;
        this.log('平局');
        window.alert('平局');
        return;
      }
      const isOK = this.board.placeStone(best);
      if (!isOK) {
        this.log('你赢了，AI错误');
        window.alert('你赢了，AI错误');
        this.state = EState.end;
        return;
      }
      if (this.foulRule) {
        let isFoul = Analyser.isFoul(this.board, best);
        if (isFoul) {
          isFoul = `你赢了，AI：${isFoul}`;
          this.log(isFoul);
          window.alert(isFoul);
          this.state = EState.end;
          return;
        }
      }
      const isWin = Analyser.isWin(this.board, best);
      this.stoneList.push(best);
      if (isWin) {
        this.state = EState.end;
        this.log('你输了');
        window.alert('你输了');
        return;
      }
      const delayTime = Math.max((new Date()).getTime() - this.lastTime.getTime(), 20);
      this.log(
        `黑方分数:${Analyser.getScore(this.board, EStoneColor.black)},白方分数:${Analyser.getScore(this.board, EStoneColor.white)}`,
        `AI估值:${best.score}`,
        `AI思考时间:${delayTime / 1000}秒,递归深度:${best.depth}`,
      );
      if (this.foulRule) {
        this.foulList.length = 0; // 更新
        this.board.data.forEach((value, index) => {
          if (value !== 0) {
            return;
          }
          const {
            x,
            y,
          } = this.board.getXY(index);
          const test = {
            x,
            y,
            color: this.playerColor,
          };
          if (Analyser.isFoul(this.board, test)) {
            this.foulList.push(test);
          }
        });
      }
      this.state = EState.waitplayer;
    };

    if (this.isIE) {
      this.AI = new GameTreeAI(this.board, this.breadth, this.depth, 2,
        Math.max(100, this.timelimit));
    } else {
      this.AIWorker = new AIWorker(); // 多线程版本的GameTreeAI
      window.onunload = () => {
        this.AIWorker.terminate(); // 关闭worker
      };
      this.AIWorker.onmessage = (e) => {
        const best = e.data;
        this.aiBehavior(best);
      };
    }
  }

  debugBoard(offsetX, offsetY) {
    this.stoneList.length = 0;
    const gridSize = this.renderer.canvasSize / this.board.size;
    const x = Math.round(offsetX / gridSize - 0.5);
    const y = Math.round(offsetY / gridSize - 0.5);
    this.board.debug(x, y);
    this.state = EState.waitplayer;
  }
}

export {
  Controller,
  EState,
};
