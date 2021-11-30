
import './App.css';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer, NotificationManager } from 'react-notifications';


import React, { useEffect } from 'react';

import { BrowserRouter as Router, Redirect } from 'react-router-dom';
import { Route, Link, Switch, Provider } from "react-router-dom";

import socket from './socket';

import { CountdownCircleTimer } from 'react-countdown-circle-timer'

let roomID;
let choice;




let rockChoice;

let flipChoice;

let normalized = true;
let gotFinalResults = true;
let gotResults = true;
socket.on('submit-rock-immediately', () => {
  const options = { roomID: roomID, choice: rockChoice };
  console.log(options);
  socket.emit(`submit-dice-choice`, options);
  console.log('submitted your choices');
});
function App() {
  const [state, setState] = React.useState({ roomID: '', roomJoined: false, joinRoomID: '', chat: [], chatBox: [], room: {}, game: '/', choice: Math.floor(Math.random() * 5) + 1, voluntarily: false, timer: { enabled: false }, leaderQuit: false, submitted: false, victory: false, defeat: false, winners: [], loosers: [], rockChoice: 'rock', rockRoundResult: false, rockGameResult: false, raceChoice: '', startTime: null, raceSpeed: 0, raceTimer: false, raceFinished: null, raceList: [], raceInitiated: false, flipChoice: 'heads' });



  useEffect(() => {
    socket.on('room-joined', (msg) => {
      setState({ ...state, roomID: msg.msg, roomJoined: true, room: msg.room, leader: false });
    });
 
    socket.on('error', (msg) => {
      NotificationManager.error(<h1 style={{ fontSize: "20px", wordSpacing: "5px", lineHeight: "30px" }}>{msg.error}</h1>);
      console.log(msg.error);
    })
    socket.on('submit-dice-immediately', () => {
      const options = { roomID: roomID, choice: choice };
      console.log(options);
      socket.emit(`submit-dice-choice`, options);
      console.log('submitted your choices')
    });
    socket.on('start-flip', (msg) => {
      gotFinalResults = false;
      gotResults = false;
      normalized = false;
      setState(state => ({ ...state, game: '/flip' }))
    });
    socket.on('ask-choice-dice', () => {
      gotFinalResults = false;
      gotResults = false;
      normalized = false;

      setState(state => ({ ...state, game: '/dice' }));

    });
    socket.on('submit-flip-immediately', () => {
      const options = { roomID: roomID, choice: flipChoice };
      console.log(options);
      socket.emit('submit-flip', options);
      console.log('submitted your choices')

    });
    socket.on('round-result', (msg) => {
      rockChoice = 'rock';
      setState(state => ({ ...state, rockRoundResult: msg, rockChoice: 'rock' }));
    });

    socket.on('race-finished', (msg) => {
      console.log(msg);
      setState(state => ({ ...state, raceFinished: true, raceList: msg }));
    });

    socket.on('message', (msg) => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setState(state => ({ ...state, chat: [...state.chat, { author: msg.username, msg: msg.msg }] }));
    });
    socket.on('player-disconnected', (msg) => {
      setState(state => ({ ...state, room: msg.room, chat: [...state.chat, { author: null, msg: msg.msg }] }));
    });
    socket.on('room-created', (msg) => {
      setState(state => ({ ...state, roomID: msg.msg, roomJoined: true, room: msg.room, leader: true }));
    });
    socket.on('new-connection', (msg) => {

      setState(state => ({ ...state, room: msg.room, chat: [...state.chat, { author: null, msg: msg.msg }] }));


    });

    socket.on('exit-lobby', (msg) => {
      setState(state => ({ roomID: '', roomJoined: false, joinRoomID: '', chat: [], chatBox: [], room: {}, game: '', leaderQuit: true, leader: false }));
    });
    socket.on('start-race', () => {
      gotFinalResults = false;
      gotResults = false;
      normalized = false;
      console.log(state);
      setState(state => ({ ...state, game: '/race' }));
    });
    socket.on('initialize-race', (msg) => {
      gotFinalResults = false;
      gotResults = false;
      normalized = false;
      console.log(state);
      setState(state => ({ ...state, game: '/race', raceText: msg.text, raceTimer: true, startTime: performance.now(), raceInitiated: true }));

    });
    socket.on('normalize', () => {
      gotResults = false;
      gotFinalResults = false;
      setState(state => ({ ...state, game: '/', choice: Math.floor(Math.random() * 5) + 1, voluntarily: false, timer: { enabled: false }, leaderQuit: false, submitted: false, victory: false, defeat: false, winners: [], loosers: [], rockChoice: 'rock', rockRoundResult: false, rockGameResult: false, raceChoice: '', startTime: null, raceSpeed: 0, raceTimer: false, raceFinished: null, raceList: [], raceInitiated: false, flipChoice: 'heads' }));
    });

    socket.on('defeat', () => {
      gotFinalResults = true;
      setState(state => ({ ...state, defeat: true }));
    });
    socket.on('results', (msg) => {
      setState(state => ({ ...state, winners: msg.winners, loosers: msg.loosers }));
    })
    socket.on('victory', () => {
      gotFinalResults = true;
      setState(state => ({ ...state, victory: true }));
    });
  }, []);
  flipChoice = state.flipChoice;

  const messagesEndRef = React.useRef(null);
  const chatRef = React.useRef(null);
  rockChoice = state.rockChoice;
  choice = state.choice;
  roomID = state.roomID;
  const handleJoin = (e) => {
    e.preventDefault(e.target.joinRoom);
    console.log(e);
    socket.emit('join-room', { roomID: state.joinRoomID });
  }
  const handleCreate = (e) => {
    socket.emit('create-room');
  }
  const handleChange = (e) => {
    setState({ ...state, joinRoomID: e.target.value });
  }






  return (
    <div className="App">

      <NotificationContainer />
      <Router >
        <Switch>
          <Route exact path='/'>
            <div className="header">
              <div className="header-header">
                <h1 className='header-header-title'>
                  Games

              </h1>

                <h1 className='header-header-description'>

                  Play Simple Multiplayer Games For Free

              </h1>
              </div>
              <div className="headerBox margin-bottom-large" >
                <label for="username" className="headerBox-label">Set a username</label><input className="margin-bottom-large headerBox-input" autoComplete="off" id='username' disabled={state.roomJoined} onChange={(e) => socket.emit('set-username', { username: e.target.value })} type="text"></input>

                <form onSubmit={handleJoin}>
                  <label for='joinRoom' className="margin-right-extra-large headerBox-label "> ROOM ID</label><input autoComplete="off" className="margin-bottom-medium headerBox-input" id='joinRoom' name='id' onChange={handleChange} type='text' />

                  <br />
                  <button htmlType="submit" className=" button button-primary margin-bottom-small"> Join Room</button>
                  <button htmlType="button" className="button button-secondary margin-bottom-small" onClick={handleCreate}> Create Room</button>

                </form>



              </div>
            </div>
            <div className="lobby">
              {state.roomJoined ? <div><div className="lobby-name margin-top-large"><h1>You are connected to {state.roomID} </h1></div>

                <div>
                  <div className='lobby-chat' ref={chatRef}>
                    {state.chat.map((chat) => {
                      if (chat.author !== null) {


                        return (<p className='lobby-chat-message'>{chat.author + " "}: {chat.msg}</p>)
                      }
                      else {
                        return <p className='lobby-chat-small'> {chat.msg}</p>
                      }
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    // messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
                    // chatRef.current.scrollTo(0,chatRef.offsetHeight);

                    setState({ ...state, chat: [...state.chat, { author: 'You', msg: state.chatBox }], chatBox: '' });
                    socket.emit('message', { msg: state.chatBox, roomID: state.roomID });


                  }}>
                    <input type="text" autoComplete='off' value={state.chatBox} className="lobby-input" name="chat-box" onChange={(e) => {
                      setState({ ...state, chatBox: e.target.value });
                    }} />
                    <button htmlType='submit' className='lobby-button'> Send</button>
                  </form>
                  <br></br>
                  <div className='margin-bottom-large' >
                    <div className='lobby-list '>
                      <h1 className='lobby-list-title'>Players </h1>

                      {state.room.players.map(player => <p className='lobby-list-item'>{player.username}</p>)}

                    </div>
                  </div>
                  {state.leader ? state.game === '/' ? <div className='games'><button className='games-dice  margin-bottom-medium' onClick={() => {
                    if (state.game === '/') {
                      socket.emit('dice')
                    }
                    else {
                      alert('Please wait, you are in midst of a game');
                    }
                  }}>Roll Dice</button>
                    <button className='games-flip margin-bottom-medium' onClick={() =>
                      socket.emit('flip')

                    }>Flip A Coin</button>
                    <button className='games-rock margin-bottom-medium' onClick={() =>

                      socket.emit('rock')

                    }> Rock Paper Scissors</button>
                    <button className='games-race margin-bottom-medium' onClick={() =>

                      socket.emit('race')


                    }> Typing Race</button></div> : null : null}



                </div>

              </div> : null}</div>
            {state.leaderQuit ? <div><br></br><small> You've been removed from the lobby, as the leader has left the lobby.</small></div> : null}

            {state.game === '/dice' ? <div className='game'><h1 className='game-title'>Rolling The Dice!</h1> <label className='game-label margin-bottom-small' for='choice'>Choice your Lucky Number</label><input className='game-input margin-bottom-small' value={state.choice} type='number' min='1' max='6' id='choice' onChange={(e) => {
              if (e.target.value >= 1 && e.target.value <= 6) {
                setState({ ...state, choice: parseInt(e.target.value), voluntarily: true })
              }
              else {
                alert('Please select a number between 1 and 6');
              }


            }}></input><div>{state.choice < 6 ? < button className='game-button' onClick={() => setState({ ...state, choice: parseInt(parseInt(state.choice) + 1) })}> + </button> : null}{state.choice > 1 ? <button className='game-button' onClick={() => setState({ ...state, choice: parseInt(parseInt(state.choice) - 1) })}>-</button> : null} </div>
              <br></br>
              <br>
              </br>
              <br />
              <center>

                {state.victory === true || state.defeat === true ? <div><h1>{state.victory ? 'victory!' : <div>defeat <br></br>  <br /><br></br></div>}</h1></div> : <div><small>Your choice will be sent to the server automatically in </small>
                  <br />
                  <br />
                  <br /><CountdownCircleTimer
                    isPlaying={!state.submitted}
                    duration={10}
                    colors={[
                      ['#004777', 0.33],
                      ['#F7B801', 0.33],
                      ['#A30000', 0.33],
                    ]}
                  >

                    {({ remainingTime }) => {
                      return (
                        <div>
                          <h1>{remainingTime}</h1>
                          <small>seconds</small> </div>)
                    }}
                  </CountdownCircleTimer></div>}
              </center>
              <br></br>

            </div> : state.game === '/rock' ? <div className="game"> <h1 className="game-title">Rock Paper Scissors</h1> <br></br> <small className="game-label margin-bottom-small"> Your current choice is {state.rockChoice} <br /></small> <button className='game-button-trio' name='rock' onClick={(e) => {
              setState({ ...state, rockChoice: 'rock' });
            }}> rock </button> <button className='game-button-trio' onClick={(e) => {
              setState({ ...state, rockChoice: 'paper' });
            }}> paper </button> <button className='game-button-trio' onClick={(e) => {
              setState({ ...state, rockChoice: 'scissors' });
            }}> scissors </button> {!state.victory && !state.defeat ? <div><br ></br><br ></br><br ></br>  <center><CountdownCircleTimer
              // isPlaying={!state.submitted}
              isPlaying={true}
              duration={5}
              colors={[
                ['#004777', 0.33],
                ['#F7B801', 0.33],
                ['#A30000', 0.33],
              ]}
            >

              {({ remainingTime }) => {
                return (
                  <div>
                    <h1>{remainingTime}</h1>
                    <small>seconds</small> </div>)
              }}
            </CountdownCircleTimer></center> <br ></br><br ></br><br ></br></div> : null} {state.rockRoundResult !== false ? <div> {state.rockRoundResult} </div> : null} </div> : state.game === '/race' ? <div className='game'><h1 className='game-title margin-bottom-medium'>Typing Race!</h1>{!state.raceInitiated ? <div><center><CountdownCircleTimer
              isPlaying={!state.submitted}
              duration={5}
              colors={[
                ['#004777', 0.33],
                ['#F7B801', 0.33],
                ['#A30000', 0.33],
              ]}
            >

              {({ remainingTime }) => {
                return (
                  <div>
                    <small>Race starts in </small>
                    <h1>{remainingTime}</h1>
                  </div>)
              }}
            </CountdownCircleTimer></center></div> : <div ><p className='game-label'>You are typing at {state.raceSpeed} WPM</p><div className='game-race'>{state.raceText} </div> <br></br> <input value={state.raceChoice} className='game-input' onChange={(e) => {
              if (e.target.value[state.raceChoice.length] === state.raceText[state.raceChoice.length]) {
                console.log(state.stopwatch);
                // console.log(state)
                const raceSpeed = Math.floor((e.target.value.length / 5) * (60 / ((performance.now() - state.startTime) / 1000)));
                // setSpeed({...state, raceSpeed:raceSpeed, stopwatch:state.stopwatch+5});
                if (e.target.value.length === state.raceText.length) {
                  socket.emit('submit-race', { speed: raceSpeed, room: roomID });
                }
                setState({ ...state, raceChoice: e.target.value, raceSpeed: raceSpeed, stopwatch: state.stopwatch + 5 });

                console.log('rightly typed');
                console.log(state.raceChoice)

              }
              else {
                console.log('wrongly typed');
              }
            }}></input></div>}<br /><br /><br />{state.raceFinished ? <ol> {state.raceList.map(user => {
              return (<li> {user.id} also known as {user.username} had a speed of {user.speed} WPM   </li>)
            })} </ol> : null} <br /><br /><br /></div> : state.game === '/flip' ? <div className='game'><center><h3 className='game-title'>Select your bet!</h3><button type="button" className='game-button' onClick={() => {

              setState({ ...state, flipChoice: 'tails' });


            }}>  Tails</button>

              <button className='game-button' type="button" onClick={() => {
                setState({ ...state, flipChoice: 'heads' });
              }}>  heads</button>
              {state.victory === true || state.defeat === true ? null : <div><small>Your choice will be sent to the server automatically in </small>
                <br />
                <br />
                <br /><CountdownCircleTimer
                  isPlaying={!state.submitted}
                  duration={8}
                  colors={[
                    ['#004777', 0.33],
                    ['#F7B801', 0.33],
                    ['#A30000', 0.33],
                  ]}
                >

                  {({ remainingTime }) => {
                    return (
                      <div>
                        <h1>{remainingTime}</h1>
                        <small>seconds</small> </div>)
                  }}
                </CountdownCircleTimer></div>}


            </center> </div> : null}

            {state.defeat ? <div className="game-final-lost"> you lost the game </div> : state.victory ? <div className="game-final-won">You won the game</div> : null}
          </Route>
          <Route>

            <Redirect to='/'></Redirect>

          </Route>
        </Switch>



      </Router>
    </div>
  );
}

export default App;