const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/../client'));

let players = {};
let gameState = {
    level: 1,
    bossActive: false,
    bossHealth: 10000,
    activePlayers: 0
};

io.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);
    
    // Create new duck player
    players[socket.id] = {
        x: Math.random() * 50 - 25,
        y: 0,
        z: Math.random() * 50 - 25,
        health: 100,
        xp: 0,
        level: 1,
        id: socket.id
    };

    io.emit('updatePlayers', players);

    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            players[socket.id].z = data.z;
            socket.broadcast.emit('playerMoved', {id: socket.id, position: data});
        }
    });

    socket.on('shoot', (data) => {
        // Simple damage logic: enemy hit takes 5 damage
        let targetId = data.targetId;
        if (players[targetId]) {
            players[targetId].health -= 5;
            if (players[targetId].health <= 0) {
                // Player died
                io.emit('playerDied', targetId);
                delete players[targetId];
                checkWinner();
            }
            io.emit('updatePlayers', players);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

function checkWinner() {
    let active = Object.values(players);
    if (active.length === 1) {
        let winner = active[0];
        winner.xp += 100; // Bonus XP
        io.emit('gameOver', {winner: winner.id});
    }
}

server.listen(3000, () => {
    console.log('Listening on *:3000');
});


import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const socket = io();
let scene, camera, renderer, playerModel;
let players = {};

// --- Start Button ---
document.getElementById('startButton').onclick = () => {
    document.getElementById('startScreen').style.display = 'none';
    initGame();
};

function initGame() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add Ground
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.MeshBasicMaterial({color: 0x228B22});
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    camera.position.z = 5;
    camera.position.y = 2;

    // --- Load Duck Avatar ---
    const loader = new GLTFLoader();
    // Replace with a 3D duck model URL
    loader.load('path_to_duck.glb', (gltf) => {
        playerModel = gltf.scene;
        scene.add(playerModel);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    // Add movement and camera logic here
    renderer.render(scene, camera);
}

// --- Multiplayer Sync ---
socket.on('updatePlayers', (serverPlayers) => {
    // Update or Create duck models for other players
});

socket.on('gameOver', (data) => {
    alert('Star Player: ' + data.winner);
});
