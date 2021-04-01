import { Lightning, Utils } from '@lightningjs/sdk'

import Overlay from './components/Overlay'
import TextLine from './components/TextLine'
import TextBox, { LineStyle } from './components/TextBox'
import Runtime from './thunder/Runtime'
import FileScript from './thunder/FileScript'

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        color: 0xff222222,
        rect: true,
      },
      Log: {
        type: TextBox,
        w: 1920,
        h: 1080,
      },
      Text: {
        type: TextLine,
        mount: 0.5,
        x: 960,
        y: 540,
        wordWrapWidth: 1440,
      },
      Overlay: {
        type: Overlay,
        mount: 0.5,
        x: 960,
        y: 540,
        mainText:
          'Usage: Id Cmd [Args] <Enter>\n\n' +
          'Id: any id to identify thunder client, ex. 1, a, etc\n' +
          'Cmd: new|delete|call|on|off\n' +
          'Args:\n' +
          '\t\t\t\tcall: Callsign Method [Params]\n' +
          '\t\t\t\ton\\off: Callsign Event\n\n' +
          'Ex.:\n' +
          '\t\t\t\t1 new\n' +
          '\t\t\t\t1 call Controller activate {"callsign":"X"}\n' +
          '\t\t\t\t1 call X join {"user":"Y","room":"Z"}\n' +
          '\t\t\t\t1 on X eventName\n\n' +
          'Press F1, F2, etc to trigger a built-in test',
        bottomText: 'Show/hide by pressing Esc',
      },
    }
  }

  _init() {
    this._inputHistory = []
    this._inputHistoryIndex = 0

    this._setState('UserInput')
  }

  _logDefault(message) {
    console.log(message)
    this.tag('Log').add(message, LineStyle.Green)
  }

  _logImportant(message) {
    console.warn(message)
    this.tag('Log').add(message, LineStyle.Default)
  }

  _logCritical(message) {
    console.error(message)
    this.tag('Log').add(message, LineStyle.Red)
  }

  static _states() {
    return [
      class UserInput extends this {
        $enter() {
          this.tag('Log').clear()
          this.tag('Text').text = ''

          this._runtime = new Runtime(this._logImportant.bind(this))
        }
        _handleKey(event) {
          if (event.defaultPrevented) {
            return // Do nothing if the event was already processed
          }

          let isOverlay = this.tag('Overlay').isShowing
          let currentInputText = this.tag('Text').text
          let inputText = currentInputText

          switch (event.key) {
            case 'Left':
            case 'ArrowLeft':
            case 'Right':
            case 'ArrowRight':
            case 'Control':
            case 'Alt':
            case 'Shift':
            case 'Meta':
            case 'Delete':
            case 'Down':
            case 'ArrowDown':
            case 'Up':
            case 'ArrowUp':
              // Quit when this doesn't handle the key event.
              return
            case 'PageDown':
              if (!isOverlay && this._inputHistoryIndex < this._inputHistory.length)
                inputText = this._inputHistory[++this._inputHistoryIndex]
              break
            case 'PageUp':
              if (!isOverlay && this._inputHistoryIndex > 0)
                inputText = this._inputHistory[--this._inputHistoryIndex]
              break
            case 'Enter':
              if (!isOverlay && inputText) {
                this._inputHistory.push(inputText)
                this._inputHistoryIndex = this._inputHistory.length
                try {
                  this._logDefault(`[Input] ${inputText}`)
                  this._runtime.process(inputText)
                } catch (e) {
                  this._logCritical(e.message)
                }
                inputText = ''
              }
              break
            case 'Backspace':
              if (!isOverlay) inputText = inputText.slice(0, -1)
              break
            case 'Tab':
              if (!isOverlay) inputText += ' '
              break
            case 'Esc':
            case 'Escape':
              // Hide / show Overlay for "esc" key press.
              if (isOverlay) this.tag('Overlay').hide()
              else this.tag('Overlay').show()
              break
            case 'F1':
              this._scriptFile = Utils.asset('scripts/messenger1.json')
              this._setState('InScript')
              break
            case 'F2':
              this._scriptFile = Utils.asset('scripts/messenger2.json')
              this._setState('InScript')
              break
            default:
              if (!isOverlay) inputText += event.key
              break
          }

          if (inputText !== currentInputText) {
            this.tag('Text').text = inputText
          }

          // Cancel the default action to avoid it being handled twice
          event.preventDefault()
        }
        _getFocused() {
          return this.tag('Log')
        }
      },
      class InScript extends this {
        $enter() {
          this.tag('Log').clear()
          this.tag('Text').text = ''

          this._runtime = new FileScript(this._scriptFile, this._logImportant.bind(this))
        }
        $exit() {}
        _getFocused() {
          return this.tag('Log')
        }
        _handleKey(event) {
          if (event.defaultPrevented) {
            return // Do nothing if the event was already processed
          }

          let isOverlay = this.tag('Overlay').isShowing

          switch (event.key) {
            case 'Down':
            case 'ArrowDown':
            case 'Up':
            case 'ArrowUp':
              // Quit when this doesn't handle the key event.
              return
            case 'Esc':
            case 'Escape':
              // Hide / show Overlay for "esc" key press.
              if (isOverlay) this.tag('Overlay').hide()
              else this.tag('Overlay').show()
              break
            default:
              if (!isOverlay) this._setState('UserInput')
              break
          }

          // Cancel the default action to avoid it being handled twice
          event.preventDefault()
        }
      },
    ]
  }
}
