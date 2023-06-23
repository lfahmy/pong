const INITIAL_RADIUS = 35;

class Ball {

  constructor(maxDistance) {
    //console.log("ball");
    this.maxDistance = maxDistance;
    this.reset();
  }

  applySpin(dt) {
    /*if(this.xSpin < 0) {
      if(this.xSpin > -.1) this.xSpin = 0;
      else this.xSpin += .1;
    }
    else if(this.xSpin > 0) {
      if(this.xSpin < .1) this.xSpin = 0;
      else this.xSpin -= .1;
    }

    if(this.ySpin < 0) {
      if(this.ySpin > -.1) this.ySpin = 0;
      else this.ySpin += .1;
    }
    else if(this.ySpin > 0) {
      if(this.ySpin < .1) this.ySpin = 0;
      else this.ySpin -= .1;
    }*/

    if (this.direction === "out"){
      //console.log("ball", "xSpin:", this.xSpin, "ySpin:", this.ySpin);
      this.xVelocity += dt * this.xSpin;// / this.maxDistance;
      this.yVelocity += dt * this.ySpin;// / this.maxDistance;
    } else {
      this.xVelocity -= dt * this.xSpin;// / this.maxDistance;
      this.yVelocity += dt * this.ySpin;// / this.maxDistance;
    }

    /*this.xSpin *= .95;
    this.ySpin *= .95;*/
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

    this.xSpin = 0; //5 * (Math.random() - 0.5);
    this.ySpin = 0; //5 * (Math.random() - 0.5);

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
