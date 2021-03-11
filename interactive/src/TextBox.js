import { Lightning } from '@lightningjs/sdk'
import TextLine from './TextLine'

export default class TextBox extends Lightning.Component {
  static _template() {
    return {
      clipping: true,
      Rows: {
        w: w => w,
      },
    }
  }

  _init() {
    this.index = 0
  }

  add(text, textColor) {
    this.tag('Rows').childList.a({
      y: this.tag('Rows').childList.length * 30,
      type: TextLine,
      text: text,
      textColor: textColor,
      fontSize: 20,
    })
  }

  _getFocused() {
    return this.tag('Rows').children[this.index]
  }

  _handleUp() {
    if (this.index > 0) {
      this.index--
      this._scroll()
    }
  }

  _handleDown() {
    if (this.index < this.tag('Rows').children.length - 1) {
      this.index++
      this._scroll()
    }
  }

  _scroll() {
    this.tag('Rows')
      .animation({
        duration: 0.2,
        actions: [
          {
            p: 'y',
            v: {
              0: this.tag('Rows').y,
              1: -this.tag('Rows').childList.getAt(this.index).finalY,
            },
          },
        ],
      })
      .start()
  }
}
