export default class Command {
  constructor(cmd) {
    if (cmd) this.fromString(cmd)
  }

  get id() {
    return this._id
  }

  set id(value) {
    this._id = value
  }

  get type() {
    return this._type
  }

  set type(value) {
    this._type = value
  }

  get method() {
    return this._method
  }

  set method(value) {
    this._method = value
  }

  get callsign() {
    return this._callsign
  }

  set callsign(value) {
    this._callsign = value
  }

  get params() {
    return this._params
  }

  set params(value) {
    // ThunderJS accepts JSON objects
    if (typeof value === 'string') {
      this._params = JSON.parse(value)
    } else {
      this._params = value
    }
  }

  get event() {
    return this._event
  }

  get eventName() {
    if (typeof this._event === 'string') return this._event
    return this._event.event
  }

  set event(value) {
    // ThunderJS accepts { event: ..., prefix: ... } or event name
    if (typeof value === 'string' && value[0] === '{') {
      this._event = JSON.parse(value)
    } else {
      this._event = value
    }
  }

  fromString(cmd) {
    let match

    if ((match = cmd.match(/^([^\s]+)\s+new$/))) {
      this.id = match[1]
      this.type = 'new'
    } else if ((match = cmd.match(/^([^\s]+)\s+delete$/))) {
      this.id = match[1]
      this.type = 'delete'
    } else if ((match = cmd.match(/^([^\s]+)\s+on\s+([^\s]+)\s+(.+)$/))) {
      this.id = match[1]
      this.type = 'on'
      this.callsign = match[2]
      this.event = match[3]
    } else if ((match = cmd.match(/^([^\s]+)\s+off\s+([^\s]+)\s+(.+)$/))) {
      this.id = match[1]
      this.type = 'off'
      this.callsign = match[2]
      this.event = match[3]
    } else if ((match = cmd.match(/^([^\s]+)\s+call\s+([^\s]+)\s+([^\s]+)\s+(.+)$/))) {
      this.id = match[1]
      this.type = 'call'
      this.callsign = match[2]
      this.method = match[3]
      this.params = match[4]
    } else if ((match = cmd.match(/^([^\s]+)\s+call\s+([^\s]+)\s+(.+)$/))) {
      this.id = match[1]
      this.type = 'call'
      this.callsign = match[2]
      this.method = match[3]
      this.params = {}
    } else {
      throw new Error(`invalid input '${cmd}'`)
    }
  }

  toArray() {
    switch (this.type) {
      case 'new':
      case 'delete':
        return [this.id, this.type]
      case 'on':
      case 'off':
        return [this.id, this.type, this.callsign, this.event]
      case 'call':
        return [this.id, this.type, this.callsign, this.method, this.params]
      default:
        return null
    }
  }
}
