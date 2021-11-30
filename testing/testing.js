"use strict";
exports.__esModule = true;
var typingRace_1 = require("../games/multiplayer/typingRace");
var rollADice_1 = require("../games/multiplayer/rollADice");
var rockPaperScissors_1 = require("../games/dual-player/rockPaperScissors");
var uuid_1 = require("uuid");
// import game from '../games/dual-player/rockPaperScissors';
// import { dnsPrefetchControl } from 'helmet';
// import Race from '../client/src/components/Race';
var httpServer = require("http").createServer();
var io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
});
var returnRockObject = function (a) {
    var rockP = new rockPaperScissors_1["default"]({ playerOne: a[0], playerTwo: a[1] });
    return rockP;
};
var rooms = [];
var games = [];
io.on("connection", function (socket) {
    var dice;
    var race;
    var flip;
    var rockPaperScissors = { playerOne: { choice: '', wins: 0 }, playerTwo: { choice: '', wins: 0 } };
    // console.log(socket)
    console.log('connected');
    socket.emit("hello", { msg: 'You are now connected to the real time server' });
    socket.on('set-username', function (msg) {
        socket.username = msg.username;
        socket.emit('username-updated', { msg: msg.username });
    });
    socket.on("create-room", function () {
        if (!socket.username) {
            socket.username = 'guest';
        }
        var roomID = uuid_1.v4();
        var room = { roomID: roomID, leader: socket.id, players: [{ id: socket.id, username: socket.username }], currentlyPlaying: '/' };
        rooms.push(room);
        socket.join(roomID);
        socket.emit('room-created', { msg: roomID, room: room });
    });
    socket.on("join-room", function (msg) {
        // var clients = Object.keys(io.adapter.rooms[msg.roomID])
        // console.log(clients);
        if (!socket.username) {
            socket.username = 'guest';
        }
        var found = 0;
        var userroom;
        rooms = rooms.map(function (room) {
            if (room.roomID === msg.roomID) {
                room.players[room.players.length] = { id: socket.id, username: socket.username };
                found = 1;
                userroom = room;
                return room;
            }
            else {
                return room;
            }
        });
        if (found === 1) {
            socket.join(msg.roomID);
            socket.emit('room-joined', { msg: "" + msg.roomID, users: userroom.players, room: userroom });
            socket.to(msg.roomID).emit('new-connection', { msg: socket.username + " has joined " + msg.roomID, user: socket.username, room: userroom });
        }
        else {
            socket.emit('room-not-found');
        }
    });
    socket.on('message', function (msg) {
        if (!socket.username) {
            socket.username = 'Guest';
        }
        socket.broadcast.to(msg.roomID).emit('message', { msg: msg.msg, username: socket.username });
        console.log(msg);
    });
    socket.on('get-id', function () {
        socket.emit('give-id', { msg: socket.id });
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
        rooms = rooms.filter(function (room) {
            if (room.leader.toString() === socket.id.toString()) {
                console.log('leader disconnected');
                socket.to(room.roomID).emit('exit-lobby');
            }
            else {
                room.players = room.players.filter(function (player) {
                    if (socket.id.toString() === player.id.toString()) {
                        console.log('member disconnected');
                        socket.to(room.roomID).emit('player-disconnected', { msg: socket.username + " disconnected", room: room });
                    }
                    else {
                        return player;
                    }
                });
                return room;
            }
        });
    });
    socket.on('dice', function () {
        var room = rooms.find(function (r) {
            if (r.leader = socket.id) {
                return r;
            }
        });
        if (room.length < 0) {
        }
        else {
            rooms = rooms.map(function (r) {
                if (r.leader == socket.id) {
                    console.log('updated lobby');
                    r.currentlyPlaying = '/dice';
                    socket.emit('ask-choice-dice');
                    socket.to(room.roomID).emit('ask-choice-dice');
                    console.log(room);
                    games[games.length] = {
                        room: r.roomID,
                        game: 'dice',
                        choices: []
                    };
                    return r;
                }
                else {
                    return r;
                }
            });
            setTimeout(function () {
                socket.to(room.roomID).emit('submit-dice-immediately');
                socket.emit('submit-dice-immediately');
                console.log('asked for it');
                setTimeout(function () {
                    var alpha = games.find(function (game) {
                        if (game.room === room.roomID) {
                            return game;
                        }
                    });
                    console.log(alpha);
                    var roll = (new rollADice_1["default"]()).calculate();
                    console.log(roll);
                    var winners = [];
                    var loosers = [];
                    alpha.choices.map(function (choice) {
                        console.log(choice.choice);
                        if (choice.choice === roll) {
                            socket.to(choice.id).emit('victory');
                            if (choice.id === socket.id) {
                                socket.emit('victory');
                            }
                            console.log('victory');
                            winners[winners.length] = { id: choice.id, username: choice.username };
                        }
                        else {
                            console.log('defeat');
                            if (choice.id === socket.id) {
                                socket.emit('defeat');
                            }
                            socket.to(choice.id).emit('defeat');
                            loosers[loosers.length] = { id: choice.id, username: choice.username };
                        }
                    });
                    socket.to(alpha.room).emit('results', { winners: winners, loosers: loosers });
                    games = games.filter(function (game) {
                        if (game.room === alpha.room) {
                        }
                        else {
                            return game;
                        }
                    });
                    setTimeout(function () {
                        socket.emit('normalize');
                        socket.to(alpha.room).emit('normalize');
                    }, 25000);
                }, 2000);
            }, 10000);
        }
    });
    socket.on('submit-dice-choice', function (msg) {
        console.log(msg);
        games = games.map(function (g) {
            if (g.room === msg.roomID) {
                var found_1 = false;
                g.choices = g.choices.map(function (c) {
                    if (c.id === socket.id) {
                        console.log('found');
                        found_1 = true;
                        c.choice = msg.choice;
                        return c;
                    }
                    else {
                        return c;
                    }
                });
                if (!found_1) {
                    g.choices[g.choices.length] = { id: socket.id, username: socket.username, choice: msg.choice };
                }
                return g;
            }
            else {
                return g;
            }
        });
    });
    socket.on('flip', function () {
        var room = rooms.find(function (r) {
            if (r.leader = socket.id) {
                return r;
            }
        });
        if (room.length < 0) {
        }
        else {
            rooms = rooms.map(function (r) {
                if (r.leader == socket.id) {
                    r.currentlyPlaying = '/flip';
                    return r;
                }
                else {
                    return r;
                }
            });
        }
    });
    socket.on('rock', function () {
        var room = rooms.find(function (r) {
            if (r.leader = socket.id) {
                return r;
            }
        });
        if (room.length > 0) {
        }
        else {
            var lobby_1;
            rooms = rooms.map(function (r) {
                if (r.leader == socket.id) {
                    r.currentlyPlaying = '/rock';
                    lobby_1 = r;
                    return r;
                }
                else {
                    return r;
                }
            });
            var gid_1 = games.length;
            var rockP = returnRockObject(lobby_1.players);
            games[gid_1] = {
                room: lobby_1.roomID,
                choices: [],
                functionality: rockP
            };
            console.log(games.length);
            console.log(rockP.playerOne);
            console.log(rockP.playerTwo);
            socket.emit('start-rock');
            socket.to(lobby_1.roomID).emit('start-rock');
            var playerOneScore_1 = 0;
            var playerTwoScore_1 = 0;
            var n_1 = 0;
            var idInterval_1 = setInterval(function () {
                if (n_1 === 3) {
                }
                else {
                    console.log('one');
                    socket.emit('submit-rock-immediately');
                    socket.to(lobby_1.roomID).emit('submit-rock-immediately');
                    setTimeout(function () {
                        console.log(games);
                        console.log(gid_1);
                        console.log(games.length);
                        console.log(games[gid_1]);
                        console.log(games[gid_1].functionality);
                        console.log('check point 1');
                        console.log(games[gid_1].choices);
                        var playerOne;
                        var playerTwo;
                        playerOne = (games[gid_1].choices.filter(function (c) {
                            if (c.id === lobby_1.leader) {
                                return c.choice;
                            }
                        }))[0].choice;
                        playerTwo = games[gid_1].choices.filter(function (c) {
                            console.log(c.id);
                            console.log(lobby_1.leader);
                            if (c.id !== lobby_1.leader) {
                                return c.choice;
                            }
                        })[0].choice;
                        console.log(playerOne);
                        console.log(playerTwo);
                        console.log("Leader's choice = " + playerOne);
                        var options = { playerOne: playerOne, playerTwo: playerTwo };
                        console.log(options);
                        var round = games[gid_1].functionality.round(options);
                        console.log('round: ' + round);
                        if (round === 1) {
                            n_1++;
                            console.log('check point 2');
                            console.log('check point 3');
                            console.log('Player one wins:-' + playerOneScore_1);
                            console.log('Player one wins:-' + games[gid_1].functionality.playerOne.wins);
                            if (playerOneScore_1 < games[gid_1].functionality.playerOne.wins) {
                                console.log('check point 3');
                                playerOneScore_1 = games[gid_1].functionality.playerOne.wins;
                                socket.emit('round-result', 'victory');
                                console.log('check point 4');
                                socket.to(lobby_1.roomID).emit('round-result', 'defeat');
                            }
                            else if (playerTwoScore_1 < games[gid_1].functionality.playerTwo.wins) {
                                playerTwoScore_1 = games[gid_1].functionality.playerTwo.wins;
                                socket.emit('round-result', 'defeat');
                                socket.to(lobby_1.roomID).emit('round-result', 'victory');
                            }
                            else {
                                socket.to(lobby_1.roomID).emit('round-result', 'draw');
                                socket.emit('round-result', 'draw');
                            }
                            games[gid_1].choices = [];
                        }
                        else if (round === 2) {
                            socket.emit('round-result', 'defeat');
                            socket.to(lobby_1.roomID).emit('round-result', 'victory');
                            console.log('Second player won');
                            socket.to(lobby_1.roomID).emit('victory');
                            socket.emit('defeat');
                            playerOneScore_1 = games[gid_1].functionality.playerOne.wins;
                            playerTwoScore_1 = games[gid_1].functionality.playerTwo.wins;
                            games[gid_1].choices = [];
                            n_1 = 3;
                            games = games.filter(function (g) {
                                if (g.room = lobby_1.roomID) {
                                }
                                else {
                                    return g;
                                }
                            });
                            setTimeout(function () {
                                socket.emit('normalize');
                                socket.to(lobby_1.roomID).emit('normalize');
                            }, 5000);
                            console.log('cleared');
                            clearInterval(idInterval_1);
                        }
                        else if (round === 3) {
                            socket.emit('round-result', 'victory');
                            socket.to(lobby_1.roomID).emit('round-result', 'defeat');
                            console.log('first player won');
                            socket.to(lobby_1.roomID).emit('defeat');
                            socket.emit('victory');
                            playerOneScore_1 = games[gid_1].functionality.playerOne.wins;
                            playerTwoScore_1 = games[gid_1].functionality.playerTwo.wins;
                            games[gid_1].choices = [];
                            n_1 = 3;
                            games = games.filter(function (g) {
                                if (g.room = lobby_1.roomID) {
                                }
                                else {
                                    return g;
                                }
                            });
                            setTimeout(function () {
                                socket.emit('normalize');
                                socket.to(lobby_1.roomID).emit('normalize');
                            }, 5000);
                            console.log('cleared');
                            clearInterval(idInterval_1);
                        }
                    }, 1000);
                }
                // }, 10000)
            }, 5000);
            if (n_1 === 3) {
                games = games.filter(function (g) {
                    if (g.room = lobby_1.roomID) {
                    }
                    else {
                        return g;
                    }
                });
                clearInterval(idInterval_1);
            }
        }
    });
    socket.on('submit-rock', function (msg) {
        console.log(msg);
        games = games.map(function (g) {
            if (g.room === msg.roomID) {
                var found_2 = false;
                g.choices = g.choices.map(function (c) {
                    if (c.id === socket.id) {
                        console.log('found');
                        found_2 = true;
                        c.choice = msg.choice;
                        return c;
                    }
                    else {
                        return c;
                    }
                });
                if (!found_2) {
                    g.choices[g.choices.length] = { id: socket.id, username: socket.username, choice: msg.choice };
                }
                return g;
            }
            else {
                return g;
            }
        });
    });
    socket.on('race', function () {
        var room = rooms.find(function (r) {
            if (r.leader = socket.id) {
                return r;
            }
        });
        if (room.length > 0) {
        }
        else {
            var lobby_2;
            rooms = rooms.map(function (r) {
                if (r.leader == socket.id) {
                    r.currentlyPlaying = '/race';
                    lobby_2 = r;
                    return r;
                }
                else {
                    return r;
                }
            });
            var race_1 = new typingRace_1["default"]();
            console.log(race_1.getText());
        }
    });
});
httpServer.listen(5000, function () {
    console.log('The Server is up and running');
});
// setInterval(() => {
//     console.log('====================================');
//     console.log(...rooms);
//     console.log('====================================');
// }, 10000)
// const testing = async ()=>{
// const players = {players:['one','two','three','four','five']};
// const newRace = new typingRace(players.players);
// console.log(await newRace.getText());
// console.log(newRace.winner([{name:'one', speed:90},{name:'one', speed:100},{name:'one', speed:120},{name:'one', speed:30},{name:'five', speed:150} ]))
// const newRock = new rockPaperScissors({ playerOne: 'no-one', playerTwo: 'someone' });
// console.log(newRock.round({playerOne:'rock', playerTwo:'scissors'}));
// console.log(newRock.round({playerOne:'paper', playerTwo:'scissors'}));
// console.log(newRock.round({playerOne:'rock', playerTwo:'rock'}));
// console.log(newRock.round({playerOne:'rock', playerTwo:'rock'}));
// console.log(newRock.round({playerOne:'rock', playerTwo:'scissors'}));
// const newRoll= new rollAdice(['hungry', 'hippos']);
// console.log(newRoll.calculate());
// const newFlip = new flipACoin({betsOnTails:['Shounak KP', 'Shounak'], betsOnHeads:['TheFox', 'TheFoxWhoFucks']})
// newFlip.calculate();
// console.log(newFlip.winner);
// }
// testing();
