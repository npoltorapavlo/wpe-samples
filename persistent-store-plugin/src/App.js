import { Lightning, Utils } from 'wpe-lightning-sdk'

import PersistentStore from './PersistentStore'
import Warehouse from './Warehouse'

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {
      Text: {
        text: {
          text: '',
          fontFace: 'Regular',
          fontSize: 64,
          textColor: 0xbbffffff,
        },
      },
    }
  }

  _init() {
    this._setState('ApiTest')
  }

  async initStore() {
    if (!this._store) this._store = new PersistentStore()
    await this._store.deactivate()
    await this._store.activate()
    this._store.registerEvent('onStorageExceeded', this.onStorageExceeded.bind(this))
  }

  async initWarehouse() {
    if (!this._wh) {
      this._wh = new Warehouse()
      await this._wh.activate()
    }
  }

  onStorageExceeded() {
    this.limitReached = true
  }

  print(...input) {
    this.tag('Text').patch({
      text: { text: input.join(',') },
    })
  }

  static _states() {
    return [
      class ApiTest extends this {
        $enter() {
          this.print('ApiTest')
          this.test().then(
            () => this._setState('PersistenceTest'),
            err => this.print('ApiTest fail ' + err)
          )
        }

        async test() {
          await this.initStore()

          let success = (await this._store.setValue('api', 'key', 'value')).success
          if (success !== true) throw 'setValue failed'
          let value = (await this._store.getValue('api', 'key')).value
          if (value !== 'value') throw 'getValue failed'

          success = (await this._store.setValue('api', 'key', 'another value')).success
          if (success !== true) throw 'setValue failed'
          value = (await this._store.getValue('api', 'key')).value
          if (value !== 'another value') throw 'replace failed'

          let keys = (await this._store.getKeys('api')).keys
          if (!keys.includes('key')) throw 'getKeys failed'
          let ns = (await this._store.getNamespaces()).namespaces
          if (!ns.includes('api')) throw 'getNamespaces failed'

          let sz = (await this._store.getStorageSize()).namespaceSizes
          if (sz['api'] !== 16) throw 'getStorageSize failed'

          success = (await this._store.deleteKey('api', 'key')).success
          if (success !== true) throw 'deleteKey failed'
          success = (await this._store.deleteNamespace('api')).success
          if (success !== true) throw 'deleteNamespace failed'
        }
      },

      class PersistenceTest extends this {
        $enter() {
          this.print('PersistenceTest')
          this.test().then(
            () => this._setState('LimitTest'),
            err => this.print('PersistenceTest fail ' + err)
          )
        }

        async test() {
          await this.initStore()

          let success = (await this._store.setValue('persistence', 'key', 'value')).success
          if (success !== true) throw 'setValue failed'

          await this.initStore()

          let value = (await this._store.getValue('persistence', 'key')).value
          if (value !== 'value') throw 'getValue failed'
        }
      },

      class LimitTest extends this {
        $enter() {
          this.print('LimitTest')
          this.test().then(
            () => this._setState('WarehouseTest'),
            err => this.print('LimitTest fail ' + err)
          )
        }

        async test() {
          await this.initStore()

          if (this.limitReached) throw 'Limit reached before the test'

          let i = 0
          const value999 = 'x'.repeat(999)
          for (; i < 1002; ++i) {
            let success = (await this._store.setValue('limit', 'key' + i, value999)).success
            if (!success) break
          }

          if (!this.limitReached) throw 'Limit not reached'

          let success = (await this._store.deleteNamespace('limit')).success
          if (success !== true) throw 'deleteNamespace failed'

          success = (await this._store.setValue('limit', 'key' + i, value999)).success
          if (success !== true) throw 'setValue failed'
          let value = (await this._store.getValue('limit', 'key' + i)).value
          if (value !== value999) throw 'getValue failed'
          success = (await this._store.setValue('limit', 'oversize', value999 + '==')).success
          if (success !== false) throw 'Single value limit not reached'
        }
      },

      class WarehouseTest extends this {
        $enter() {
          this.print('WarehouseTest')
          this.test().then(
            () => this._setState('Final'),
            err => this.print('WarehouseTest fail ' + err)
          )
        }

        async test() {
          await this.initStore()

          let success = (await this._store.setValue('reset', 'key', 'value')).success
          if (success !== true) throw 'setValue failed'

          await this.initWarehouse()

          success = (await this._wh.lightReset()).success
          if (success !== true) throw 'lightReset failed'

          await this.initStore()

          success = (await this._store.getValue('reset', 'key')).success
          if (success !== false) throw 'getValue failed'
        }
      },

      class Final extends this {
        $enter() {
          this.print('OK')
        }
      },
    ]
  }
}
