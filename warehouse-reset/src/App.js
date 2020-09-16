import { Lightning, Utils } from 'wpe-lightning-sdk'

import Warehouse from './Warehouse'

import {
  WAREHOUSE_FRONT_PANEL_STATE,
  WAREHOUSE_INTERNAL_RESET_PASSPHRASE,
  WAREHOUSE_RESET_TYPE,
} from './Warehouse'

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        rect: true,
        color: 0xff444444,
      },
      Text: {
        text: {
          text: '',
          fontFace: 'Regular',
          fontSize: 24,
          textColor: 0xbbffffff,
        },
      },
      Help: {
        mountY: 0.5,
        y: 540,
        text: {
          text:
            'a - activate\n' +
            'd - deactivate\n' +
            'r - resetDevice no params\n' +
            's - resetDevice suppressReboot\n' +
            'w - resetDevice WAREHOUSE\n' +
            'c - resetDevice COLD\n' +
            'f - resetDevice FACTORY\n' +
            'u - resetDevice USERFACTORY\n' +
            'g - getDeviceInfo\n' +
            'n - setFrontPanelState NONE\n' +
            'p - setFrontPanelState DOWNLOAD_IN_PROGRESS\n' +
            'e - setFrontPanelState DOWNLOAD_FAILED\n' +
            'i - internalReset\n' +
            'l - lightReset\n' +
            'v - isClean\n',
          fontFace: 'Regular',
          fontSize: 24,
          textColor: 0xbbffffff,
        },
      },
    }
  }

  _init() {
    this._setState('Default')
  }

  print(...input) {
    let text = input.join(',')

    if (text) console.log(text)

    this.tag('Text').patch({
      text: { text: text },
    })
  }

  static _states() {
    class ApiCall extends this {
      $enter() {
        this.call().then(() => this._setState('Default'))
      }

      async call() {
        if (this._wh) {
          await this.apiCall().then(
            payload => this.print('api call succeeded\n' + JSON.stringify(payload)),
            err => this.print('api call failed\n' + JSON.stringify(err))
          )
        } else {
          this.print('not activated')
        }
      }

      async apiCall() {}
    }

    return [
      class Default extends this {
        _handleKey(e) {
          this.print(e.key + ' pressed')

          let state

          switch (e.key) {
            case 'a':
              state = 'Activate'
              break
            case 'd':
              state = 'Deactivate'
              break
            case 'r':
              state = 'ResetDevice'
              break
            case 's':
              state = 'ResetDeviceSuppressReboot'
              break
            case 'w':
              state = 'ResetDeviceWarehouse'
              break
            case 'c':
              state = 'ResetDeviceCold'
              break
            case 'f':
              state = 'ResetDeviceFactory'
              break
            case 'u':
              state = 'ResetDeviceUserfactory'
              break
            case 'g':
              state = 'GetDeviceInfo'
              break
            case 'n':
              state = 'SetFrontPanelStateNone'
              break
            case 'p':
              state = 'SetFrontPanelStateDownloadInProgress'
              break
            case 'e':
              state = 'SetFrontPanelStateDownloadFailed'
              break
            case 'i':
              state = 'InternalReset'
              break
            case 'l':
              state = 'LightReset'
              break
            case 'v':
              state = 'IsClean'
              break
          }

          if (state) this._setState(state)
        }
      },

      class Activate extends ApiCall {
        async call() {
          if (!this._wh) {
            this._wh = new Warehouse()
            this._wh.registerEvent('resetDone', e =>
              this.print('resetDone event\n' + JSON.stringify(e))
            )
            await super.call()
          } else {
            this.print('already activated')
          }
        }

        async apiCall() {
          return this._wh.activate()
        }
      },

      class Deactivate extends ApiCall {
        async call() {
          await super.call()
          delete this._wh
        }

        async apiCall() {
          return this._wh.deactivate()
        }
      },

      class ResetDevice extends ApiCall {
        async apiCall() {
          return this._wh.resetDevice()
        }
      },

      class ResetDeviceSuppressReboot extends ApiCall {
        async apiCall() {
          return this._wh.resetDevice(true)
        }
      },

      class ResetDeviceWarehouse extends ApiCall {
        async apiCall() {
          return this._wh.resetDevice(false, WAREHOUSE_RESET_TYPE.WAREHOUSE)
        }
      },

      class ResetDeviceCold extends ApiCall {
        async apiCall() {
          return this._wh.resetDevice(false, WAREHOUSE_RESET_TYPE.COLD)
        }
      },

      class ResetDeviceFactory extends ApiCall {
        async apiCall() {
          return this._wh.resetDevice(false, WAREHOUSE_RESET_TYPE.FACTORY)
        }
      },

      class ResetDeviceUserfactory extends ApiCall {
        async apiCall() {
          return this._wh.resetDevice(false, WAREHOUSE_RESET_TYPE.USERFACTORY)
        }
      },

      class GetDeviceInfo extends ApiCall {
        async apiCall() {
          return this._wh.getDeviceInfo()
        }
      },

      class SetFrontPanelStateNone extends ApiCall {
        async apiCall() {
          return this._wh.setFrontPanelState(WAREHOUSE_FRONT_PANEL_STATE.NONE)
        }
      },

      class SetFrontPanelStateDownloadInProgress extends ApiCall {
        async apiCall() {
          return this._wh.setFrontPanelState(WAREHOUSE_FRONT_PANEL_STATE.DOWNLOAD_IN_PROGRESS)
        }
      },

      class SetFrontPanelStateDownloadFailed extends ApiCall {
        async apiCall() {
          return this._wh.setFrontPanelState(WAREHOUSE_FRONT_PANEL_STATE.DOWNLOAD_FAILED)
        }
      },

      class InternalReset extends ApiCall {
        async apiCall() {
          return this._wh.internalReset(WAREHOUSE_INTERNAL_RESET_PASSPHRASE)
        }
      },

      class LightReset extends ApiCall {
        async apiCall() {
          return this._wh.lightReset()
        }
      },

      class IsClean extends ApiCall {
        async apiCall() {
          return this._wh.isClean()
        }
      },
    ]
  }
}
