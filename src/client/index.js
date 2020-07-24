import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { initState, processGameUpdate } from './state';
import { waiting, playing, notPlaying } from './render';
import './main.css';

const Constants = require('../constants');

const playButton = document.getElementById('playButton');
const usernameInput = document.getElementById('textInput');
const menu = document.getElementById('menu');

const socket = io(`ws://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

const connect = () => (
  connectedPromise.then(() => {
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.WAITING, notPlaying);
    socket.on(Constants.MSG_TYPES.GAME_OVER, notPlaying);
    socket.on(Constants.MSG_TYPES.START, start);
  })
);

const join = () => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME);
  /*menu.style.display = "none";
  notPlaying(Constants.MSG_TYPES.WAITING);*/
};

const start = () => {
	console.log("receiving start message");
	//menu.style.display = "none";
	initState();
	playing();
};

Promise.all([
	connect(),
]).then(() => {
	playButton.onclick = () => {
    	console.log(usernameInput.value);
    	join();
    }
});


export const updateMouse = throttle(20, e => {
  socket.emit(Constants.MSG_TYPES.MOUSE, e.stageX, e.stageY);
});

export const click = e => { 
  //console.log("sup");
  socket.emit(Constants.MSG_TYPES.CLICK, e = null); 
  //console.log("wasabi");
};

