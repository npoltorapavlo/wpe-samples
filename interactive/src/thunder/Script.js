export default class Script {
  constructor() {
    this._filename = null
    this._lines = []
    this._interval = 0
  }

  get filename() {
    return this._filename
  }

  load(file) {
    let _this = this

    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest()

      xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            try {
              let json = JSON.parse(xhr.responseText)
              _this._lines = json.lines
              _this._interval = json.interval
              _this._filename = file
              resolve()
            } catch (e) {
              reject(e)
            }
          } else reject(xhr.statusText)
        }
      }

      xhr.open('GET', file)
      xhr.send(null)
    })
  }

  get interval() {
    return this._interval
  }

  get lines() {
    return this._lines
  }
}
