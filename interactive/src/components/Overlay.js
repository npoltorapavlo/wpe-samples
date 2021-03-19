import { Lightning } from '@lightningjs/sdk'

export default class Overlay extends Lightning.Component {
  static _template() {
    return {
      w: 640,
      h: 480,
      RoundRectangle: {
        zIndex: 2,
        texture: Lightning.Tools.getRoundRect(640, 480, 20, 0, 0xff000000, true, 0xff000000),
        Text: {
          mount: 0.5,
          x: 320,
          y: 220,
          text: {
            text: '',
            fontFace: 'Regular',
            fontSize: 20,
            textColor: 0xbbffffff,
          },
        },
        Bottom: {
          mount: 0.5,
          x: 320,
          y: 420,
          text: {
            text: '',
            fontFace: 'Regular',
            fontSize: 20,
            textColor: 0x99999999,
          },
        },
      },
      Shadow: {
        zIndex: 1,
        color: 0x66000000,
        texture: Lightning.Tools.getShadowRect(640, 480, 20, 10, 20),
      },
    }
  }

  get isShowing() {
    return this.alpha > 0
  }

  show() {
    this.patch({
      smooth: {
        alpha: [1, { duration: 0.2, timingFunction: 'ease-in' }],
      },
    })
  }

  hide() {
    this.patch({
      smooth: {
        alpha: [0, { duration: 0.2, timingFunction: 'ease-in' }],
      },
    })
  }

  set mainText(value) {
    this.tag('Text').text = value
  }

  set bottomText(value) {
    this.tag('Bottom').text = value
  }
}
