var express = require("express");
var http = require("http");
var socketIo = require("socket.io");

var expressServer = express();

expressServer.use(express.static("static"));

var httpServer = http.createServer(expressServer);

var socket = socketIo(httpServer);


socket.on("connection",(client)=>{
    console.log("Connected");
    var actual = -1;
    client.on("join",(room)=>{
        console.log("Room "+room);
        client.join(room);
        actual = room;
    });
    client.on("message",(msg)=>{
        console.log("OnMenssage");
        console.log(msg);
        client.broadcast.to(actual).emit("message",msg);
        //socket.to(actual).emit("message",msg);
    });
});

var port = process.env.PORT || 80;

httpServer.listen(port,"0.0.0.0",()=>console.log("Listen"));