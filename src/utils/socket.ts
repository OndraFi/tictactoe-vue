import {io, Socket} from "socket.io-client";

let socket : Socket | null = null;

function getSocket(){
    if(socket == null){
        socket = io('http://localhost:9000');
        // socket = io('http://tictactoe-backend.adaptable.app:80');
    }
    return socket;
}

export { getSocket, }


