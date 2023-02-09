var WebSocketClient = require("websocket").client;
const v4 = require('uuid').v4;
const lodash = require('lodash');

const gameRoomId = 'IgtTpdFA';
//to localhost
const url = `ws://localhost:8083/api/${gameRoomId}`;
//to real website
// const url = `wss://planningchess.com/api/${gameRoomId}`;

const addPlayer = (id, role, playerName, connection) => {
  connection.send(
    JSON.stringify({
      type: "PlayerConnected",
      payload: { playerName, role, id },
    })
  );
};

const figures = ['pawn', 'knight', 'bishop', 'rook', 'king', 'queen'];
const rows = [0, 1, 2, 3, 4, 5];
const tiles = [1, 2, 3, 4, 5, 6];

const moveFigure = (id, playerName, connection) => {
  connection.send(
    JSON.stringify({
      type: "FigureMoved",
      payload: {
        row: lodash.sample(rows),
        tile: lodash.sample(tiles),
        figure: lodash.sample(figures),
        player: playerName,
        playerId: id,
      },
    })
  );
}

const skipMove = (id, connection) => {
  connection.send(
    JSON.stringify({
      type: 'MoveSkipped',
      payload: {
        playerId: id
      }
    })
  );
}

const makeMove = (id, playerName, connection) => {
  // 7/10 chance to skip move, 3/10 - to place a figure
  const number = Math.floor(Math.random() * 10) + 1;

  number > 3 
    ? moveFigure(id, playerName, connection)
    : skipMove(id, connection)
};

const onConnectHandler = (playerName) => (connection) => {
  const uuid = v4();
  //50/50 chance to get voter or spectator role
  const role = Math.floor(Math.random() * 2) + 1 === 1 ? 'Voter' : 'Spectator';
  addPlayer(uuid, role, playerName, connection);
  makeMove(uuid, playerName, connection);
};

//set player count
for (let i = 0; i < 15; i++) {
  const webSocket = new WebSocketClient();
  webSocket.on("connect", onConnectHandler(`Player ${i}`));
  webSocket.connect(url);
}