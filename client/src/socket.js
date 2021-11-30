import io from 'socket.io-client';

export default  io('http://192.168.1.6:5000',{ transport : ['websocket'] });
