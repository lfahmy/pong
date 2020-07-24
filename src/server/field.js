const Ball = require('./ball.js');
const Paddle = require('./paddle.js');
const Constants = require('../constants');

class Field {

  constructor(game) {
    //console.log("field");
    this.game = game;

    this.ball = new Ball(Constants.MAX_DIST);
    this.p1Paddle = new Paddle(Constants.CLOSE_WIDTH, Constants.CLOSE_HEIGHT, "p1", Constants.MAX_DIST);
    this.p2Paddle = new Paddle(Constants.CLOSE_WIDTH, Constants.CLOSE_HEIGHT, "p2", Constants.MAX_DIST);

    this.maxDistance = Constants.MAX_DIST;

    this.renderPieces();
  }

  detectWallBounce() {
    //console.log("wall bounce");
    if(this.ball.rawX + this.ball.radius >= 712 || this.ball.rawX - this.ball.radius <= 88){
      this.ball.xVelocity = this.ball.xVelocity * -1;
      this.ball.xSpin = 0;
    }

    if(this.ball.rawY + this.ball.radius >= 509 || this.ball.rawY - this.ball.radius <= 91){
      this.ball.yVelocity = this.ball.yVelocity * -1;
      this.ball.ySpin = 0;
    }
  }

  detectGoalOrHit() {
    //console.log("goal or hit");
    if (this.ball.rawZ === this.maxDistance){
      const hit = this.detectHit(this.p2Paddle);
      //this.ball.direction = hit ? "in" : "out";
      if(hit) {
        this.ball.direction = "in";
      }
      else {
        this.ball.direction = "out";
        this.game.p1Score += 1;
      }
    } else if (this.ball.rawZ === 0){
      const hit = this.detectHit(this.p1Paddle);
      //this.ball.direction = hit ? "out" : "in";
      if(hit) {
        this.ball.direction = "out";
      }
      else {
        this.ball.direction = "in";
        this.game.p2Score += 1;
      }
    }
  }

  /*movePaddles(mouseX = 0, mouseY = 0) {
    this.p1Paddle.move(this.ball, mouseX, mouseY);
    this.p2Paddle.move(this.ball, mouseX, mouseY);
  }*/

  renderPieces() {
    this.p2Paddle.draw();
    this.p1Paddle.draw();
  }

  detectHit(paddle) {
    //console.log("hit");
    const hit = paddle.hit(this.ball);
    if (hit) {
      this.getSpin(paddle);
    } else {
      // show the imprint of the ball for .75 seconds
      this.ball.fill = "solid";
      setTimeout(() => {
        // pass the paddle that missed
        this.ball.reset(paddle.type);
      }, 750);
      //console.log(this.ball.rawX, this.ball.rawY, this.ball.rawZ);
      
      // we're between serves, so stop the clock and ball
      this.game.stopClock();
      this.game.updateBall = false;
    }
    return hit
  }

  getSpin(paddle) {
    let [xSpin, ySpin] = paddle.spinVector();
    this.ball.xSpin += xSpin;
    this.ball.ySpin += ySpin;
  }

  hitBall(e = null, paddle) {
    if (paddle.hit(this.ball) && this.ball.rawZ === paddle.z && this.ball.fill === "gradient") {
      if (e) e.remove();
      this.getSpin(paddle);
      if (this.ball.xSpin > 15) {
        this.ball.xSpin = 15;
      }
      if (this.ball.xSpin < -15) {
        this.ball.xSpin = -15;
      }
      if (this.ball.ySpin > 15) {
        this.ball.ySpin = 15;
      }
      if (this.ball.ySpin < -15) {
        this.ball.ySpin = -15;
      }

      if(!this.game.timeUp) this.game.startClock();
      this.game.updateBall = true;
    }
  }

  ballActions(dt) {
    //console.log("z", this.ball.rawZ);
    //console.log("dir", this.ball.direction);
    this.ball.move(dt);
    //console.log("z", this.ball.rawZ);
    //console.log("dir", this.ball.direction);
    this.detectWallBounce();
    //console.log("z", this.ball.rawZ);
    //console.log("dir", this.ball.direction);
    this.detectGoalOrHit();
    //console.log("z", this.ball.rawZ);
    //console.log("dir", this.ball.direction);
  }

}

module.exports = Field;
