import Runtime from './Runtime'
import { JsonParseError } from './Client'

export default class FileScript extends Runtime {
  constructor(file, updateListener) {
    super(updateListener)

    this._lines = []
    this._index = 0
    this._interval = 0
    this._substitute = new Map()

    this.notify(`Script loading from ${file}`)

    this.load(file).then(this.schedule.bind(this), this.notify.bind(this))
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
              _this._index = 0
              _this._interval = json.interval

              _this.notify(`Script loaded. ${_this._lines.length} lines`)

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

  schedule() {
    setTimeout(() => {
      let cmd = this._lines[this._index++]
      if (cmd) {
        try {
          cmd = cmd.replace(/<<<([^>]+)>>>/g, (match, p1) => {
            if (this._substitute.has(p1)) return this._substitute.get(p1)
            return ''
          })

          this.notify(`Script line: ${cmd}`)

          this.process(cmd)
        } catch (e) {
          this.notify(`Error: ${e}`)
        }

        this.schedule()
      } else {
        this.notify('Script Ended')
      }
    }, this._interval)
  }

  addSubstitute(key, value) {
    if (value && typeof value === 'object') {
      for (let [k, v] of Object.entries(value)) {
        this.addSubstitute(key + '.' + k, v)
      }
    } else if (typeof value === 'string') {
      console.debug(`${key} -> ${value}`)

      this._substitute.set(key, value)
    }
  }

  onResponse(response, id, callsign, method, params) {
    super.onResponse(response, id, callsign, method, params)

    this.addSubstitute(`${id}.${callsign}.${method}`, response)
  }

  onEvent(notification, id, callsign, event) {
    super.onEvent(notification, id, callsign, event)

    let key = `${id}.${callsign}.${event}`
    if (typeof event === 'string' && event[0] === '{') {
      key = `${id}.${callsign}.${JSON.parse(event).event}`
    }

    this.addSubstitute(key, notification)
  }
}
