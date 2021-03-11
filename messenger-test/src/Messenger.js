import ThunderJS from 'ThunderJS'

const Callsign = 'Messenger'

const thunderConfig = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  debug: true,
}

export const RoomUpdateAction = Object.freeze({
  created: 'created',
  destroyed: 'destroyed',
})

export const UserUpdateAction = Object.freeze({
  joined: 'joined',
  left: 'left',
})

export default class Messenger {
  constructor() {}

  get thunder() {
    if (!this._thunder) this._thunder = ThunderJS(thunderConfig)
    return this._thunder
  }

  activate() {
    return this.thunder.Controller.activate({ callsign: Callsign })
  }

  deactivate() {
    return this.thunder.Controller.deactivate({ callsign: Callsign })
  }

  subscribeRoomUpdate(callback) {
    return this.thunder.on(Callsign, 'roomupdate', notification => {
      callback(
        notification.params.room,
        Object.keys(RoomUpdateAction).find(k => RoomUpdateAction[k] === notification.params.action)
      )
    })
  }

  subscribeUserUpdate(roomid, callback) {
    return this.thunder.on(roomid + '.' + Callsign, 'userupdate', notification => {
      callback(
        notification.params.user,
        Object.keys(UserUpdateAction).find(k => UserUpdateAction[k] === notification.params.action)
      )
    })
  }

  subscribeMessage(roomid, callback) {
    return this.thunder.on(roomid + '.' + Callsign, 'message', notification => {
      callback(notification.params.user, notification.params.message)
    })
  }

  join(user, room) {
    return this.thunder
      .call(Callsign, 'join', {
        user: user,
        room: room,
      })
      .then(result => result.roomid)
  }

  leave(roomid) {
    return this.thunder.call(Callsign, 'leave', {
      roomid: roomid,
    })
  }

  send(roomid, message) {
    return this.thunder.call(Callsign, 'send', {
      roomid: roomid,
      message: message,
    })
  }
}
