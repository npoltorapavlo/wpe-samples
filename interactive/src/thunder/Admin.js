import Client from './Client'

import { JsonParseError } from './Client'

export { JsonParseError }

export class IdDoesntExistError extends Error {
  constructor(id) {
    super()
    this.id = id
    this.message = `Id '${id}' doesn't exist`
  }
}

export class IdExistsError extends Error {
  constructor(id) {
    super()
    this.id = id
    this.message = `Id '${id}' already exists`
  }
}

export default class Admin {
  constructor() {
    this._clients = new Map()
  }

  _assertExists(id) {
    if (!this._clients.has(id)) throw new IdDoesntExistError(id)
  }

  _assertNotExists(id) {
    if (this._clients.has(id)) throw new IdExistsError(id)
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

  call(id, callsign, method, params = {}) {
    this._assertExists(id)
    return this._clients.get(id).call(callsign, method, params)
  }

  on(id, callsign, event, notificationHandler, errorHandler) {
    this._assertExists(id)
    this._clients.get(id).on(callsign, event, notificationHandler, errorHandler)
  }

  off(id, callsign, event) {
    this._assertExists(id)
    this._clients.get(id).off(callsign, event)
  }
}
