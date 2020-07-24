const INITIAL_RADIUS = 35;

class Ball {

  constructor(maxDistance) {
    //console.log("ball");
    this.maxDistance = maxDistance;
    this.reset();
  }

  applySpin(dt) {
    //if (this.direction === "out"){
      this.xVelocity -= dt * this.xSpin / this.maxDistance;
      this.yVelocity -= dt * this.ySpin / this.maxDistance;
    /*} else {
      this.xVelocity += dt * this.xSpin / this.maxDistance;
      this.yVelocity += dt * this.ySpin / this.maxDistance;
    }*/
  }

  applyVelocity(dt) {
    this.rawX += dt * this.xVelocity;
    this.rawY += dt * this.yVelocity;
  }

  move(dt) {
    dt = 1;
    //console.log("move ball");
    this.updateDistance(dt);
    this.applySpin(dt);
    this.applyVelocity(dt);
    //console.log(this.rawX, this.rawY, this.rawZ);
  }

  reset(type = 'p2') {
    //console.log("reset ball");
    this.fill = "gradient";
    this.direction = "out";
    this.radius = INITIAL_RADIUS;

    this.xVelocity = 0;
    this.yVelocity = 0;

    this.xSpin = 5 * (Math.random() - 0.5);
    this.ySpin = 5 * (Math.random() - 0.5);

    this.rawX = 400;
    this.rawY = 300;

    // winner's serve
    if(type === 'p2') {
      this.rawZ = 0;
      this.direction = "out";
    }
    else if(type === 'p1') {
      this.rawZ = this.maxDistance;
      this.direction = "in";
    }
  }

  updateDistance(dt) {
    if (this.direction === "out"){
      this.rawZ += dt * 1;
    } else {
      this.rawZ -= dt * 1;
    }
  }

  serializeForUpdate() {
    return {
      x: this.rawX,
      y: this.rawY,
      z: this.rawZ,
      dir: this.direction,
      fill: this.fill
    };
  }
}

module.exports = Ball;
