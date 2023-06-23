const Game = require('./game');

class Lobby {
  constructor() {
  	this.numWaiters = 0;
  	this.waiters = [];
  	
  	this.numGames = 0;
  	//this.games = [];
  	this.players = {};
  }

  addWaiter(socket) {
  	this.waiters.push(socket);
  	this.numWaiters++;

  	// TODO: Maybe pop first
    if(this.numWaiters == 2) {
      console.log("creating game");
      const game = new Game(this, this.numGames.toString());

  	  this.waiters.forEach(s => {
  	  	s.join(this.numGames.toString());
  	  	console.log("Room:", this.numGames);
  	  	console.log(s.id, "is in:", Object.keys(s.rooms))
  	  	game.addPlayer(s);
  	  	this.players[s.id] = game;
  	  });
  	  /*this.waiters.forEach(s => {
  	  	console.log("trying to remove", s.id);
  	  	this.removeWaiter(s);
  	  });*/
  	  console.log("num waiters:", this.waiters.length);
  	  console.log("removing", this.waiters.pop().id);
  	  console.log("removing", this.waiters.pop().id);
  	  console.log("num waiters:", this.waiters.length);
  	  this.numWaiters = this.waiters.length;

  	  //this.games.push(game);
  	  this.numGames++;

  	  return true;
  	}

  	return false;
  }

  removeWaiter(socket) {
  	const pos = this.waiters.indexOf(socket);
  	console.log(pos);
  	if(pos > -1) {
  	  console.log("removing", socket.id);
  	  this.waiters.splice(pos, 1);
  	  this.numWaiters--;
  	  return true
  	}

  	return false;
  }
}
module.exports = Lobby;