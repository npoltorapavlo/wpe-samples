import { Lightning } from '@lightningjs/sdk'

export default class TextLine extends Lightning.Component {
  static _template() {
    return {
      flex: { direction: 'row', padding: 0 },
      rect: true,
      color: 0x66000000,
      Text: {
        flexItem: { margin: 0 },
        text: {
          text: '',
          fontFace: 'Regular',
          fontSize: 64,
          textColor: 0xbbffffff,
        },
      },
    }
  }

  set text(value) {
    this.tag('Text').text.text = value
  }

  get text() {
    return this.tag('Text').text.text
  }

  set fontSize(value) {
    this.tag('Text').text.fontSize = value
  }

  set textColor(value) {
    this.tag('Text').text.textColor = value
  }

  set wordWrapWidth(w) {
    this.tag('Text').text.wordWrapWidth = w
  }
}
