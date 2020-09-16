import ThunderJS from 'ThunderJS'

const Callsign = 'org.rdk.PersistentStore'

const thunderConfig = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  // debug: true,
}

export default class PersistentStore {
  constructor() {
    this._events = new Map()
  }

  registerEvent(eventId, callback) {
    this._events.set(eventId, callback)
  }

  get thunder() {
    if (!this._thunder) this._thunder = ThunderJS(thunderConfig)
    return this._thunder
  }

  activate() {
    return this.thunder.Controller.activate({ callsign: Callsign }).then(() => {
      this.thunder.on(Callsign, 'onStorageExceeded', notification => {
        console.log('onStorageExceeded ' + JSON.stringify(notification))
        this._events.get('onStorageExceeded')(notification)
      })
    })
  }

  deactivate() {
    this._events = new Map()
    return this.thunder.Controller.deactivate({ callsign: Callsign })
  }

  setValue(namespace, key, value) {
    return this.thunder.call(Callsign, 'setValue', {
      namespace: namespace,
      key: key,
      value: value,
    })
  }

  getValue(namespace, key) {
    return this.thunder.call(Callsign, 'getValue', {
      namespace: namespace,
      key: key,
    })
  }

  deleteKey(namespace, key) {
    return this._thunder.call(Callsign, 'deleteKey', {
      namespace: namespace,
      key: key,
    })
  }

  deleteNamespace(namespace) {
    return this.thunder.call(Callsign, 'deleteNamespace', {
      namespace: namespace,
    })
  }

  getKeys(namespace) {
    return this.thunder.call(Callsign, 'getKeys', {
      namespace: namespace,
    })
  }

  getNamespaces() {
    return this.thunder.call(Callsign, 'getNamespaces')
  }

  getStorageSize() {
    return this.thunder.call(Callsign, 'getStorageSize')
  }
}
