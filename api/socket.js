const { Server } = require('socket.io');
let io;
function init(server) {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('Socket client connected');
    socket.on('join', ({ role, id }) => {
      if (role && id) {
        socket.join(`${role}_${id}`);
      }
    });
  });
}
function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
module.exports = { init, getIo };
