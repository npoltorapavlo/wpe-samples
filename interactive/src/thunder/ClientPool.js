import Client from './Client'

export default class ClientPool {
  constructor() {
    this._clients = new Map()
  }

  _assertExists(id) {
    if (!this._clients.has(id)) throw new Error(`Id '${id}' doesn't exist`)
  }

  _assertNotExists(id) {
    if (this._clients.has(id)) throw new Error(`Id '${id}' already exists`)
  }

  new(id) {
    this._assertNotExists(id)
    this._clients.set(id, new Client())
  }

  delete(id) {
    this._assertExists(id)
    this._clients.get(id).clear()
    this._clients.delete(id)
  }

  get(id) {
    this._assertExists(id)
    return this._clients.get(id)
  }

  clear() {
    console.log('cleaning clients')
    this._clients.forEach((value, key) => {
      console.log(`cleaning client ${key}`)
      value.clear()
    })

    this._clients.clear()
  }
}
