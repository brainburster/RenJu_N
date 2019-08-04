/** Log */
class Logger {
  constructor(info) {
    this.info = info;
  }

  log(line1, line2, line3) {
    if (line2 === undefined && line3 === undefined) {
      line2 = line1;
      line1 = ' ';
      line3 = ' ';
    }
    this.info.innerText = `${line1}\n${line2}\n${line3}\n`;
  }
}

export default Logger;
