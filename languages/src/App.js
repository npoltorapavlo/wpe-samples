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

import { Lightning, Utils, Language } from '@lightningjs/sdk'

const getQueryParam = (name, defaultValue) => {
  return new URLSearchParams(window.location.search).get(name) || defaultValue
}

export default class App extends Lightning.Component {
  static get config() {
    const language = getQueryParam('language', 'en')
    const countryCode = getQueryParam('countryCode', 'us')

    return {
      fonts: [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }],
      locale: Utils.asset(`locale/1.68.2/locale_${language}_${countryCode}_xglobal.json`),
    }
  }

  static language() {
    const language = getQueryParam('language', 'en')
    const countryCode = getQueryParam('countryCode', 'us')

    return {
      language,
      file: Utils.asset(`locale/1.68.2/locale_${language}_${countryCode}_xglobal.json`),
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
