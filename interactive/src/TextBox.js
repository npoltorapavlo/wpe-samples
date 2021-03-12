import { Lightning } from '@lightningjs/sdk'
import TextLine from './TextLine'

export const LineStyle = Object.freeze({
  Default: {
    textColor: 0xbbffffff,
  },
  Green: {
    textColor: 0xbb00ff00,
  },
  Red: {
    textColor: 0xbbff0000,
  },
})

const LineFontSize = 16

export default class TextBox extends Lightning.Component {
  static _template() {
    return {
      clipping: true,
      Rows: {
        w: w => w,
        flex: { direction: 'column', padding: 0 },
      },
    }
  }

  _init() {
    this.index = 0
  }

  add(line, style) {
    this.tag('Rows').childList.a({
      flexItem: { margin: 0 },
      flex: { direction: 'row', padding: 0 },
      Text: {
        flexItem: { margin: 0 },
        type: TextLine,
        text: line,
        textColor: style.textColor,
        fontSize: LineFontSize,
      },
    })
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
