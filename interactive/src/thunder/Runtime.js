import Admin from '../thunder/Admin'

export default class Runtime {
  constructor(updateListener) {
    this._admin = new Admin()
    this._updateListener = updateListener
  }

  process(cmd) {
    let match

    if ((match = cmd.match(/^([^\s]+)\s+new$/))) {
      let id = match[1]

      this._admin.new(id)
    } else if ((match = cmd.match(/^([^\s]+)\s+delete$/))) {
      let id = match[1]

      this._admin.delete(id)
    } else if ((match = cmd.match(/^([^\s]+)\s+on\s+([^\s]+)\s+(.+)$/))) {
      let id = match[1]
      let callsign = match[2]
      let event = match[3]

      this._admin.on(
        id,
        callsign,
        event,
        notification => this.onEvent(notification, id, callsign, event),
        err => this.onEvent(err, id, callsign, event)
      )
    } else if ((match = cmd.match(/^([^\s]+)\s+off\s+([^\s]+)\s+(.+)$/))) {
      let id = match[1]
      let callsign = match[2]
      let event = match[3]

      this._admin.off(id, callsign, event)
    } else if ((match = cmd.match(/^([^\s]+)\s+call\s+([^\s]+)\s+([^\s]+)\s+(.+)$/))) {
      let id = match[1]
      let callsign = match[2]
      let method = match[3]
      let params = match[4]

      this._admin.call(id, callsign, method, params).then(
        response => this.onResponse(response, id, callsign, method, params),
        err => this.onResponse(err, id, callsign, method, params)
      )
    } else if ((match = cmd.match(/^([^\s]+)\s+call\s+([^\s]+)\s+(.+)$/))) {
      let id = match[1]
      let callsign = match[2]
      let method = match[3]

      this._admin.call(id, callsign, method).then(
        response => this.onResponse(response, id, callsign, method),
        err => this.onResponse(err, id, callsign, method)
      )
    } else {
      throw new Error(`Bad cmd '${cmd}'`)
    }
  }

  onResponse(response, id, callsign, method, params) {
    console.log(`Got response for ${method}`)

    this.notify(
      `Id=${id} Callsign=${callsign} ` +
        `Method=${method} Params=${JSON.stringify(params)} ` +
        `Response=${JSON.stringify(response)}`
    )
  }

  onEvent(notification, id, callsign, event) {
    console.log(`Got event ${event}`)

    this.notify(
      `Id=${id} Callsign=${callsign} Event=${event} ` +
        `Notification=${JSON.stringify(notification)}`
    )
  }

  notify(message) {
    if (this._updateListener) {
      this._updateListener(message)
    }
  }
}
