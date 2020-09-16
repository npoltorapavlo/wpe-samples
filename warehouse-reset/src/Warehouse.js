import ThunderJS from 'ThunderJS'

const Callsign = 'org.rdk.Warehouse'

const thunderConfig = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  // debug: true,
}

export const WAREHOUSE_FRONT_PANEL_STATE = {
  NONE: -1,
  DOWNLOAD_IN_PROGRESS: 1,
  DOWNLOAD_FAILED: 3,
}

export const WAREHOUSE_INTERNAL_RESET_PASSPHRASE = 'FOR TEST PURPOSES ONLY'

export const WAREHOUSE_RESET_TYPE = Object.freeze({
  WAREHOUSE: 'WAREHOUSE',
  COLD: 'COLD',
  FACTORY: 'FACTORY',
  USERFACTORY: 'USERFACTORY',
})

export default class Warehouse {
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
      this.thunder.on(Callsign, 'resetDone', notification => {
        console.log('resetDone ' + JSON.stringify(notification))
        this._events.get('resetDone')(notification)
      })
    })
  }

  deactivate() {
    this._events = new Map()
    return this.thunder.Controller.deactivate({ callsign: Callsign })
  }

  resetDevice(suppressReboot, resetType) {
    let params = {}

    if (typeof suppressReboot !== 'undefined') params['suppressReboot'] = suppressReboot
    if (typeof resetType !== 'undefined') params['resetType'] = resetType

    return this.thunder.call(Callsign, 'resetDevice', params)
  }

  getDeviceInfo() {
    return this.thunder.call(Callsign, 'getDeviceInfo')
  }

  setFrontPanelState(state) {
    let params = {}

    if (typeof state !== 'undefined') params['state'] = state

    return this.thunder.call(Callsign, 'setFrontPanelState', params)
  }

  internalReset(passPhrase) {
    let params = {}

    if (typeof passPhrase !== 'undefined') params['passPhrase'] = passPhrase

    return this.thunder.call(Callsign, 'internalReset', params)
  }

  lightReset() {
    return this.thunder.call(Callsign, 'lightReset')
  }

  isClean() {
    return this.thunder.call(Callsign, 'isClean')
  }
}
