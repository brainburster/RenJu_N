/**
 * 把JSON和{}简单封装了一下，以后应该用得到
 */
class DictionaryByJSON {
  constructor () {
    this.buffer = {}
  }
  contains (key) {
    if (this.buffer.hasOwnProperty(JSON.stringify(key))) {
      return true
    }
    return false
  }
  set (key, value) {
    const kType = typeof (key)
    switch (kType) {
      case 'object':
      case 'function':
        this.buffer[JSON.stringify(key)] = value
        break
      default:
        this.buffer[key] = value
        break
    }
  }
  get (key) {
    const kType = typeof (key)
    switch (kType) {
      case 'object':
      case 'function':
        return this.buffer[JSON.stringify(key)]
      default:
        return this.buffer[key]
    }
  }
  remove (key) {
    const kType = typeof (key)
    switch (kType) {
      case 'object':
      case 'function':
        this.buffer[JSON.stringify(key)] = undefined
        break
      default:
        this.buffer[key] = undefined
        break
    }
  }
  clear () {
    // this.buffer = {}
    for (const key in this.buffer) {
      if (this.buffer.hasOwnProperty(key)) {
        this.buffer[key] = undefined
      }
    }
  }
}

export {
  DictionaryByJSON
}
