/*服务器端程序*/

//通过express托管网站
var express = require('express');
var io = require('socket.io');

var app = express();

app.use(express.static(__dirname));

var server = app.listen(8888);

var ws = io.listen(server);


//添加服务器连接时间，当客户端连接成功之后，发公告告诉所有在线用户，并且当用户发送消息
//时，发广播通知其它用户

ws.on("connection", function (client) {
	console.log('\033[96msomeone is connect\033[39m \n');
	client.on('join', function (msg) {
		//检查是否重复
		if (checkNickname(msg)) {
			client.emit('nickname', '昵称有重复');
		} else {
			client.nickname = msg;
			ws.socket.emit('announcement', '系统', msg + '加入聊天室');

		}
	});
});

//监听发送消息
client.on('send.message', function (msg) {
	client.broadcast.emit('send.message', client.nickname, msg);
});

//断开连接时，通知其它用户
client.on('disconncet', function () {
	if(client.nickname){
		client.broadcast.emit('send.message', '系统', client.nickname + '离开聊天室!');
	}
});


//检查昵称是否重复
var checkNickname = function (name) {
	for (var k in ws.sockets.sockets) {
		if(ws.sockets.sockets.hasOwnProperty(k)){
			if(ws.sockets.sockets[k] && ws.sockets.sockets[k].nickname == name)
				return true;
		}
	}
	return false;
};