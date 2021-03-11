import { Lightning, Utils } from '@lightningjs/sdk'

import Overlay from './Overlay'
import TextLine from './TextLine'
import TextBox from './TextBox'

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
      },
      Overlay: {
        type: Overlay,
        mount: 0.5,
        x: 960,
        y: 540,
        mainText:
          'Usage: Id Cmd [Args] <Enter>\n\n' +
          'Id: custom id to identify thunder client\n' +
          'Cmd: new/call/on\n' +
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
    setInterval(() => {
      let level = Math.floor(Math.random() * 3)
      this.tag('Log').add(
        (
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
          'Vestibulum eu eros nec tellus imperdiet malesuada. ' +
          'In malesuada egestas dui eget suscipit. ' +
          'Nam ornare lorem eget cursus consectetur.'
        ).substr(0, Math.random() * 200),
        level === 1 ? 0xbb00ff00 : level === 2 ? 0xbbff0000 : 0xbbffffff
      )
    }, 1000)
  }

  _handleKey(event) {
    if (event.defaultPrevented) {
      return // Do nothing if the event was already processed
    }

    let currentInputText = this.tag('Text').text
    let inputText = currentInputText

    switch (event.key) {
      case 'Down':
      case 'ArrowDown':
      case 'Up':
      case 'ArrowUp':
      case 'Left':
      case 'ArrowLeft':
      case 'Right':
      case 'ArrowRight':
      case 'Control':
      case 'Alt':
      case 'Shift':
      case 'Meta':
        // Quit when this doesn't handle the key event.
        return
      case 'Enter':
        inputText = ''
        break
      case 'Backspace':
        inputText = inputText.slice(0, -1)
        break
      case 'Tab':
        inputText += '\t'
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
}
