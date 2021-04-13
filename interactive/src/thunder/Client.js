import ThunderJS from 'ThunderJS'

const thunderConfig = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  debug: true,
}

export default class Client {
  constructor() {
    this._thunder = ThunderJS(thunderConfig)
    this._listeners = new Map()
  }

  call(callsign, method, params = {}) {
    return this._thunder.call(callsign, method, params)
  }

  on(callsign, event, callback, error) {
    let id = callsign + '.' + (typeof event === 'object' ? JSON.stringify(event) : event)

    // Cleanup, if needed
    if (this._listeners.has(id)) {
      this.off(callsign, event)
    }

    this._listeners.set(id, this._thunder.on(callsign, event, callback, error))
  }

  off(callsign, event) {
    let id = callsign + '.' + (typeof event === 'object' ? JSON.stringify(event) : event)

    // To unsubscribe, ThunderJS provides 'dispose'
    if (this._listeners.has(id)) {
      this._listeners.get(id).dispose()
      this._listeners.delete(id)
    }
  }

  clear() {
    console.log('cleaning listeners')
    this._listeners.forEach((value, key) => {
      console.log(`cleaning listener ${key}`)
      value.dispose()
    })

    this._listeners.clear()
  }
}
