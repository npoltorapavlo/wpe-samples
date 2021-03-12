import ThunderClient from './ThunderClient'

import { JsonParseError } from './ThunderClient'

export { JsonParseError }

export class IdDoesntExistError extends Error {
  constructor(id) {
    super()
    this.id = id
  }
}

export class IdExistsError extends Error {
  constructor(id) {
    super()
    this.id = id
  }
}

export class ThunderAdminResponse {
  constructor(id, callsign, method, params, response) {
    this.id = id
    this.callsign = callsign
    this.method = method
    this.params = params
    this.response = response
  }
}

export class ThunderAdminEvent {
  constructor(id, callsign, event, notification) {
    this.id = id
    this.callsign = callsign
    this.event = event
    this.notification = notification
  }
}

export class ThunderAdminObserver {
  onResponse() {}
  onEvent() {}
}

export default class ThunderAdmin {
  constructor() {
    this._clients = new Map()
    this._callback = new ThunderAdminObserver()
  }

  set callback(callback) {
    this._callback = callback
  }

  _assertExists(id) {
    if (!this._clients.has(id)) throw new IdDoesntExistError(id)
  }

  _assertNotExists(id) {
    if (this._clients.has(id)) throw new IdExistsError(id)
  }

  new(id) {
    this._assertNotExists(id)
    this._clients.set(id, new ThunderClient())
  }

  delete(id) {
    this._assertExists(id)
    this._clients.delete(id)
  }

  call(id, callsign, method, params = {}) {
    this._assertExists(id)
    this._clients
      .get(id)
      .call(callsign, method, params)
      .then(
        response =>
          this._callback.onResponse(
            new ThunderAdminResponse(id, callsign, method, params, response)
          ),
        err =>
          this._callback.onResponse(new ThunderAdminResponse(id, callsign, method, params, err))
      )
  }

  on(id, callsign, event) {
    this._assertExists(id)
    this._clients.get(id).on(
      callsign,
      event,
      notification =>
        this._callback.onEvent(new ThunderAdminEvent(id, callsign, event, notification)),
      err => this._callback.onEvent(new ThunderAdminEvent(id, callsign, event, err))
    )
  }

  off(id, callsign, event) {
    this._assertExists(id)
    this._clients.get(id).off(callsign, event)
  }
}
