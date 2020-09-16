import ThunderJS from 'ThunderJS'

const Callsign = 'org.rdk.Warehouse'

const thunderConfig = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  // debug: true,
}

export default class Warehouse {
  get thunder() {
    if (!this._thunder) this._thunder = ThunderJS(thunderConfig)
    return this._thunder
  }

  activate() {
    return this.thunder.Controller.activate({ callsign: Callsign })
  }

  lightReset() {
    return this.thunder.call(Callsign, 'lightReset')
  }
}
