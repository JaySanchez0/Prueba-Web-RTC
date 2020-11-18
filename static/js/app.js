var io = io();
io.emit("join",1);
var emmiter = false;
var configuration = {
    configuration:{
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    },
    iceServers : [ {
        "url" : "stun:stun.l.google.com:19302"
    } ]
};
const peerConnection = new RTCPeerConnection(configuration,{
    optional : [ {
        RtpDataChannels : true
    } ]
});
var dataChannel = peerConnection.createDataChannel("dataChannel", { reliable: true });


dataChannel.onerror = function(error) {
    console.log("Error:", error);
};
dataChannel.onclose = function() {
    console.log("Data channel is closed");
};

dataChannel.onmessage=function(msg){
    console.log(msg);
}

async function app(){
    console.log("Entro app");
    emmiter = true;
    const offer = await peerConnection.createOffer();
    send({
        event : "offer",
        data : offer
    });
    peerConnection.setLocalDescription(offer);
}

function send(msg){
    io.emit("message",msg);
}

peerConnection.onicecandidate = function(event) {
    console.log("Candidate");
    if (event.candidate) {
        send({
            event : "candidate",
            data : event.candidate
        });
    }
};

io.on("message",async (msg)=>{
    console.log(msg);
    if(msg.event==="offer"){
        peerConnection.setRemoteDescription(new RTCSessionDescription(msg.data));
        peerConnection.createAnswer(function(answer) {
            peerConnection.setLocalDescription(answer);
            send({
                event:"answer",
                 data:answer
            });
        }, function(error) {
        });
    }
    else if (msg.event==="candidate") {
        console.log("Entro candidate");
        peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
    }else if(msg.event==="answer"){
        console.log("Entro answer");
        peerConnection.setRemoteDescription(new RTCSessionDescription(msg.data));
    }
});

peerConnection.addEventListener('connectionstatechange', event => {
    if (peerConnection.connectionState === 'connected' && emmiter) {
        console.log("Loading");
        navigator.mediaDevices.getDisplayMedia().then(localStream=>{
            localStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, localStream);
              });
        });
    }
});


peerConnection.ontrack = (e)=>{
    const remoteVideo = document.querySelector('#video');
    remoteVideo.srcObject = e.streams[0];
};
