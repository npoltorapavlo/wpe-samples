import { Lightning, Utils } from '@lightningjs/sdk'

import Messenger, { RoomUpdateAction, UserUpdateAction } from './Messenger'

const ROOM = 'Meeting'
const HOST = 'Host'
const GUEST = 'Guest'
const OBSERVER = 'Observer'

export default class App extends Lightning.Component {
  static getFonts() {
    return [{ family: 'Regular', url: Utils.asset('fonts/Roboto-Regular.ttf') }]
  }

  static _template() {
    return {}
  }

  _init() {}

  onHostUserUpdate(roomid, user, action) {
    console.log(`[${HOST}] [${roomid}] ${user} ${UserUpdateAction[action]}`)

    if (user !== HOST) {
      if (action === UserUpdateAction.joined) this._host.send(roomid, `Hi, ${user}`)
      else if (action === UserUpdateAction.left) this._host.leave(roomid)
    }
  }

  onHostMessage(roomid, user, message) {
    console.log(`[${HOST}] [${roomid}] ${user} says: "${message}"`)

    if (user !== HOST) {
      if (message.indexOf('Bye') !== 0) this._host.send(roomid, `Bye, ${user}`)
    }
    this.fireAncestors('$handleLeft')
  }

  onGuestRoomUpdate(room, action) {
    console.log(`[${GUEST}] ${room} ${RoomUpdateAction[action]}`)

    if (action === RoomUpdateAction.created) {
      this._guest.join(GUEST, room).then(
        roomid => {
          console.log(`[${GUEST}] joined ${roomid}`)

          this._guest.subscribeUserUpdate(roomid, (user, action) => {
            this.onGuestUserUpdate(roomid, user, action)
          })
          this._guest.subscribeMessage(roomid, (user, message) => {
            this.onGuestMessage(roomid, user, message)
          })

          setTimeout(() => {
            this._guest.send(roomid, "It's time to go. Bye!").then(
              () => {
                this._guest.leave(roomid).catch(err => console.error('Leave fail ' + err))
              },
              err => console.error('Send fail ' + err)
            )
          }, 5000)
        },
        err => console.error('Join fail ' + err)
      )
    }
  }

  onGuestUserUpdate(roomid, user, action) {
    console.log(`[${GUEST}] [${roomid}] ${user} ${UserUpdateAction[action]}`)
  }

  onGuestMessage(roomid, user, message) {
    console.log(`[${GUEST}] [${roomid}] ${user}: "${message}"`)

    if (user !== GUEST) {
      if (message.indexOf('Hi') !== 0) this._guest.send(roomid, `Hi, ${user}`)
    }
  }

  static _states() {
    return [
      class Start extends this {
        $enter() {
          this._host = new Messenger()
          this._guest = new Messenger()
          this._observer = new Messenger()

          Promise.all([
            this._host.activate(),
            this._guest.activate(),
            this._observer.activate(),
          ]).then(
            () => {
              this._setState('Ready')
            },
            err => console.error('Activate fail ' + err)
          )
        }
        $exit() {}
        static _states() {
          return [class Paused extends this {}]
        }
      },

      class Ready extends this {
        $enter() {
          if (!this.roomUpdateSubscribed) {
            this._host.subscribeRoomUpdate(this.onHostRoomUpdate.bind(this))
            this._guest.subscribeRoomUpdate(this.onGuestRoomUpdate.bind(this))
            this._observer.subscribeRoomUpdate(this.onObserverRoomUpdate.bind(this))

            this.roomUpdateSubscribed = true
          }
          this.startMeeting()
        }
        startMeeting() {
          this._host.join(HOST, ROOM).then(
            roomid => {
              console.log(`[${HOST}] joined ${roomid}`)
              this._host_roomid = roomid
              this._setState('Meeting')
            },
            err => console.error('Join fail ' + err)
          )
        }
        onHostRoomUpdate(room, action) {
          console.log(`[${HOST}] ${room} ${RoomUpdateAction[action]}`)

          if (room === ROOM && action === RoomUpdateAction.created) this._setState('Meeting')
          else if (room === ROOM && action === RoomUpdateAction.destroyed) this.startMeeting()
        }
        onGuestRoomUpdate(room, action) {
          console.log(`[${GUEST}] ${room} ${RoomUpdateAction[action]}`)

          if (action === RoomUpdateAction.created) {
            this._guest.join(GUEST, room).then(
              roomid => {
                console.log(`[${GUEST}] joined ${roomid}`)

                this._guest.subscribeUserUpdate(roomid, (user, action) => {
                  this.onGuestUserUpdate(roomid, user, action)
                })
                this._guest.subscribeMessage(roomid, (user, message) => {
                  this.onGuestMessage(roomid, user, message)
                })

                setTimeout(() => {
                  this._guest.send(roomid, "It's time to go. Bye!").then(
                    () => {
                      this._guest.leave(roomid).catch(err => console.error('Leave fail ' + err))
                    },
                    err => console.error('Send fail ' + err)
                  )
                }, 5000)
              },
              err => console.error('Join fail ' + err)
            )
          }
        }
        onObserverRoomUpdate(room, action) {
          console.log(`[${OBSERVER}] ${room} ${RoomUpdateAction[action]}`)
        }
      },

      class Meeting extends this {
        $enter() {
          this._host.subscribeUserUpdate(roomid, (user, action) => {
            this.onHostUserUpdate(roomid, user, action)
          })
          this._host.subscribeMessage(roomid, (user, message) => {
            this.onHostMessage(roomid, user, message)
          })
        }

      },
    ]
  }
}
