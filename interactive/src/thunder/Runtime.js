import ClientPool from './ClientPool'
import Command from './Command'

export default class Runtime {
  constructor() {
    this._pool = new ClientPool()
    this._substitute = new Map()
    this._observers = []
  }

  registerObserver(observer) {
    this._observers.push(observer)
  }

  unregisterObserver(observer) {
    let index = this._observers.indexOf(observer)
    if (index !== -1) {
      this._observers.splice(index, 1)
    }
  }

  clear() {
    this._pool.clear()
    this._substitute = new Map()
    this._observers = []
  }

  process(input) {
    input = input.replace(/<<<([^>]+)>>>/g, (match, p1) => {
      if (this._substitute.has(p1)) return this._substitute.get(p1)
      return ''
    })

    this.notifyObservers('onCommand', input)

    let cmd = new Command(input)
    if (cmd.type === 'new') {
      this._pool.new(cmd.id)
    } else if (cmd.type === 'delete') {
      this._pool.delete(cmd.id)
    } else {
      let client = this._pool.get(cmd.id)
      let fn = client[cmd.type]
      let newArgs = cmd.toArray().slice(2)
      if (cmd.type === 'on') {
        // Add event listeners
        newArgs.splice(
          2,
          0,
          notification => this.onEvent(notification, cmd),
          err => this.onEvent(err, cmd)
        )
      }
      let result = fn.apply(client, newArgs)
      if (cmd.type === 'call') {
        // Add call result listeners
        result.then(
          response => this.onResponse(response, cmd),
          err => this.onResponse(err, cmd)
        )
      }
      return result
    }
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

  onResponse(response, cmd) {
    this.addSubstitute(`${cmd.id}.${cmd.callsign}.${cmd.method}`, response)
    this.notifyObservers('onResponse', response, cmd)
  }

  onEvent(notification, cmd) {
    this.addSubstitute(`${cmd.id}.${cmd.callsign}.${cmd.eventName}`, notification)
    this.notifyObservers('onEvent', notification, cmd)
  }

  notifyObservers(message, ...otherArgs) {
    for (const observer of this._observers) {
      let fn = observer[message]
      if (fn) fn.apply(observer, otherArgs)
      else throw new Error(`Observer has no method '${message}'`)
    }
  }
}
