import { debounce } from 'throttle-debounce';
//import { getAsset } from './assets';
import { getCurrentState } from './state';
import { Stage, Shape, Text, Shadow } from "@createjs/easeljs";
import { updateMouse, click } from './index';

const Constants = require('../constants');

const stage = new Stage("myCanvas");
stage.canvas.style.cursor = "display";
stage.snapToPixelEnabled = true;
var topX = 88; var topY = 91; // top left corner coordinates
var botX = 712; var botY = 509; // bottom right corner coordinates
var width = 624; var height = 418; var sizeRatio = 1; // width and height of the arena
stage.canvas.width = 800; stage.canvas.height = 600;

//setCanvasDimensions();
function setCanvasDimensions() {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  /*const scaleRatio = Math.max(1, 800 / window.innerWidth);
  console.log(window.innerWidth, window.innerHeight);
  stage.canvas.width = scaleRatio * window.innerWidth;
  stage.canvas.height = stage.canvas.width * .75; //scaleRatio * window.innerHeight;

  width = stage.canvas.width;
  height = stage.canvas.height;
  sizeRatio = width / 800;*/
}
window.addEventListener('resize', debounce(40, setCanvasDimensions));

var Me;// = new Shape();
var Opp;// = new Shape();
var ball;// = new Shape();
var ballMarker;// = new Shape();
var p1Score = new Text("0", "40px Arial");
var p2Score = new Text("0", "40px Arial");
var p1RoundsWon = new Text("0", "25px Arial");
var p2RoundsWon = new Text("0", "25px Arial");
var clock = new Text("00:00", "40px Arial");
var round = new Text("Round 1", "25px Arial");
var waiting = new Text("WAITING", "40px Arial", "ghostwhite");

const scoreWidth = p1Score.getBounds().width;
const scoreHeight = p1Score.getBounds().height;
const roundsWonWidth = p1RoundsWon.getBounds().width;
const roundsWonHeight = p1RoundsWon.getBounds().height;
const clockWidth = clock.getBounds().width;
const clockHeight = clock.getBounds().height;
const roundWidth = round.getBounds().width;
const roundHeight = round.getBounds().height;
const waitingWidth = waiting.getBounds().width;
const waitingHeight = waiting.getBounds().height;
//console.log(scoreWidth, scoreHeight);

// initialize ball styles
var fillCommand;
var gradient;
var solid;

function makeShapes() {
  Me = new Shape();
  Opp = new Shape();
  ball = new Shape();
  ballMarker = new Shape();

  /*p1Score = new Text("0", "20px Arial", "white");
  p2Score = new Text("0", "20px Arial", "white");*/
}

function removeShapes() {
  Me = null;
  Opp = null;
  ball = null;
  ballMarker = null;

  /*p1Score = null;
  p2Score = null;*/
}

function drawRectangle(shape, { x, y, w, h }, ratio) {
  shape.graphics.beginStroke("#c55deb");
  shape.graphics.setStrokeStyle(3*ratio);
  shape.snapToPixel = true;
  shape.graphics.drawRect(x, y, w, h);
  //shape.shadow = new Shadow("white", 0, 0, 10);
  shape.snapToPixel = true;

  //shape.cache(x - 5, y - 5, w + 10, h + 10);
  stage.addChild(shape);
}
//gray
//#d7fd32
//#04ccfe
//#02eef4
//#f40275
//#c55deb

function drawCorner(shape, { mtx, mty, ltx, lty }, ratio) {
  shape.graphics.beginStroke("#c55deb");
  shape.graphics.setStrokeStyle(3*ratio);
  shape.snapToPixel = true;
  shape.graphics.moveTo(mtx, mty);
  shape.graphics.lineTo(ltx, lty);
  //shape.shadow = new Shadow("white", 0, 0, 10);
  shape.snapToPixel = true;

  const x = (mtx < ltx) ? mtx : ltx;
  const y = (mty < lty) ? mty : lty;
  //console.log(x, y, Math.abs(mtx - ltx), Math.abs(mty - lty));
  //shape.cache(x - 5, y - 5, Math.abs(mtx - ltx) + 10, Math.abs(mty - lty) + 10);
  stage.addChild(shape);
}
//gray
//#d7fd32
//#04ccfe
//#02eef4
//#f40275
//#c55deb

function drawMe() {
  const borderRadius = 10;
  const strokeStyle = 4;

  Me.graphics
    .beginStroke("#88ddfd")
    .setStrokeStyle(strokeStyle)
    .beginFill("#88ddfd")
    .drawRoundRect(0, 0, Constants.CLOSE_WIDTH, Constants.CLOSE_HEIGHT, borderRadius);
  Me.alpha = 0.5;
  
  Me.x = stage.canvas.width/2;
  Me.y = stage.canvas.height/2;

  stage.addChild(Me);
}
//"green"
//"#04ccfe"
//"#2268fd"
//"#0275f4"
//#02eef4

function drawOpp() {
  const borderRadius = 3;
  const strokeStyle = 2;

  Opp.graphics
    .beginStroke("#7e5deb")
    .setStrokeStyle(strokeStyle)
    .beginFill("#7e5deb")
    .drawRoundRect(0, 0, Constants.FAR_WIDTH, Constants.FAR_HEIGHT, borderRadius);
  Opp.alpha = 0.5;
  
  Opp.x = stage.canvas.width/2;
  Opp.y = stage.canvas.height/2;

  stage.addChild(Opp);
}
//"red"
//"#5832fd"
//"#f40275"

function drawBackground() {
  const start_x = topX;
  const start_y = topY;
  const start_w = width;
  const start_h = height;
  let end_x;
  let end_y;
  let end_w;
  let end_h;
  // each box has a z-coord of i*FIELD_LINE_INCREMENT
  for(let i = 0; i < Constants.FIELD_LINES; i++) {
    const border = new Shape();
    border.set(project(start_x, start_y, i*Constants.FIELD_LINE_INCREMENT));
    const ratio = Constants.CAM_DIST/(Constants.CAM_DIST + i*Constants.FIELD_LINE_INCREMENT);

    /* 
     * Drawing the corners is complicated. We draw a line from each corner of the previous box to the 
     * corresponding corner of the current box. end_x, end_y, end_h, and end_w give the corners of the previous
     * box. The thickness of the lines has to change as the field goes deeper into the screen, so we pass in 
     * a ratio that we multiply by the stroke. Each line has the same thickness as the box it's starting from.
     */ 
    if(i > 0) {
      const topLeft = new Shape();
      const topRight = new Shape();
      const botLeft = new Shape();
      const botRight = new Shape();
      const old_ratio = Constants.CAM_DIST/(Constants.CAM_DIST + (i-1)*Constants.FIELD_LINE_INCREMENT);

      drawCorner(topLeft, { mtx: end_x, mty: end_y, ltx: border.x, lty: border.y }, old_ratio);
      drawCorner(topRight, { mtx: end_x+end_w, mty: end_y, ltx: border.x+start_w*ratio, lty: border.y }, old_ratio);
      drawCorner(botRight, { mtx: end_x+end_w, mty: end_y+end_h, ltx: border.x+start_w*ratio, lty: border.y+start_h*ratio }, old_ratio);
      drawCorner(botLeft, { mtx: end_x, mty: end_y+end_h, ltx: border.x, lty: border.y+start_h*ratio }, old_ratio);
    }

    end_x = border.x;
    end_y = border.y;
    end_w = start_w*ratio;
    end_h = start_h*ratio;

    // x and y are 0 because it's drawing with reference to the shape called "border", not the whole canvas
    drawRectangle(border, {x: 0, y: 0, w: end_w, h: end_h}, ratio);
  }

  /*const corner = new Shape();
  drawCorner(corner, { mtx: start_x, mty: start_y, ltx: end_x, lty: end_y });
  drawCorner(corner, { mtx: start_x+start_w, mty: start_y, ltx: end_x+end_w, lty: end_y });
  drawCorner(corner, { mtx: start_x+start_w, mty: start_y+start_h, ltx: end_x+end_w, lty: end_y+end_h });
  drawCorner(corner, { mtx: start_x, mty: start_y+start_h, ltx: end_x, lty: end_y+end_h });*/
}

function drawBall() {
  fillCommand = ball.graphics.beginRadialGradientFill(["#c1f5ae","#83eb5d"], [0, 1], -8, -8, 0, 0, 0, 35).command;
  gradient = fillCommand.style;
  solid = "#ebe4e4";
  ball.graphics.drawCircle(0, 0, Constants.RADIUS);

  stage.addChild(ball);
}
//["#f7e2ff","#432a4c"]
//["#02eef4","#005f61"]
//["#ab98fe","#5832fd"]

function drawBallMarker() {
  ballMarker.graphics.beginStroke("#88ddfd");
  ballMarker.graphics.setStrokeStyle(3);
  ballMarker.snapToPixel = true;
  ballMarker.graphics.drawRect(topX, topY, width, height);
  //ballMarker.shadow = new Shadow("white", 0, 0, 5);

  stage.addChild(ballMarker);
}
//green
//#81971e
//#0275f4
//#02eef4

// TODO: Have to seriously adjust how all the displayed things look based on length and other stuff
// TODO: Also have to add theme and colors and stuff
// TODO: Get rid of magic numbers
export function drawGameInfo(me) {
  // Set x, y, alignment, and colors of the scores
  p1Score.x = topX - scoreWidth - 5;
  p2Score.x = topX - scoreWidth - 5;
  p1RoundsWon.x = botX + roundsWonWidth + 5;
  p2RoundsWon.x = botX + roundsWonWidth + 5;
  // Place my score lower and opp score higher
  if(me.type === "p1") {
    p1Score.y = stage.canvas.height/2 + 5;
    p1Score.color = "#88ddfd";
    p1RoundsWon.y = stage.canvas.height/2 + 5;
    p1RoundsWon.color = "#88ddfd";

    p2Score.y = stage.canvas.height/2 - scoreHeight - 5;
    p2Score.color = "#7e5deb";
    p2RoundsWon.y = stage.canvas.height/2 - roundsWonHeight - 5;
    p2RoundsWon.color = "#7e5deb";
  }
  else {
    p2Score.y = stage.canvas.height/2 + 5;
    p2Score.color = "#88ddfd";
    p2RoundsWon.y = stage.canvas.height/2 + 5;
    p2RoundsWon.color = "#88ddfd";

    p1Score.y = stage.canvas.height/2 - scoreHeight - 5;
    p1Score.color = "#7e5deb";
    p1RoundsWon.y = stage.canvas.height/2 - roundsWonHeight - 5;
    p1RoundsWon.color = "#7e5deb";
  }
  //const shadow = new Shadow("white", 0, 0, 5);
  //p1Score.shadow = shadow; p2Score.shadow = shadow; p1RoundsWon.shadow = shadow; p2RoundsWon.shadow = shadow;
  p1Score.textAlign = "right";
  p2Score.textAlign = "right";
  p1RoundsWon.textAlign = "left";
  p2RoundsWon.textAlign = "left";

  // Set x, y, and color of clock
  clock.x = stage.canvas.width/2 - clockWidth/2;
  clock.y = topY - clockHeight - 8;
  clock.color = "white";

  // Set x, y, and color of round display
  round.x = stage.canvas.width/2 - roundWidth/2;
  round.y = clock.y - roundHeight - 5;
  round.color = "white";

  // Add all game info to the stage
  stage.addChild(p1Score);
  stage.addChild(p2Score);
  stage.addChild(p1RoundsWon);
  stage.addChild(p2RoundsWon);
  stage.addChild(clock);
  stage.addChild(round);
}
// #5832fd was #f40275
// #c55deb was #5832fd

// #02eef4 was #0275f4
// #88ddfd was #02eef4

// utility function for mapping from 3d space to 2d space
// heavily influenced by https://math.stackexchange.com/questions/2337183/one-point-perspective-formula
// TODO: make this the end-all be-all for projection regardless of perspective
function project(x, y, z) {
  const cam = Constants.CAM_DIST;
  const newX = stage.canvas.width/2 + (x - stage.canvas.width/2)*(cam/(z + cam));
  const newY = stage.canvas.height/2 + (y - stage.canvas.height/2)*(cam/(z + cam));

  // returning an object like this allows us to directly use the Shape.set() method
  return {x: newX, y: newY};
}
//88 91
//322 247.75

function render() {
  const { me, opp, b} = getCurrentState();
  if (!me || !opp || !b) {
    return;
  }

  //console.log("P1:", g.p1Score, "P2:", g.p2Score);

  /*const text = new Text("NO MORE WAITING", "20px Arial", "ghostwhite");
  text.x = 400;
  text.y = 300;
  stage.addChild(text);
  stage.update();*/

  // the order of rendering matters
  renderOpp(opp);
  renderBall(b, me);
  renderMe(me);
  renderBallMarker(b, me);
  stage.update();
}

// Since "me" gets updated by the mouse directly and not the server (for lag reasons), we have to check that 
// "me" is in bounds on the client side.
function renderMe(me) {
  const bounds = {top: topY, right: topX + width, bottom: topY + height, left: topX};

  let x = stage.mouseX - Constants.CLOSE_WIDTH/2;
  /*if (x + Constants.CLOSE_WIDTH > bounds.right){
    x = bounds.right - Constants.CLOSE_WIDTH;
  } else if (x < bounds.left){
    x = bounds.left;
  }*/

  let y = stage.mouseY - Constants.CLOSE_HEIGHT/2;
  /*if (y + Constants.CLOSE_HEIGHT > bounds.bottom){
    y = bounds.bottom - Constants.CLOSE_HEIGHT;
  } else if (y < bounds.top){
    y = bounds.top;
  }*/

  Me.x = x;
  Me.y = y;

  //stage.update();
}

function renderOpp(opp) {
  opp.x = opp.x * sizeRatio;
  opp.y = opp.y * sizeRatio;

  // if I'm p2, we must flip the x-coord of p1
  const x = opp.z ? opp.x : stage.canvas.width - opp.x - Constants.CLOSE_WIDTH;
  // the opponent is always at z = 60, relative to me
  Opp.set(project(x, opp.y, Constants.MAX_DIST));

  //stage.update();
}

function renderBall(b, me) {
  b.x = b.x * sizeRatio;
  b.y = b.y * sizeRatio;
  const { x, y, z, dir, fill } = b;

  // adjusting canvas coord of ball based on player perspective
  const flipZ = Math.abs(me.z - z);
  const flipX = me.z ? stage.canvas.width - x : x;
  ball.set(project(flipX, y, flipZ));

  // scaling the ball according to distance from player
  const ratio = Constants.CAM_DIST/(Constants.CAM_DIST + flipZ);
  ball.scaleX = ratio;
  ball.scaleY = ratio;

  if(fill === "gradient") fillCommand.style = gradient;
  else if (fill === "solid") fillCommand.style = solid;

  //stage.update();
}

function renderBallMarker(b, me) {
  // adjusting canvas coord of ball based on player perspective
  const flipZ = Math.abs(me.z - b.z);

  // raw x, y, w, h, of every box
  const start_x = topX;
  const start_y = topY;
  const start_w = width; 
  const start_h = height;

  const border = new Shape();
  border.set(project(start_x, start_y, flipZ));
  const ratio = Constants.CAM_DIST/(Constants.CAM_DIST + flipZ);

  ballMarker.graphics.clear().beginStroke("#88ddfd").setStrokeStyle(3*ratio)
    .drawRect(border.x, border.y, start_w*ratio, start_h*ratio);
  //ballMarker.shadow = new Shadow("white", 0, 0, 5);
  
  /*ballMarker.x = border.x;
  ballMarker.y = border.y;
  ballMarker.scale = ratio;*/

  //stage.update();
}
//green
//#81971e
//#0275f4
//#02eef4

// TODO: Explanatory text for rules, rounds, winning score, clock, serve time limit, winning/losing screens
export function renderGameInfo(me, g) {
  // only assign the colors/positions of the score if we haven't done that yet
  /*if(p1Score.y == 0 && p2Score.y == 0)  {
    p1Score.x = 88 - scoreWidth - 10;
    p2Score.x = 88 - scoreWidth - 10;

    if(me.type === "p1") {
      p1Score.y = 300 + 5;
      p1Score.color = "blue";

      p2Score.y = 300 - scoreHeight - 5;
      p2Score.color = "red";
    }
    else {
      p2Score.y = 300 + 5;
      p2Score.color = "blue";

      p1Score.y = 300 - scoreHeight - 5;
      p1Score.color = "red";
    }
  }*/
  p1Score.text = g.p1Score.toString();
  p2Score.text = g.p2Score.toString();
  p1RoundsWon.text = g.p1RoundsWon.toString();
  p2RoundsWon.text = g.p2RoundsWon.toString();
  /*p1Score.textAlign = "right";
  p2Score.textAlign = "right";*/

  // TODO: Consider where milliseconds should come in
  // TODO: Clock should go down not up
  let minutes = Math.floor((g.clock % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = 20 - Math.floor((g.clock % (1000 * 60)) / 1000);
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  clock.text = minutes + ":" + seconds;

  /*if(round.x == 0) {
    round.x = 200;
  }*/
  //round.text = "Round: " + g.round + " -- P1: " + g.p1RoundsWon + " -- P2: " + g.p2RoundsWon;
  round.text = "Round " + g.round;

  //console.log(minutes, ":", seconds, "\nRound:", g.round, "-- P1:", g.p1RoundsWon, "-- P2:", g.p2RoundsWon);

  //stage.update();
}

export function renderWinningScore(score) {
  stage.removeEventListener("stagemousedown", click);

  const str = "First to " + score + " wins !";
  const text = new Text(str, "40px Arial", "ghostwhite");
  text.x = stage.canvas.width/2 - text.getBounds().width/2;
  text.y = stage.canvas.height/2 - text.getBounds().height/2;
  stage.addChild(text);
  stage.update();

  setTimeout(() => {
    stage.removeChild(text);
    stage.update();
    stage.addEventListener('stagemousedown', click);
  }, 2000);
}

// TODO: Weigh pros and cons of making this canvas instead of pure HTML
function renderMenu() {
  document.getElementById('menu').style.display = "block";
}

// TODO: Both wait functions are useless for now
//export function waiting() {
  /*
  clearInterval(renderInterval);
  const text = new Text("WAITING", "20px Arial", "ghostwhite");
  text.x = stage.canvas.width/2;
  text.y = stage.canvas.height/2;
  stage.addChild(text);
  stage.update();
  */
//}

function renderWaiting() {
  if(waiting.text.length < 10) waiting.text += ".";
  else waiting.text = "WAITING";

  stage.update();
}

// Keep one function always on an interval.
let renderInterval = setInterval(renderMenu, 1000 / 60);

// Draws all the necessary shapes for the first time.
// Replaces _____ rendering with game rendering.
export function playing() {
  clearInterval(renderInterval);

  stage.removeAllChildren();
  stage.removeAllEventListeners();

  // the order of drawing matters
  makeShapes();
  drawBackground();
  drawOpp();
  drawBall();
  drawMe();
  drawBallMarker();
  
  //stage.canvas.style.cursor = "none";
  stage.update();
  stage.addEventListener("stagemousemove", updateMouse);
  stage.addEventListener('stagemousedown', click);
  renderInterval = setInterval(render, 1000 / 60);
}

// Gets rid of all shapes and event listeners.
// Replaces game rendering with menu or waiting rendering.
export function notPlaying(state = Constants.MSG_TYPES.MENU) {
  console.log("called notPlaying() with", state);
  clearInterval(renderInterval);

  stage.removeAllChildren();
  stage.removeAllEventListeners();
  removeShapes();

  // TODO: Look into cacheing or doing something else with this instead of
  // creating it every time
  // Maybe use HTML instead... depends on what we decide to put here
  if(state === Constants.MSG_TYPES.WAITING) {
    document.getElementById('menu').style.display = "none";

    /*const text = new Text("WAITING", "20px Arial", "ghostwhite");
    text.x = stage.canvas.width/2;
    text.y = stage.canvas.height/2;
    stage.addChild(text);*/

    waiting.x = stage.canvas.width/2 - waitingWidth/2;
    waiting.y = stage.canvas.height/2 - waitingHeight/2;
    stage.addChild(waiting);

    renderInterval = setInterval(renderWaiting, 750);
  }
  else if(state === Constants.MSG_TYPES.MENU) {
    renderInterval = setInterval(renderMenu, 1000 / 60);
  }

  stage.update();
}
