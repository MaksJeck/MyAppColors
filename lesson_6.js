const fs = require('fs');
const path = require('path');
const http = require('http');
const io = require('socket.io');

const chat = http.createServer((request, response) => {
    if (request.method === 'GET') {

      const filePath = path.join(__dirname, 'index.html');

      readStream = fs.createReadStream(filePath);

      readStream.pipe(response);
    } else if (request.method === 'POST') {
      let data = '';

      request.on('data', chunk => {
      data += chunk;
      });

      request.on('end', () => {
        const parsedData = JSON.parse(data);
        console.log(parsedData);

        response.writeHead(200, { 'Content-Type': 'json'});
        response.end(data);
      });
    } else {
        response.statusCode = 405;
        response.end();
    }
});

const socket = io(chat);

socket.on('connection', function (socket) {
  const clientAlias = `Client '${Math.floor(Math.random()*10000)}': `

  console.log('New connection');

  socket.broadcast.emit('connectionNewClient', {
      msg: 'Connected', 
      userName: clientAlias
  });

  socket.on('clientMessage', (data) => {
    socket.broadcast.emit('serverMessage', {
        msg: data.msg, 
        userName: clientAlias
    });
    socket.emit('serverMessage', {
        msg: data.msg, 
        userName: clientAlias
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit('serverMessage', {
        msg: 'Disconnected', 
        userName: clientAlias
    });
  });
});

chat.listen(5555); 