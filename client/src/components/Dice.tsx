import React, { Component } from 'react';
import io  from 'socket.io-client';
// const arguments = 
const socket:any = io('http://localhost:5000/dice',{ transports : ['websocket'] });
export default class Dice extends Component<any>{
    
    constructor(props:any){
        super(props);
        socket.emit('join-room',{roomID: this.props.state.roomID});
    }
render() {
  
    socket.on('room-joined', (msg:any) => {
        // setState({...state, roomID:msg.msg, roomJoined:true});  
        console.log(msg.users);
        console.log(msg.msg);  
      })
    console.log(this.props.socket.id);
    return(<h1>Dice</h1>)
}
  



}