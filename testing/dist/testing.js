"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var typingRace_1 = require("../games/multiplayer/typingRace");
var rollADice_1 = require("../games/multiplayer/rollADice");
var rockPaperScissors_1 = require("../games/dual-player/rockPaperScissors");
var uuid_1 = require("uuid");
var flipACoin_1 = require("../games/multiplayer/flipACoin");
// import game from '../games/dual-player/rockPaperScissors';
// import { dnsPrefetchControl } from 'helmet';
// import Race from '../client/src/components/Race';
var httpServer = require("http").createServer();
var io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://192.168.1.6:3000",
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
                    socket.emit('start-flip');
                    socket.to(r.roomID).emit('start-flip');
                    var gid_1 = games.length;
                    games[gid_1] = {
                        room: r.roomID,
                        game: 'flip',
                        choices: []
                    };
                    var flip_1 = new flipACoin_1["default"]();
                    flip_1.calculate();
                    setTimeout(function () {
                        socket.emit('submit-flip-immediately');
                        socket.to(r.roomID).emit('submit-flip-immediately');
                        setTimeout(function () {
                            console.log('flip-finale');
                            var winner = flip_1.winner;
                            console.log(flip_1.winner);
                            console.log(games[gid_1]);
                            var winners = [];
                            var loosers = [];
                            games[gid_1].choices.forEach(function (choice) {
                                console.log(choice.choice);
                                console.log(winner);
                                console.log(choice + " Choice annoucement");
                                if (choice.choice === winner) {
                                    winners[winners.length] = choice;
                                    if (choice.id === socket.id) {
                                        socket.emit('victory');
                                    }
                                    else {
                                        socket.to(choice.id).emit('victory');
                                    }
                                }
                                else {
                                    loosers[loosers.length] = choice;
                                    if (choice.id === socket.id) {
                                        socket.emit('defeat');
                                    }
                                    else {
                                        socket.to(choice.id).emit('defeat');
                                    }
                                }
                            });
                            socket.emit('results', { loosers: loosers, winners: winners });
                            setTimeout(function () { socket.emit('normalize'); socket.to(r.roomID).emit('normalize'); }, 7000);
                        }, 5000);
                    }, 8000);
                    return r;
                }
                else {
                    return r;
                }
            });
        }
    });
    socket.on('submit-flip', function (msg) {
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
            var gid_2 = games.length;
            var rockP = returnRockObject(lobby_1.players);
            games[gid_2] = {
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
                        console.log(gid_2);
                        console.log(games.length);
                        console.log(games[gid_2]);
                        console.log(games[gid_2].functionality);
                        console.log('check point 1');
                        console.log(games[gid_2].choices);
                        var playerOne;
                        var playerTwo;
                        playerOne = (games[gid_2].choices.filter(function (c) {
                            if (c.id === lobby_1.leader) {
                                return c.choice;
                            }
                        }))[0].choice;
                        playerTwo = games[gid_2].choices.filter(function (c) {
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
                        var round = games[gid_2].functionality.round(options);
                        console.log('round: ' + round);
                        if (round === 1) {
                            n_1++;
                            console.log('check point 2');
                            console.log('check point 3');
                            console.log('Player one wins:-' + playerOneScore_1);
                            console.log('Player one wins:-' + games[gid_2].functionality.playerOne.wins);
                            if (playerOneScore_1 < games[gid_2].functionality.playerOne.wins) {
                                console.log('check point 3');
                                playerOneScore_1 = games[gid_2].functionality.playerOne.wins;
                                socket.emit('round-result', 'victory');
                                console.log('check point 4');
                                socket.to(lobby_1.roomID).emit('round-result', 'defeat');
                            }
                            else if (playerTwoScore_1 < games[gid_2].functionality.playerTwo.wins) {
                                playerTwoScore_1 = games[gid_2].functionality.playerTwo.wins;
                                socket.emit('round-result', 'defeat');
                                socket.to(lobby_1.roomID).emit('round-result', 'victory');
                            }
                            else {
                                socket.to(lobby_1.roomID).emit('round-result', 'draw');
                                socket.emit('round-result', 'draw');
                            }
                            games[gid_2].choices = [];
                        }
                        else if (round === 2) {
                            socket.emit('round-result', 'defeat');
                            socket.to(lobby_1.roomID).emit('round-result', 'victory');
                            console.log('Second player won');
                            socket.to(lobby_1.roomID).emit('victory');
                            socket.emit('defeat');
                            playerOneScore_1 = games[gid_2].functionality.playerOne.wins;
                            playerTwoScore_1 = games[gid_2].functionality.playerTwo.wins;
                            games[gid_2].choices = [];
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
                            playerOneScore_1 = games[gid_2].functionality.playerOne.wins;
                            playerTwoScore_1 = games[gid_2].functionality.playerTwo.wins;
                            games[gid_2].choices = [];
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
                var found_3 = false;
                g.choices = g.choices.map(function (c) {
                    if (c.id === socket.id) {
                        console.log('found');
                        found_3 = true;
                        c.choice = msg.choice;
                        return c;
                    }
                    else {
                        return c;
                    }
                });
                if (!found_3) {
                    g.choices[g.choices.length] = { id: socket.id, username: socket.username, choice: msg.choice };
                }
                return g;
            }
            else {
                return g;
            }
        });
    });
    socket.on('race', function () { return __awaiter(void 0, void 0, void 0, function () {
        var room, lobby_2, race_1, gid, raceText_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    room = rooms.find(function (r) {
                        if (r.leader = socket.id) {
                            return r;
                        }
                    });
                    if (!(room.length > 0)) return [3 /*break*/, 1];
                    return [3 /*break*/, 3];
                case 1:
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
                    race_1 = new typingRace_1["default"]();
                    console.log(race_1);
                    return [4 /*yield*/, race_1.getText()];
                case 2:
                    _a.sent();
                    socket.emit('start-race');
                    socket.to(lobby_2.roomID).emit('start-race');
                    console.log('generated race text');
                    console.log(race_1.text);
                    gid = games.length;
                    raceText_1 = race_1.text;
                    //    .slice(1, race.text.length-1)
                    games[gid] = { room: lobby_2.roomID, choices: [], text: '', functionality: race_1 };
                    games[gid].text = raceText_1;
                    console.log(raceText_1);
                    setTimeout(function () {
                        socket.emit('initialize-race', { text: raceText_1 });
                        socket.to(lobby_2.roomID).emit('initialize-race', { text: raceText_1 });
                    }, 5000);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
    socket.on('submit-race', function (msg) {
        console.log('submit race');
        var room = rooms.filter(function (r) {
            console.log('room filteration');
            console.log(r.roomID);
            console.log(msg.room);
            if (r.roomID === msg.room) {
                console.log('room found');
                return r;
            }
        });
        console.log("room = " + room[0]);
        console.log(msg);
        games = games.map(function (game) {
            console.log(game);
            if (game.room === msg.room) {
                console.log('matched');
                game.choices[game.choices.length] = { id: socket.id, username: socket.username, speed: msg.speed };
                if (game.choices.length === room[0].players.length) {
                    console.log('winner declaration');
                    var winner = game.functionality.winner(game.choices);
                    socket.emit('race-finished', winner);
                    socket.to(msg.room).emit('race-finished', winner);
                    console.log(winner);
                    setTimeout(function () {
                        socket.emit('normalize');
                        socket.to(msg.room).emit('normalize');
                    }, 10000);
                    // socket.to().em
                }
                return game;
            }
            else {
                return game;
            }
        });
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
