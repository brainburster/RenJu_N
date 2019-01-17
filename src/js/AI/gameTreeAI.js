import { GreedAI } from './simpleAI'
import { Analyser } from './analyser'

/**
 * 博弈树AI，继承自贪心AI，依赖于分析类
 * @todo todolist
 * - [x] 启发式排序
 * - [x] 博弈树（使用了负极大值算法，与极大极小值算法类似）
 * - [x] alpha-beta减枝
 * - [x] 启发式减枝
 * - [ ] 迭代深化
 * - [ ] 时限
 * - [ ] 置换表
 * - [ ] 开局库
 * - [ ] 禁手
 * - [ ] 多线程
 * - [ ] AI设置界面
 * - [ ] 其他功能
 */
class GameTreeAI extends GreedAI {
  constructor (controller, maxBreadth, maxDepth, searchRange = 2) {
    super(controller)
    this.controller = controller
    this.searchRange = Math.max(searchRange, 1)
    this.maxBreadth = Math.max(maxBreadth, 1)
    this.maxDepth = Math.max(maxDepth, 1)
    this.best = null
  }

  /** 获取最佳下法 */
  think (color, depth, alpha, beta) {
    const openlist = this.getNexts(color, depth === this.maxDepth ? this.searchRange : 1)
    if (openlist.length === 0) {
      return 0 // 将平局分数设置为零，不然AI会避免平局
    }
    openlist.length = Math.min(openlist.length, this.maxBreadth)// 启发式减枝，限制每次递归的广度
    // 遍历每一个可行下法
    for (const place of openlist) {
      if (this.lastPlace === null && depth === this.maxDepth) {
        this.best = place // 默认值为启发式排序中的第一个下法
      }
      if (depth < 1) {
        return Analyser.getScore(this.board, color) - Analyser.getScore(this.board, -color)
      }

      this.board.placeStone(place)// 下棋
      if (Analyser.isWin(this.board, place)) {
        place.score = 100000 + depth // 加上这个深度是为了让AI认为：早点胜利分值更高
      } else {
        // 对方分数的相反数，就是己方的分数，（这对估值函数有一定要求，不然depth的奇偶性会造成摇摆）
        place.score = -this.think(-color, depth - 1, -beta, -alpha)
      }
      this.board.undo(place)// 还原棋盘

      if (place.score > alpha) {
        alpha = place.score// 下界提升
        if (depth === this.maxDepth) {
          this.best = place
        }
      }
      if (place.score >= beta) {
        break // 减枝
      }
    }
    return alpha
  }

  /** AI执行函数 */
  run (color, callback) {
    this.best = null
    // 这里延时是为了留出时间让界面得以渲染，并不是多线程，多线程要通过worker或ajax实现
    setTimeout(() => {
      this.think(color, this.maxDepth, -10e8, 10e8)
      callback(this.best)// 如果为best为null则判定为平局
    }, 20)
  }
}

export {
  GameTreeAI
}
