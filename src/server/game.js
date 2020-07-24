const Field = require('./field');
const Ball = require('./ball');
const Constants = require('../constants');

class Game {

  constructor(lobby, gameNum) {
    //console.log("NEW GAME:", this.field, this.paddles, this.sockets);
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    this.interval = setInterval(this.update.bind(this), 1000 / 60);

    this.field = new Field(this);
    this.updateBall = false;
    this.numPlayers = 0;
    this.hasP2 = false;
    this.gameOver = false;
    
    this.paddles = {};
    this.sockets = {};
    this.num = gameNum; // keeps track of which game this is, so each socket can leave the corresponding room
    this.lobby = lobby; // the lobby that created this game

    // initialize the clock
    this.clockTime = 0;
    this.startTime = Date.now();
    this.clockInterval = null;
    this.resetClock();

    /*Object.keys(sockets).forEach(socketID => {
      this.sockets[socketID] = sockets[socketID].socket;
      if(sockets[socketID].player == 1) {
        this.paddles[socketID] = this.field.p1Paddle;
        console.log("p1", socketID);
      }
      else if(sockets[socketID].player == 2) {
        this.paddles[socketID] = this.field.p2Paddle;
        console.log("p2", socketID);
      }
      else {/*spectating}
    });*/

    // using a variant of this scoring system: https://en.wikipedia.org/wiki/Ramy_Ashour#RAM_Scoring_System
    this.p1Score = 0; this.p2Score = 0; // score for any given round
    this.p1RoundsWon = 0; this.p2RoundsWon = 0; // score of the whole match
    this.winningScore = Infinity; // score needed to win a round
    this.setWinningScore = false; // true if we need to set the winning score for this round
    this.timeUp = false; // true if the clock part of the round is over
    this.round = 1;

    this.startGame();
  }

  addPlayer(socket) {
    this.numPlayers++;
    if(this.numPlayers == 1) {
      this.sockets[socket.id] = socket;
      this.paddles[socket.id] = this.field.p1Paddle;
    }
    else if(this.numPlayers == 2) {
      this.sockets[socket.id] = socket;
      //console.log("add", this.hasP2, socket.id);
      this.paddles[socket.id] = this.hasP2 ? this.field.p1Paddle : this.field.p2Paddle;
      this.hasP2 = true;
    }
    else {/*spectating*/}
  }

  removePlayer(socket) {
    this.numPlayers--;
    //console.log("remove", this.numPlayers, this.hasP2, socket.id);
    if(this.paddles[socket.id].type === "p2") this.hasP2 = false;
    delete this.sockets[socket.id];
    delete this.paddles[socket.id];
  }

  update() {
    // Calculate time elapsed
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = now;

    if(this.updateBall) {
      this.field.ballActions(dt);
    }
    // when the ball isn't live, we check these conditions
    else if(this.setWinningScore) {
      // winning score is 1 higher than the current highest score
      this.winningScore = this.p1Score > this.p2Score ? this.p1Score + 1 : this.p2Score + 1;
      console.log("set winning score to", this.winningScore);
      this.setWinningScore = false;
    }
    // p1 won this round
    else if(this.p1Score == this.winningScore) {
      console.log("p1 wins round", this.round, "with", this.winningScore, "points");
      this.p1RoundsWon += 1;
      this.winningScore = Infinity; // reset winning score 

      // p1 won the game
      if(this.p1RoundsWon == Constants.NUM_ROUNDS) {
        this.gameOver = true;
        Object.keys(this.sockets).forEach(socketID => {
          this.sockets[socketID].emit(Constants.MSG_TYPES.GAME_OVER);
        });
      }
      // p1 won the round but not the game, so reset for the next round
      else {
        this.round += 1;
        this.p1Score = 0; this.p2Score = 0;
        this.resetClock();
      }
    }
    // p2 won this round
    else if(this.p2Score == this.winningScore) {
      console.log("p2 wins round", this.round, "with", this.winningScore, "points");
      this.p2RoundsWon += 1;
      this.winningScore = Infinity; // reset winning score

      // p2 won game
      if(this.p2RoundsWon == Constants.NUM_ROUNDS) {
        this.gameOver = true;
        Object.keys(this.sockets).forEach(socketID => {
          this.sockets[socketID].emit(Constants.MSG_TYPES.GAME_OVER);
        });
      }
      // p2 won the round but not the game, so reset for the next round
      else {
        this.round += 1;
        this.p1Score = 0; this.p2Score = 0;
        this.resetClock();
      }
    }
    /*else if(this.p1RoundsWon == Constants.NUM_ROUNDS || this.p2RoundsWon == Constants.NUM_ROUNDS) {
      this.gameOver = true;
      Object.keys(this.sockets).forEach(socketID => {
        this.sockets[socketID].emit(Constants.MSG_TYPES.GAME_OVER);
      });
    }*/

    // Send a game update to each paddle every other time
    if (this.shouldSendUpdate) {
      Object.keys(this.sockets).forEach(socketID => {
        const socket = this.sockets[socketID];
        const paddle = this.paddles[socketID];
        socket.emit(Constants.MSG_TYPES.GAME_UPDATE, this.createUpdate(paddle));
      });
      this.shouldSendUpdate = false;
    } else {
      this.shouldSendUpdate = true;
    }

    // If the game is over, make sure to stop sending updates
    // Also each socket has to leave the game and corresponding room
    if(this.gameOver) {
      this.shouldSendUpdate = false;
      clearInterval(this.interval);

      // TODO: This code should probably be in the Lobby class
      Object.keys(this.sockets).forEach(socketID => {
        const socket = this.sockets[socketID];
        socket.leave(this.num);
        this.removePlayer(socket);
        delete this.lobby.players[socketID];
      });
    }
  }

  createUpdate(paddle) {
    const opponent = Object.values(this.paddles).filter(p => p !== paddle);

    return {
      t: Date.now(),
      me: paddle.serializeForUpdate(),
      opp: opponent[0] ? opponent[0].serializeForUpdate() : 0,
      ball: this.field.ball.serializeForUpdate(),
      gameInfo: {
        p1Score: this.p1Score,
        p2Score: this.p2Score,
        p1RoundsWon: this.p1RoundsWon,
        p2RoundsWon: this.p2RoundsWon,
        round: this.round,
        clock: this.clockTime,
      },
    };
  }

  startGame() {
    //console.log("start game");
    this.field.p1Paddle.demo = false;
    this.field.p2Paddle.demo = false;
    //this.restart();
  }

  // clock code inspired by: https://github.com/olinations/stopwatch/blob/master/stopWatch.js
  startClock() {
    this.startTime = Date.now();
    this.clockInterval = setInterval(this.getClockTime.bind(this), 1);
  }

  stopClock() {
    clearInterval(this.clockInterval);
    this.savedTime = this.clockTime;
  }

  resetClock() {
    clearInterval(this.clockInterval);
    this.savedTime = 0;
    this.clockTime = 0;
    this.timeUp = false; // reset timeUp because we're starting a new round
  } 

  // TODO: make the timeUp detection more intuitive and better positioned
  getClockTime() {
    const now = Date.now();
  
    this.clockTime = (now - this.startTime) + this.savedTime;

    let minutes = Math.floor((this.clockTime % (1000 * 60 * 60)) / (1000 * 60));
    /*if(minutes == Constants.ROUND_LENGTH) {
      this.setWinningScore = true; 
      this.stopClock();
    }*/
    let seconds = Math.floor((this.clockTime % (1000 * 60)) / 1000);
    if(seconds == 20) {
      console.log("times up");
      this.setWinningScore = true;
      this.timeUp = true;
      this.stopClock();
    }
    // let milliseconds = Math.floor((difference % (1000 * 60)) / 100);

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    // milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds;

    //console.log(minutes, ":", seconds);
  }
  /*restart() {
    console.log("restart");
    this.strikes = 5;

    this.field = new Field(this);
    this.field.p1Paddle.demo = false;
    this.field.p2Paddle.demo = false;

    this.setStage();
  }*/
}

module.exports = Game;
