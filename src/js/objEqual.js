/** 判断两个嵌套的object是否相等 */
class Equal {
  static equal(any1, any2) {
    const type1 = typeof (any1);
    const type2 = typeof (any2);
    if (type1 !== type2) {
      return false;
    }
    if (type1 === 'function') {
      if (any1.toString() === any2.toString()) {
        return true;
      }
    } else if (type1 === 'object') {
      if (any1 === any2) {
        return true;
      }
      if (any1 === null || any2 === null) {
        return false;
      }
      if (any1.toString() !== any2.toString()) {
        return false;
      }
      // eslint-disable-next-line no-restricted-syntax
      for (const k in any1) {
        // eslint-disable-next-line no-prototype-builtins
        if (any1.hasOwnProperty(k)) {
          // eslint-disable-next-line no-prototype-builtins
          if (any2.hasOwnProperty(k)) {
            if (!Equal.equal(any2[k], any1[k])) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    }
    return any1 === any2;
  }
}

export default Equal;
