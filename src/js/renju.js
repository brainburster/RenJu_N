import {
  Controller,
  EState,
} from './controller';

function main() {
  const setting = document.getElementById('app-setting');
  const canvas = document.getElementById('app-canvas');
  const btnAiFrist = document.getElementById('btn-ai-frist');
  const info = document.getElementById('board-info');
  const btnUndo = document.getElementById('btn-board-undo');
  const btnDebug = document.getElementById('btn-board-debug');
  const sizeRange = document.getElementById('board-size');
  const nWinRange = document.getElementById('board-nwin');
  const depthRange = document.getElementById('board-depth');
  const breadthRange = document.getElementById('board-breadth');
  const timelimitRange = document.getElementById('board-timelimit');
  const sizeLabel = document.getElementById('board-size-value');
  const nWinLabel = document.getElementById('board-nwin-value');
  const depthLabel = document.getElementById('board-depth-value');
  const breadthLabel = document.getElementById('board-breadth-value');
  const timelimitLabel = document.getElementById('board-timelimit-value');
  const titleLabel = document.getElementById('title-value');
  const checkboxFoul = document.getElementById('checkbox-board-foul');
  const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  titleLabel.innerHTML = `<span style="color:red;">${nWinRange.value}</span>-${chineseNumbers[nWinRange.value]}`;

  sizeRange.value = localStorage.size || sizeRange.value;
  nWinRange.value = localStorage.nWin || nWinRange.value;
  depthRange.value = localStorage.depth || depthRange.value;
  breadthRange.value = localStorage.breadth || breadthRange.value;
  timelimitRange.value = localStorage.timelimit || timelimitRange.value;
  checkboxFoul.checked = localStorage.isFoul || false;

  const controller = new Controller(canvas, info, btnAiFrist, sizeRange.valueAsNumber,
    nWinRange.valueAsNumber, breadthRange.valueAsNumber, depthRange.valueAsNumber,
    timelimitRange.valueAsNumber * 100, checkboxFoul.checked);

  checkboxFoul.oninput = () => {
    controller.foulRule = checkboxFoul.checked;
  };
  btnUndo.onclick = () => {
    controller.undo();
  };
  btnDebug.onclick = () => {
    btnDebug.value = controller.changeMode();
  };

  // eslint-disable-next-line
  info.onclick = setting.onclick = function (e) {
    if (e.target.id !== this.id) {
      return;
    }
    this.style.height === '20px'
      ? this.style.height = 'auto'
      : this.style.height = '20px';
  };

  depthRange.oninput = () => {
    depthLabel.innerText = depthRange.value;
    controller.depth = Math.max(0, depthRange.valueAsNumber);
  };
  breadthRange.oninput = () => {
    breadthLabel.innerText = breadthRange.value;
    controller.breadth = Math.max(1, breadthRange.valueAsNumber);
  };
  timelimitRange.oninput = () => {
    timelimitLabel.innerText = (timelimitRange.valueAsNumber * 0.1).toFixed(1);
    controller.timelimit = Math.max(100, timelimitRange.valueAsNumber * 100);
  };
  nWinRange.oninput = () => {
    nWinLabel.innerText = nWinRange.value;
    controller.changeNWin(nWinRange.valueAsNumber);
    const chineseNumber = (nWinRange.valueAsNumber === 3 && sizeRange.valueAsNumber === 3) ? '井字' : (`${chineseNumbers[nWinRange.value]}子`);
    titleLabel.innerHTML = `<span style="color:red;">${nWinRange.value}</span>-${chineseNumber}`;
    if (nWinRange.valueAsNumber === 5) {
      checkboxFoul.removeAttribute('disabled');
    } else {
      checkboxFoul.checked = false;
      controller.foulRule = false;
      checkboxFoul.setAttribute('disabled', 'disabled');
    }
  };

  sizeRange.oninput = () => {
    const value = isNaN(sizeRange.valueAsNumber) ? 15 : sizeRange.valueAsNumber;
    sizeLabel.innerText = value;
    nWinRange.value = Math.min(value, 5);
    nWinRange.oninput();
    controller.changeSize(value);
    controller.state = EState.start;
  };

  if (controller.isIE) {
    depthRange.onmouseup = depthRange.oninput;
    breadthRange.onmouseup = breadthRange.oninput;
    timelimitRange.onmouseup = timelimitRange.oninput;
    nWinRange.onmouseup = nWinRange.oninput;
    sizeRange.onmouseup = sizeRange.oninput;
    checkboxFoul.onclick = checkboxFoul.oninput;
  }

  depthRange.oninput();
  breadthRange.oninput();
  timelimitRange.oninput();
  sizeRange.oninput();
  nWinRange.value = localStorage.nWin || nWinRange.value;
  nWinRange.oninput();

  window.onunload = () => {
    localStorage.size = sizeRange.value;
    localStorage.nWin = nWinRange.value;
    localStorage.depth = depthRange.value;
    localStorage.breadth = breadthRange.value;
    localStorage.timelimit = timelimitRange.value;
    localStorage.isFoul = checkboxFoul.checked;
    return true;
  };

  const btnDefault = document.getElementById('btn-board-default');

  btnDefault.onclick = () => {
    sizeRange.value = 15;
    nWinRange.value = 5;
    depthRange.value = 10;
    breadthRange.value = 6;
    timelimitRange.value = 5;
    checkboxFoul.checked = true;
    setTimeout(() => {
      depthRange.oninput();
      breadthRange.oninput();
      timelimitRange.oninput();
      sizeRange.oninput();
      nWinRange.oninput();
    }, 50);
  };
}

window.onload = () => {
  main();
};
