import WebSockets from './websockets'

import { Lightning, Utils } from '@lightningjs/sdk'

import ThunderJS from 'ThunderJS'

const Callsign = 'DisplayInfo'
const Method = 'connected'

const thunderConfig = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  debug: true,
}

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {
      flex: { direction: 'column', padding: 0 },
      rect: true,
      color: 0xff000000,
      Text: {
        flexItem: { margin: 0 },
        text: {
          text: '',
          fontFace: 'Regular',
          fontSize: 32,
          textColor: 0xbbffffff,
          wordWrapWidth: 500,
        },
      },
      Text2: {
        flexItem: { margin: 0 },
        wordWrapWidth: 500,
        text: {
          text: '',
          fontFace: 'Regular',
          fontSize: 64,
          textColor: 0xbbffffff,
          wordWrapWidth: 500,
        },
      },
      Text3: {
        flexItem: { margin: 0 },
        text: {
          text: '',
          fontFace: 'Regular',
          fontSize: 16,
          textColor: 0xbbffffff,
          wordWrapWidth: 500,
        },
      },
    }
  }

  _init() {
    this._setState('Input')

    setInterval(() => {
      const arr = WebSockets.map(
        i => `Socket URL=${i.url} protocol=${i.protocol} readyState=${i.readyState}`
      )
      this.print3(arr.join('\n'))
    }, 1000)
  }

  print(...input) {
    const text = input.join(',')
    console.log(text)
    this.tag('Text').patch({
      text: { text: text },
    })
  }

  print2(...input) {
    const text = input.join(',')
    console.log(text)
    this.tag('Text2').patch({
      text: { text: text },
    })
  }

  print3(...input) {
    const text = input.join(',')
    this.tag('Text3').patch({
      text: { text: text },
    })
  }

  static _states() {
    return [
      class Input extends this {
        $enter() {
          if (!this._thunder) {
            this.print('1 - init ThunderJS\n')
          } else {
            this.print(
              '1 - re-init ThunderJS\n' +
                '2 - invoke ' +
                Callsign +
                '.' +
                Method +
                '\n' +
                '3 - close sockets\n' +
                '4 - show token'
            )
          }
        }
        _handleKey(event) {
          if (event.defaultPrevented) {
            return // Do nothing if the event was already processed
          }
          if (!this._thunder) {
            if (event.key === '1') {
              this._setState('Init')
            }
          } else {
            switch (event.key) {
              case '1':
                this._setState('Init')
                break
              case '2':
                this._setState('Invoke')
                break
              case '3':
                this._setState('Close')
                break
              case '4':
                this._setState('Token')
                break
              default:
                break
            }
          }
          // Cancel the default action to avoid it being handled twice
          event.preventDefault()
        }
      },

      class Init extends this {
        $enter() {
          this._thunder = ThunderJS(thunderConfig)
          this._thunder.on('connect', () => {
            this.print2('connected')
          })
          this._thunder.on('disconnect', () => {
            this.print2('disconnected')
          })
          this._thunder.on('error', () => {
            this.print2('socket error')
          })
          this.print('inited ThunderJS. press any key to continue')
        }
        _handleKey(event) {
          if (event.defaultPrevented) {
            return // Do nothing if the event was already processed
          }
          this._setState('Input')
          // Cancel the default action to avoid it being handled twice
          event.preventDefault()
        }
      },

      class Invoke extends this {
        $enter() {
          this.print('invoking the method')
          this._thunder
            .call(Callsign, Method)
            .then(result => {
              this.print(
                `invoked ${Callsign}.${Method}. result is : ${JSON.stringify(
                  result
                )}. press any key to continue`
              )
            })
            .catch(err => {
              const msg = err && err.message ? err.message : err
              this.print(`invoke failed : ${msg}`)
            })
        }
        _handleKey(event) {
          if (event.defaultPrevented) {
            return // Do nothing if the event was already processed
          }
          this._setState('Input')
          // Cancel the default action to avoid it being handled twice
          event.preventDefault()
        }
      },

      class Close extends this {
        $enter() {
          let count = 0
          WebSockets.forEach(i => {
            console.log('closing web socket ' + i)
            i.close()
            count++
          })
          this.print(`${count} sockets closed. press any key to continue`)
        }
        _handleKey(event) {
          if (event.defaultPrevented) {
            return // Do nothing if the event was already processed
          }
          this._setState('Input')
          // Cancel the default action to avoid it being handled twice
          event.preventDefault()
        }
      },

      class Token extends this {
        $enter() {
          this.print('getting the token')
          const token = window.thunder.token()
          this.print(`token is : ${token}. press any key to continue`)
        }
        _handleKey(event) {
          if (event.defaultPrevented) {
            return // Do nothing if the event was already processed
          }
          this._setState('Input')
          // Cancel the default action to avoid it being handled twice
          event.preventDefault()
        }
      },
    ]
  }
}
