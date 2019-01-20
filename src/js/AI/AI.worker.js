import { GameTreeAI } from './gameTreeAI'
import { Board } from '../board'
const ai = new GameTreeAI(null)
const board = new Board(0, 0, [])

self.onmessage = (e) => {
  const data = e.data
  // 恢复被json破坏的接口,json在序列化对象时是忽略函数的
  board.size = data.board.size
  board.nWin = data.board.nWin
  board.data = data.board.data
  ai.init(board, data.breadth, data.depth, 2, data.timelimit)
  ai.iterativeDeepening(data.color)
  self.postMessage(ai.best)
}
