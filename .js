const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let players = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Create new duck player
    players[socket.id] = { 
        x: 0, y: 0, z: 0, 
        id: socket.id,
        health: 100
    };

    io.emit('updatePlayers', players);

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].z = data.z;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('enemyAttack', (targetId) => {
        if(players[targetId]) {
            players[targetId].health -= 5;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
