const sockets = []

WebSocket.prototype.oldSend = WebSocket.prototype.send

WebSocket.prototype.send = function(...args) {
  console.log('WebSocket.send has been called. this=' + this)
  if (sockets.indexOf(this) === -1) sockets.push(this)

  WebSocket.prototype.oldSend.call(this, ...args)
}

export default sockets
