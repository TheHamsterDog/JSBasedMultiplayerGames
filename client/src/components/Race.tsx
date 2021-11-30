import React, { Component } from 'react';
import io from 'socket.io-client';
const socket:any = io('http://localhost:5000/race',{ transports : ['websocket'] });
export default class Dice extends Component<any>{


render() {
    socket.emit('join-room',{roomID: this.props.state.roomID});
    console.log(this.props);
    return(<h1>Dice</h1>)
}
  



}