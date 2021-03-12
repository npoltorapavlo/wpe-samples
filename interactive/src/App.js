import { Lightning, Utils } from '@lightningjs/sdk'

import Overlay from './Overlay'
import TextLine from './TextLine'
import TextBox, { LineStyle } from './TextBox'
import ThunderAdmin, {
  IdDoesntExistError,
  IdExistsError,
  JsonParseError,
  ThunderAdminObserver,
} from './ThunderAdmin'

const LogLevel = Object.freeze({
  Error,
  Response,
  Event,
})

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {
      Background: {
        w: 1920,
        h: 1080,
        color: 0xfffbb03b,
        src: Utils.asset('images/background.png'),
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
          'Id: custom id to identify thunder client\n' +
          'Cmd: new|delete|call|on|off\n' +
          'Args:\n' +
          '\t\t\t\tcall: Callsign Method [Params]\n' +
          '\t\t\t\ton: Callsign Event\n\n' +
          'Ex.:\n' +
          '\t\t\t\t1 new\n' +
          '\t\t\t\t1 call Controller activate {"callsign":"X"}\n' +
          '\t\t\t\t1 call X join {"user":"Y","room":"Z"}\n' +
          '\t\t\t\t1 on X onEvent\n',
        bottomText: 'Show/hide by pressing Esc',
      },
    }
  }

  _init() {
    this._inputHistory = []
    this._inputHistoryIndex = 0

    this._admin = new ThunderAdmin()

    let _this = this
    this._admin.callback = new (class extends ThunderAdminObserver {
      onResponse(response) {
        _this.log(
          LogLevel.Response,
          `Id=${response.id} Callsign=${response.callsign} ` +
            `Method=${response.method} Params=${JSON.stringify(response.params)} ` +
            `Response=${JSON.stringify(response)}`
        )
      }

      onEvent(event) {
        _this.log(
          LogLevel.Event,
          `Id=${event.id} Callsign=${event.callsign} Event=${event.event} ` +
            `Notification=${JSON.stringify(event.notification)}`
        )
      }
    })()
  }

  _handleKey(event) {
    if (event.defaultPrevented) {
      return // Do nothing if the event was already processed
    }

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
        if (this._inputHistoryIndex < this._inputHistory.length - 1)
          inputText = this._inputHistory[++this._inputHistoryIndex]
        break
      case 'PageUp':
        if (this._inputHistoryIndex > 0) inputText = this._inputHistory[--this._inputHistoryIndex]
        break
      case 'Enter':
        if (inputText) {
          this._inputHistory.push(inputText)
          this._inputHistoryIndex = this._inputHistory.length
        }
        this._onInput(inputText)
        inputText = ''
        break
      case 'Backspace':
        inputText = inputText.slice(0, -1)
        break
      case 'Tab':
        inputText += ' '
        break
      case 'Esc':
      case 'Escape':
        // Hide / show Overlay for "esc" key press.
        this.tag('Overlay').toggleTransparency()
        break
      default:
        inputText += event.key
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

  log(level, message) {
    switch (level) {
      case LogLevel.Error:
        console.error(message)
        this.tag('Log').add(message, LineStyle.Red)
        break
      case LogLevel.Response:
        console.log(message)
        this.tag('Log').add(message, LineStyle.Default)
        break
      case LogLevel.Event:
        console.log(message)
        this.tag('Log').add(message, LineStyle.Default)
        break
    }
  }

  _onInput(input) {
    try {
      let match

      if ((match = input.match(/(.+) +new/))) {
        this.tag('Log').add(`User input: ${match[1]} new`, LineStyle.Green)
        this._admin.new(match[1])
      } else if ((match = input.match(/(.+) +delete/))) {
        this.tag('Log').add(`User input: ${match[1]} delete`, LineStyle.Green)
        this._admin.delete(match[1])
      } else if ((match = input.match(/(.+) +on +(.+) +(.+)/))) {
        this.tag('Log').add(`User input: ${match[1]} on ${match[2]} ${match[3]}`, LineStyle.Green)
        this._admin.on(match[1], match[2], match[3])
      } else if ((match = input.match(/(.+) +off +(.+) +(.+)/))) {
        this.tag('Log').add(`User input: ${match[1]} off ${match[2]} ${match[3]}`, LineStyle.Green)
        this._admin.off(match[1], match[2], match[3])
      } else if ((match = input.match(/(.+) +call +(.+) +(.+) +(.+)/))) {
        this.tag('Log').add(
          `User input: ${match[1]} call ${match[2]} ${match[3]} ${match[4]}`,
          LineStyle.Green
        )
        this._admin.call(match[1], match[2], match[3], match[4])
      } else if ((match = input.match(/(.+) +call +(.+) +(.+)/))) {
        this.tag('Log').add(`User input: ${match[1]} call ${match[2]} ${match[3]}`, LineStyle.Green)
        this._admin.call(match[1], match[2], match[3])
      } else {
        this.log(LogLevel.Error, `Bad input '${input}'. Press Esc to show Help`)
      }
    } catch (e) {
      let message

      if (e instanceof IdDoesntExistError) {
        message = `Id '${e.id}' doesn't exist. Use Cmd 'new' to create it. Press Esc to show Help`
      } else if (e instanceof IdExistsError) {
        message = `Id '${e.id}' already exists. Use Cmd 'delete' to delete it. Press Esc to show Help`
      } else if (e instanceof JsonParseError) {
        message = `Params '${e.json}' isn't a valid JSON object. Press Esc to show Help`
      } else {
        message = e.message()
      }

      this.log(LogLevel.Error, message)
    }
  }
}
