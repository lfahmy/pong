const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const socketio = require('socket.io');

const Constants = require('../constants');
const Game = require('./game');
const Lobby = require('./lobby');
const webpackConfig = require('../../webpack.dev.js');

// Setup an Express server
const app = express();
app.use(express.static('public'));

if (process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  app.use(webpackDevMiddleware(compiler));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
let port = process.env.PORT;
if(port == null || port == "") port = 8000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinLobby);
  socket.on(Constants.MSG_TYPES.MOUSE, handleMouse);
  socket.on(Constants.MSG_TYPES.CLICK, handleClick);
  socket.on('disconnect', leaveLobby);
});

// Open the Lobby
var lobby = new Lobby();
var numGames = 0;

function joinLobby() {
  console.log("sending wait message");
  this.emit(Constants.MSG_TYPES.WAITING, Constants.MSG_TYPES.WAITING);
  
  if(lobby.addWaiter(this)) {
    console.log("sending start message");
    io.to(numGames.toString()).emit(Constants.MSG_TYPES.START);
    numGames++;
  }
  /*else {
    console.log("sending wait message");
    this.emit(Constants.MSG_TYPES.WAITING, Constants.MSG_TYPES.WAITING);
  }*/
}

function leaveLobby() {
  lobby.removeWaiter(this);
}

function handleClick(e) {
  const game = lobby.players[this.id];
  if(game) {
    game.field.hitBall(e, game.paddles[this.id]);
  }
}

function handleMouse(x, y) {
  const game = lobby.players[this.id];
  if(game) {
    game.paddles[this.id].move(x, y);
  }
}


// Setup the Game
//var game = new Game();
/*var players = 0;
var sockets = {};*/

function joinGame() {
  /*players++;
  console.log(players);
  sockets[this.id] = {socket: this, player: players};
  if(players == 2) {
    io.sockets.emit(Constants.MSG_TYPES.START);
    game = new Game(sockets);
  }
  else if(players > 2) {/*spectating}
  else io.sockets.emit(Constants.MSG_TYPES.WAITING);*/

  game.addPlayer(this);
  if(game.numPlayers == 2) io.sockets.emit(Constants.MSG_TYPES.START);
  else if(game.numPlayers > 2) {/*spectating*/}
  else io.sockets.emit(Constants.MSG_TYPES.WAITING);
}

function onDisconnect() {
  /*players--;
  if(game && players < 2) {
    //game.removePlayer(this.id);
    delete game;
    delete sockets[this.id];
    io.sockets.emit(Constants.MSG_TYPES.WAITING);
  } */

  // Only remove a player if they are actually in the game and not just connected.
  if(game.sockets[this.id]) game.removePlayer(this);
  if(game.numPlayers < 2) io.sockets.emit(Constants.MSG_TYPES.WAITING);
}
