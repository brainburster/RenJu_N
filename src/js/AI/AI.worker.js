import GameTreeAI from './gameTreeAI';
import {
  Board,
} from '../board';

const ai = new GameTreeAI(null);
const board = new Board(0, 0, []);

self.onmessage = (e) => {
  const {
    data,
  } = e;
  // 恢复接口
  board.size = data.board.size;
  board.nWin = data.board.nWin;
  board.data = data.board.data;
  ai.init(board, data.breadth, data.depth, 2, data.timelimit);
  ai.iterativeDeepening(data.color, data.foulRule);
  self.postMessage(ai.best);
};
