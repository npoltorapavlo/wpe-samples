/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Lightning } from '@lightningjs/sdk'
import { Language } from '@lightningjs/sdk'

const fuiURL = `${document.location.protocol}//${document.location.host}`

function getFonts(localUrl) {
  return [
    {
      family: 'Regular',
      url: localUrl + '/Roboto-Regular.ttf',
    },
  ]
}

function getLocale(localUrl, language, countryCode) {
  return `${localUrl}/locale_${language}_${countryCode}_xglobal.json`
}

export default class App extends Lightning.Component {
  static get config() {
    const locale = getLocale(fuiURL + '/static/locale/1.68.2', 'en', 'us')

    return {
      fonts: getFonts(fuiURL + '/static/fonts'),
      locale,
    }
  }

  static language() {
    const language = 'en'
    const file = getLocale(fuiURL + '/static/locale/1.68.2', 'en', 'us')

    return {
      language,
      file,
    }
  }

  static _template() {
    return {
      flex: { direction: 'column', padding: 0 },
      rect: true,
      color: 0xff000000,
      Text: {
        text: {
          text: Language.translate('EMPTY_STATE_GENERIC_HEADER'),
          fontFace: 'Regular',
          fontSize: 64,
          textColor: 0xbbffffff,
        },
      },
      Text2: {
        flexItem: { margin: 0 },
        wordWrapWidth: 500,
        text: {
          text: Language.get(),
          fontFace: 'Regular',
          fontSize: 64,
          textColor: 0xbbffffff,
          wordWrapWidth: 500,
        },
      },
    }
  }
}
