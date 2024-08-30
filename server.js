require('dotenv').config();
const express = require('express');
const helmet = require('helmet'); // Ensure version ^3.21.3 for required headers
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const socket = require('socket.io');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

// Security middleware settings
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS for testing purposes
app.use(cors({ origin: '*' }));

// Serve index.html on the root route
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// FCC testing routes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).type('text').send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Set up socket.io server
const io = socket(server);
let players = {};
let collectibles = {};

(async () => {
  // Dynamic import of ES modules
  const { default: Collectible } = await import('./public/Collectible.mjs');
  const { default: Player } = await import('./public/Player.mjs');

  // Generate initial collectibles
  collectibles = generateCollectibles();

  io.on('connection', (socket) => {
    // Create a new player on connection
    players[socket.id] = new Player({ x: 50, y: 50, score: 0, id: socket.id });

    // Handle player movement
    socket.on('move', (dir) => {
      const player = players[socket.id];
      if (player) {
        player.movePlayer(dir, 5); // Move the player in the specified direction
        checkCollision(player);
        io.emit('updateState', { players, collectibles }); // Emit updated state to all players
      }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
      delete players[socket.id];
      io.emit('updateState', { players, collectibles });
    });
  });

  // Generate initial collectibles
  function generateCollectibles() {
    // Example collectible object generation
    return {
      item1: new Collectible({ x: 100, y: 100, value: 10, id: 'item1' })
    };
  }

  // Check for collisions between player and collectibles
  function checkCollision(player) {
    for (let id in collectibles) {
      if (player.collision(collectibles[id])) {
        player.score += collectibles[id].value;
        delete collectibles[id]; // Remove collectible after collision
        collectibles = { ...collectibles, ...generateCollectibles() }; // Generate new collectibles
      }
    }
  }
})();

module.exports = app; // For testing
