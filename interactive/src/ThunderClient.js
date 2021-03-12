import ThunderJS from 'ThunderJS'

export class JsonParseError extends Error {
  constructor(json) {
    super()
    this.json = json
  }
}

const thunderConfig = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  debug: true,
}

export default class ThunderClient {
  constructor() {
    this._thunder = ThunderJS(thunderConfig)

    // Collection of ThunderJS listeners
    this._listeners = new Map()
  }

  call(callsign, method, params = {}) {
    // ThunderJS accepts JSON objects
    if (typeof params === 'string') {
      let str = params
      try {
        params = JSON.parse(str)
      } catch (e) {
        throw new JsonParseError(str)
      }
      if (!params || typeof params !== 'object') {
        throw new JsonParseError(str)
      }
    }

    return this._thunder.call(callsign, method, params)
  }

  on(callsign, event, callback, error) {
    let id = callsign + '.' + event

    // Cleanup, if needed
    if (this._listeners.has(id)) {
      this.off(callsign, event)
    }

    this._listeners.set(id, this._thunder.on(callsign, event, callback, error))
  }

  off(callsign, event) {
    let id = callsign + '.' + event

    // To unsubscribe, ThunderJS provides 'dispose'
    if (this._listeners.has(id)) {
      this._listeners.get(id).dispose()
      this._listeners.delete(id)
    }
  }
}
