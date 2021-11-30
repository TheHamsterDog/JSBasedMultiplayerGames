import typingRace from '../games/multiplayer/typingRace';
import rollAdice from '../games/multiplayer/rollADice';
import flipACoin from '../games/multiplayer/flipACoin';
import rockPaperScissors from '../games/dual-player/rockPaperScissors'
import { v4 as uuidv4 } from 'uuid';
import flipAcoin from '../games/multiplayer/flipACoin';
import game from '../games/dual-player/rockPaperScissors';
// import game from '../games/dual-player/rockPaperScissors';
// import { dnsPrefetchControl } from 'helmet';
// import Race from '../client/src/components/Race';
const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://192.168.1.6:3000",

        credentials: true
    }
});
const returnRockObject = (a) => {
    let rockP = new rockPaperScissors({ playerOne: a[0], playerTwo: a[1] });
    return rockP;
}
let rooms: any = [];
let games: any = [];
io.on("connection", (socket) => {
    let dice;
    let race;
    let flip;
    let rockPaperScissors = { playerOne: { choice: '', wins: 0 }, playerTwo: { choice: '', wins: 0 } };
    // console.log(socket)
    console.log('connected');
    socket.emit("hello", { msg: 'You are now connected to the real time server' });
    socket.on('set-username', (msg) => {
        socket.username = msg.username;
        socket.emit('username-updated', { msg: msg.username });
    })
    socket.on("create-room", () => {
        if (!socket.username) {
            socket.username = 'guest';
        }
        const roomID: string = uuidv4();
        const room = { roomID: roomID, leader: socket.id, players: [{ id: socket.id, username: socket.username }], currentlyPlaying: '/' }
        rooms.push(room);
        socket.join(roomID);
        socket.emit('room-created', { msg: roomID, room: room });
    });

    socket.on("join-room", (msg) => {

        // var clients = Object.keys(io.adapter.rooms[msg.roomID])
        // console.log(clients);

        if (!socket.username) {
            socket.username = 'guest';
        }
        let found = 0;
        let userroom;
        rooms = rooms.map(room => {
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
            socket.emit('room-joined', { msg: `${msg.roomID}`, users: userroom.players, room: userroom });

            socket.to(msg.roomID).emit('new-connection', { msg: `${socket.username} has joined ${msg.roomID}`, user: socket.username, room: userroom });
        }
        else {
            socket.emit('room-not-found');
        }

    })
    socket.on('message', (msg) => {
        if (!socket.username) {
            socket.username = 'Guest';
        }
        socket.broadcast.to(msg.roomID).emit('message', { msg: msg.msg, username: socket.username });
        console.log(msg);
    })
    socket.on('get-id', () => {
        socket.emit('give-id', { msg: socket.id });
    })
    socket.on('disconnect', () => {
        console.log('user disconnected');

        rooms = rooms.filter(room => {
            if (room.leader.toString() === socket.id.toString()) {
                console.log('leader disconnected')
                socket.to(room.roomID).emit('exit-lobby');
            }
            else {


                room.players = room.players.filter(player => {
                    if (socket.id.toString() === player.id.toString()) {
                        console.log('member disconnected');
                        socket.to(room.roomID).emit('player-disconnected', { msg: `${socket.username} disconnected`, room: room })
                    }
                    else {
                        return player;
                    }


                })
                return room;
            }
        })


    });
    socket.on('dice', () => {
        const room = rooms.find(r => {
            if (r.leader = socket.id) {

                return r;
            }


        })


        if (room.length < 0) {

        }
        else {
            rooms = rooms.map(r => {
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
                    }
                    return r;
                }
                else {
                    return r;
                }

            });
            setTimeout(() => {
                socket.to(room.roomID).emit('submit-dice-immediately')
                socket.emit('submit-dice-immediately')
                console.log('asked for it');
                setTimeout(() => {

                    const alpha: any = games.find(game => {
                        if (game.room === room.roomID) {
                            return game;
                        }
                    });
                    console.log(alpha);
                    let roll = (new rollAdice()).calculate();
                    console.log(roll);
                    let winners: any = [];
                    let loosers: any = [];
                    alpha.choices.map((choice) => {
                        console.log(choice.choice);
                        if (choice.choice === roll) {
                            socket.to(choice.id).emit('victory');
                            if (choice.id === socket.id) {
                                socket.emit('victory');
                            }
                            console.log('victory');
                            winners[winners.length] = { id: choice.id, username: choice.username }

                        }
                        else {
                            console.log('defeat');
                            if (choice.id === socket.id) {
                                socket.emit('defeat');
                            }
                            socket.to(choice.id).emit('defeat');
                            loosers[loosers.length] = { id: choice.id, username: choice.username }
                        }
                    });


                    socket.to(alpha.room).emit('results', { winners: winners, loosers: loosers });
                    games = games.filter(
                        game => {
                            if (game.room === alpha.room) {

                            }
                            else {
                                return game;
                            }

                        }

                    )
                    setTimeout(() => {
                        socket.emit('normalize');
                        socket.to(alpha.room).emit('normalize');
                    }, 25000);

                }, 2000);
            }, 10000);


        }
    })

    socket.on('submit-dice-choice', msg => {
        console.log(msg);
        games = games.map(g => {
            if (g.room === msg.roomID) {
                let found = false;
                g.choices = g.choices.map(c => {
                    if (c.id === socket.id) {
                        console.log('found');
                        found = true;

                        c.choice = msg.choice;
                        return c;
                    }
                    else {
                        return c;
                    }

                });

                if (!found) {
                    g.choices[g.choices.length] = { id: socket.id, username: socket.username, choice: msg.choice };
                }

                return g;
            }
            else {
                return g;
            }
        })
    });

    socket.on('flip', () => {
        const room = rooms.find(r => {
            if (r.leader = socket.id) {

                return r;
            }


        })


        if (room.length < 0) {

        }
        else {
            rooms = rooms.map(r => {
                if (r.leader == socket.id) {

                    r.currentlyPlaying = '/flip';
                    socket.emit('start-flip');
                    socket.to(r.roomID).emit('start-flip');
                    let gid = games.length;
                    games[gid] = {
                        room: r.roomID,
                        game: 'flip',
                        choices: []
                    }
                    const flip = new flipAcoin();
                    flip.calculate();
                    setTimeout(() => {
                        socket.emit('submit-flip-immediately');
                        socket.to(r.roomID).emit('submit-flip-immediately');

                        setTimeout(() => {
                            console.log('flip-finale')
                            const winner = flip.winner;
                            console.log(flip.winner)
                            console.log(games[gid]);
                            let winners: any = [];
                            let loosers: any = []
                            games[gid].choices.forEach(choice => {
                                console.log(choice.choice)
                                console.log(winner);
                                console.log(choice + ` Choice annoucement`);
                                if (choice.choice === winner) {
                                    winners[winners.length] = choice;
                                    if (choice.id === socket.id) {
                                        socket.emit('victory')
                                    }
                                    else {
                                        socket.to(choice.id).emit('victory')
                                    }
                                }
                                else {
                                    loosers[loosers.length] = choice
                                    if (choice.id === socket.id) {
                                        socket.emit('defeat')
                                    }
                                    else {
                                        socket.to(choice.id).emit('defeat')
                                    }
                                }
                            });
                            socket.emit('results', { loosers: loosers, winners: winners });
                            setTimeout(() => { socket.emit('normalize'); socket.to(r.roomID).emit('normalize') }, 7000);

                        }, 5000)

                    }, 8000)

                    return r;

                }
                else {
                    return r;
                }
            })

        }
    });
    socket.on('submit-flip', (msg) => {
        console.log(msg);
        games = games.map(g => {
            if (g.room === msg.roomID) {
                let found = false;
                g.choices = g.choices.map(c => {
                    if (c.id === socket.id) {
                        console.log('found');
                        found = true;

                        c.choice = msg.choice;
                        return c;
                    }
                    else {
                        return c;
                    }

                });

                if (!found) {
                    g.choices[g.choices.length] = { id: socket.id, username: socket.username, choice: msg.choice };
                }

                return g;
            }
            else {
                return g;
            }
        })
    })
    socket.on('rock', () => {
        const room = rooms.find(r => {
            if (r.leader = socket.id) {

                return r;
            }


        })


        if (room.length > 0) {

        }
        else {
            let lobby;

            rooms = rooms.map(r => {
                if (r.leader == socket.id) {

                    r.currentlyPlaying = '/rock';
                    lobby = r;
                    return r;

                }
                else {
                    return r;
                }
            })
            const gid = games.length;
            let rockP: any = returnRockObject(lobby.players);
            games[gid] = {
                room: lobby.roomID,
                choices: [],
                functionality: rockP
            };
            console.log(games.length);
            console.log(rockP.playerOne);
            console.log(rockP.playerTwo);
            socket.emit('start-rock');
            socket.to(lobby.roomID).emit('start-rock');
            let playerOneScore = 0;
            let playerTwoScore = 0;
            let n = 0;

            let idInterval = setInterval(() => {

                if (n === 3) {

                }
                else {
                    console.log('one');


                    socket.emit('submit-rock-immediately');
                    socket.to(lobby.roomID).emit('submit-rock-immediately');
                    setTimeout(() => {
                        console.log(games);
                        console.log(gid);
                        console.log(games.length);
                        console.log(games[gid]);
                        console.log(games[gid].functionality);
                        console.log('check point 1')
                        console.log(games[gid].choices)
                        let playerOne;
                        let playerTwo;
                        playerOne = (games[gid].choices.filter(c => {
                            if (c.id === lobby.leader) {
                                return c.choice
                            }
                        }))[0].choice;
                        playerTwo = games[gid].choices.filter(c => {
                            console.log(c.id);
                            console.log(lobby.leader)
                            if (c.id !== lobby.leader) {
                                return c.choice
                            }
                        })[0].choice;

                        console.log(playerOne);
                        console.log(playerTwo);
                        console.log(`Leader's choice = ${playerOne}`)
                        const options = { playerOne: playerOne, playerTwo: playerTwo };
                        console.log(options);
                        const round = games[gid].functionality.round(options);
                        console.log('round: ' + round);
                        if (round === 1) {
                            n++;
                            console.log('check point 2')
                            console.log('check point 3')
                            console.log('Player one wins:-' + playerOneScore);
                            console.log('Player one wins:-' + games[gid].functionality.playerOne.wins);
                            if (playerOneScore < games[gid].functionality.playerOne.wins) {
                                console.log('check point 3')
                                playerOneScore = games[gid].functionality.playerOne.wins;
                                socket.emit('round-result', 'victory');
                                console.log('check point 4')
                                socket.to(lobby.roomID).emit('round-result', 'defeat');

                            }
                            else if (playerTwoScore < games[gid].functionality.playerTwo.wins) {
                                playerTwoScore = games[gid].functionality.playerTwo.wins;
                                socket.emit('round-result', 'defeat');
                                socket.to(lobby.roomID).emit('round-result', 'victory');
                            }
                            else {
                                socket.to(lobby.roomID).emit('round-result', 'draw');
                                socket.emit('round-result', 'draw');
                            }
                            games[gid].choices = [];
                        }
                        else if (round === 2) {
                            socket.emit('round-result', 'defeat');
                            socket.to(lobby.roomID).emit('round-result', 'victory');
                            console.log('Second player won');
                            socket.to(lobby.roomID).emit('victory');
                            socket.emit('defeat');
                            playerOneScore = games[gid].functionality.playerOne.wins;
                            playerTwoScore = games[gid].functionality.playerTwo.wins;
                            games[gid].choices = [];
                            n = 3;


                            games = games.filter(g => {
                                if (g.room = lobby.roomID) {

                                }
                                else {
                                    return g;
                                }
                            })

                            setTimeout(() => {
                                socket.emit('normalize');
                                socket.to(lobby.roomID).emit('normalize');
                            }, 5000);
                            console.log('cleared')
                            clearInterval(idInterval);
                        }
                        else if (round === 3) {
                            socket.emit('round-result', 'victory');
                            socket.to(lobby.roomID).emit('round-result', 'defeat');
                            console.log('first player won');
                            socket.to(lobby.roomID).emit('defeat');
                            socket.emit('victory');
                            playerOneScore = games[gid].functionality.playerOne.wins;
                            playerTwoScore = games[gid].functionality.playerTwo.wins;
                            games[gid].choices = [];
                            n = 3;
                            games = games.filter(g => {
                                if (g.room = lobby.roomID) {

                                }
                                else {
                                    return g;
                                }
                            })
                            setTimeout(() => {
                                socket.emit('normalize');
                                socket.to(lobby.roomID).emit('normalize');
                            }, 5000);
                            console.log('cleared')
                            clearInterval(idInterval);
                        }
                    }, 1000);
                }
                // }, 10000)
            }, 5000);
            if (n === 3) {
                games = games.filter(g => {
                    if (g.room = lobby.roomID) {

                    }
                    else {
                        return g;
                    }
                })
                clearInterval(idInterval);
            }


        }
    })
    socket.on('submit-rock', (msg) => {
        console.log(msg);
        games = games.map(g => {
            if (g.room === msg.roomID) {
                let found = false;
                g.choices = g.choices.map(c => {
                    if (c.id === socket.id) {
                        console.log('found');
                        found = true;

                        c.choice = msg.choice;
                        return c;
                    }
                    else {
                        return c;
                    }

                });

                if (!found) {
                    g.choices[g.choices.length] = { id: socket.id, username: socket.username, choice: msg.choice };
                }

                return g;
            }
            else {
                return g;
            }
        })

    })
    socket.on('race', async () => {
        const room = rooms.find(r => {
            if (r.leader = socket.id) {


                return r;
            }


        })


        if (room.length > 0) {

        }
        else {
            let lobby;
            rooms = rooms.map(r => {
                if (r.leader == socket.id) {

                    r.currentlyPlaying = '/race';
                    lobby = r;
                    return r;

                }
                else {
                    return r;
                }
            });
            const race = new typingRace();
            console.log(race);
            await race.getText();
            socket.emit('start-race');
            socket.to(lobby.roomID).emit('start-race');
            console.log('generated race text')
            console.log(race.text);
            const gid = games.length;



            const raceText = race.text;
            //    .slice(1, race.text.length-1)
            games[gid] = { room: lobby.roomID, choices: [], text: '', functionality: race };
            games[gid].text = raceText;
            console.log(raceText);
            setTimeout(() => {
                socket.emit('initialize-race', { text: raceText });
                socket.to(lobby.roomID).emit('initialize-race', { text: raceText });
            }, 5000);



        }
    })
    socket.on('submit-race', msg => {
        console.log('submit race');
        const room = rooms.filter(r => {
            console.log('room filteration'); console.log(r.roomID);
            console.log(msg.room);
            if (r.roomID === msg.room) {
                console.log('room found');

                return r;
            }
        })
        console.log(`room = ${room[0]}`)
        console.log(msg);
        games = games.map(game => {
            console.log(game);
            if (game.room === msg.room) {
                console.log('matched');
                game.choices[game.choices.length] = { id: socket.id, username: socket.username, speed: msg.speed };

                if (game.choices.length === room[0].players.length) {
                    console.log('winner declaration');
                    const winner = game.functionality.winner(game.choices);
                    socket.emit('race-finished', winner);
                    socket.to(msg.room).emit('race-finished', winner);
                    console.log(winner);
                    setTimeout(() => {
                        socket.emit('normalize');
                        socket.to(msg.room).emit('normalize');

                    }, 10000)
                    // socket.to().em
                }
                return game;
            }
            else {
                return game;
            }
        })
    })
});


httpServer.listen(5000, () => {
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