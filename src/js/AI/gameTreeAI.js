import GreedAI from './simpleAI';
import Analyser from './analyser';

/**
 * 博弈树AI，继承自贪心AI，依赖于分析类
 * @todo todolist
 * - [x] 启发式排序
 * - [x] 博弈树（使用了负极大值算法，与极大极小值算法类似）
 * - [x] alpha-beta减枝
 * - [x] 启发式减枝
 * - [x] 迭代深化
 * - [x] 时限
 * - [ ] 置换表
 * - [ ] 开局库
 * - [x] 禁手
 * - [x] 多线程
 * - [x] AI设置界面
 * - [ ] 其他功能
 */
class GameTreeAI extends GreedAI {
  constructor(board, maxBreadth = 1, maxDepth = 1, searchRange = 2, timelimit = 100) {
    super(board);
    this.init(board, maxBreadth, maxDepth, searchRange, timelimit);
  }

  init(board, maxBreadth = 1, maxDepth = 1, searchRange = 2, timelimit = 100) {
    this.board = board;
    this.searchRange = Math.max(searchRange, 1);
    this.maxBreadth = Math.max(maxBreadth, 1);
    this.maxDepth = Math.max(maxDepth, 1);
    this.timeout = false;
    this.lasttime = new Date();
    this.timelimit = Math.max(timelimit, 100);
    this.best = null;
  }

  /** 获取最佳下法 */
  think(color, depth, alpha, beta, foulRule) {
    // 如果是叶子节点则直接返回分数
    if (depth < 1) {
      return Analyser.getScore(this.board, color) - Analyser.getScore(this.board, -color);
    }
    const openlist = this.getNexts(color, depth === this.maxDepth ? this.searchRange : 1);
    if (openlist.length === 0) {
      return 0; // 将平局分数设置为零，不然AI会避免平局
    }
    openlist.length = Math.min(openlist.length, this.maxBreadth); // 启发式减枝，限制每次递归的广度
    // 遍历每一个可行下法
    for (const place of openlist) {
      if (this.best === null) {
        this.best = place; // 默认值为由贪心算法决定的估值最大的一个下法
      }
      // 超时检测
      if (this.maxDepth === depth && this.best !== null) {
        if ((new Date()).getTime() - this.lasttime.getTime() > this.timelimit) {
          this.timeout = true;
          return 0;
        }
      }
      this.board.placeStone(place); // 下棋
      if (Analyser.isWin(this.board, place)) {
        place.score = 100000 + depth;
      } else if (foulRule && Analyser.isFoul(this.board, place)) {
        place.score = -100000 - depth;
      } else {
        place.score = -this.think(-color, depth - 1, -beta, -alpha, foulRule);
      }
      this.board.undo(place); // 还原棋盘

      if (place.score > alpha) {
        alpha = place.score; // 下界提升
        if (depth === this.maxDepth) {
          this.best = place;
        }
      }
      if (place.score >= beta) {
        break; // 减枝
      }
    }
    return alpha;
  }

  /** 迭代深化 */
  iterativeDeepening(color, foulRule) {
    this.lasttime = new Date();
    this.timeout = false;
    this.best = null;
    const maxDepthOld = this.maxDepth;

    for (let depth = 1; depth <= maxDepthOld; depth += 1) {
      this.maxDepth = depth;
      this.think(color, depth, -1000000, 1000000, foulRule);
      if (this.timeout || this.best === null) {
        break;
      }
      if (this.best !== null && this.best.score >= 100000) {
        break;
      }
      // todo:将最优点加入置换表 然后在启发式搜索函数中获取将此下法的排序提前
      // ...
    }
    this.timeout = false;
    if (this.best) {
      this.best.depth = this.maxDepth;
    }
    this.maxDepth = maxDepthOld;
  }

  /** AI执行函数 */
  run(color, foulRule, callback) {
    setTimeout(() => {
      this.iterativeDeepening(color, foulRule);
      callback(this.best);
    }, 20);
  }
}

export default GameTreeAI;
