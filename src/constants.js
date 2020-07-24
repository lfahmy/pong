module.exports = Object.freeze({
  MSG_TYPES: {
    JOIN_GAME: 'join_game',
    MENU: 'menu',
    WAITING: 'waiting',
    START: 'start',
    GAME_UPDATE: 'update',
    CLICK: 'click',
    MOUSE: 'mouse',
    SERVE: 'serve',
    GAME_OVER: 'game_over',
  },

  MAX_DIST: 60,
  FIELD_LINES: 9,
  FIELD_LINE_INCREMENT: 7.5, // 60/(9-1)
  CAM_DIST: 20,

  CLOSE_WIDTH: 120, 
  CLOSE_HEIGHT: 80,
  FAR_WIDTH: 30, // 120*[20/(20 + 60)]
  FAR_HEIGHT: 20, // 80*[20/(20 + 60)]

  RADIUS: 35,

  ROUND_LENGTH: 1, // each round is 1 minute long
  NUM_ROUNDS: 2, // best 2 of 3
});
