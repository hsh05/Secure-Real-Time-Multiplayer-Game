import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let players = {};
let collectibles = {};

socket.on('updateState', (gameState) => {
    players = gameStaet.players;
    collectibles = gameState.collectibles;
    renderGame();
});

function renderGame() {
    context.clearRect(0, 0, canvas.clientWidth, canvas.height);

    Object.values(collectibles).forEach(item => {
        const collectible = new Collectible(item);
        collectible.draw(context);
    });

    Object.values(players).forEach(playerData => {
        const player = new Player(playerData);
        player.draw(context);
    });
}

window.addEventListener('keydown', (e) => {
    let direction;
    if (e.key === 'ArrowUp') direction = 'up';
    else if (e.key == 'ArrowDown') direction = 'down';
    else if (e.key == 'ArrowLeft') direction = 'left';
    else if (e.key == 'ArrowRight') direction = 'right';

    if (direction) {
        socket.emit('move', direction);
    }
});