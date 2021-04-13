import Runtime from './Runtime'

import Script from './Script'

export default class ScriptRuntime extends Runtime {
  constructor(file) {
    super()

    this._index = 0
    this._script = new Script(file)
    this._script.load(file).then(
      () => {
        this.notifyObservers('onScriptStart', this._script)
        this.schedule()
      },
      err => this.notifyObservers('onScriptLoadError', err)
    )
  }

  clear() {
    clearTimeout(this._timer)
    this._index = 0
    super.clear()
  }

  onTimer() {
    let cmd = this._script.lines[this._index++]
    if (cmd) {
      try {
        this.process(cmd)
      } catch (e) {
        this.notifyObservers('onCommandError', e)
      }
      this.schedule()
    } else {
      this.notifyObservers('onScriptEnd')
    }
  }

  schedule() {
    this._timer = setTimeout(this.onTimer.bind(this), this._script.interval)
  }
}
