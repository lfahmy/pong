class Paddle {

  constructor(width, height, type, maxDistance) {
    //console.log("paddle");
    this.width = width;
    this.height = height;
    this.type = type;
    this.demo = true;
    this.maxDistance = maxDistance;

    this.lastUpdate = Date.now();
    this.difference = 1;
  }

  center() {
    this.x -= this.width / 2;
    this.y -= this.height / 2;
  }

  draw() {
    //console.log("draw paddle");
    if (this.type === 'p1') {
      this.z = 0;
    } else {
      this.z = this.maxDistance;
    }

    this.prevX = 400;
    this.prevY = 300;
    this.x = 400;
    this.y = 300;
  }

  enforceBounds(bounds) {
    if (this.x + this.width > bounds.right){
      this.x = bounds.right - this.width;
    } else if (this.x < bounds.left){
      this.x = bounds.left;
    }

    if (this.y + this.height > bounds.bottom){
      this.y = bounds.bottom - this.height;
    } else if (this.y < bounds.top){
      this.y = bounds.top;
    }
  }

  hit(ball) {
    if (ball.rawX - ball.radius <= this.x + this.width
        && ball.rawX + ball.radius >= this.x
        && ball.rawY - ball.radius <= this.y + this.height
        && ball.rawY + ball.radius >= this.y
        && ball.rawZ === this.z) {
      return true;
    } else {
      return false;
    }
  }

  move(mouseX = 0, mouseY = 0, trackingRatio = null) {
    const now = Date.now();
    this.difference = (now - this.lastUpdate);
    //console.log(this.difference);
    this.lastUpdate = now;

    //console.log("move paddle", mouseX, mouseY);
    this.moveNearPaddle(mouseX, mouseY);
    /*if (this.type === 'near') {
      this.demo ? this.moveDemoPaddle(ball) : this.moveNearPaddle(mouseX, mouseY);
    } else {
      this.demo ? this.moveFarPaddle(ball, -4) : this.moveNearPaddle(mouseX, mouseY);
    }*/
  }

  moveNearPaddle(mouseX, mouseY) {
    this.prevX = this.x;
    this.prevY = this.y;

    // get the objective x-coordinate of p2
    this.x = this.z ? 800 - mouseX : mouseX;
    this.y = mouseY;
    //console.log(this.x, this.y);

    this.center();
    //console.log(this.type, "prevX:", this.prevX, "prevY:", this.prevY, "x:", this.x, "y:", this.y);
    //this.enforceBounds({top: 91, right: 712, bottom: 509, left: 88});
  }

  spinVector() {
    /*const xSpin = 3 * (this.x - this.prevX) / this.difference;
    const ySpin = 3 * (this.y - this.prevY) / this.difference;*/
    /*const xSpin = this.x - this.prevX;
    const ySpin = this.y - this.prevY;*/
    const xSpin = -.0375 * 10 * (this.x - this.prevX) / this.difference;
    const ySpin = -.0375 * 10 * (this.y - this.prevY) / this.difference;
    //console.log("xDiff:", this.x - this.prevX, "-- yDiff:", this.y - this.prevY, " -- millis:", this.difference);

    //console.log("paddle", this.type, "xSpin:", xSpin, "ySpin:", ySpin);
    return [xSpin, ySpin];
  }

  serializeForUpdate() {
    //if(this.type === "far") console.log("x:", this.x, "--- y:", this.y);
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      type: this.type
    };
  }

  /*moveDemoPaddle(ball) {
    this.prevX = this.x;
    this.prevY = this.y;

    this.x = ball.rawX;
    this.y = ball.rawY;

    this.center();
    this.enforceBounds({top: 91, right: 712, bottom: 509, left: 88});
  }*/

  /*moveFarPaddle(ball, trackingRatio) {
    const diffX = ball.rawX - this.x - this.width / 2;
    const diffY = ball.rawY - this.y - this.height / 2;

    this.x += diffX / (5 + trackingRatio);
    this.y += diffY / (5 + trackingRatio);

    this.enforceBounds({top: 247, right: 480, bottom: 353, left: 322});
  }*/
}

module.exports = Paddle;
