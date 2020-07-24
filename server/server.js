class Server {
		constructor() {
		this.express = require('express');
		this.http = require('http');
		let path = require('path');
		this.socketIO = require('socket.io');

		this.app = this.express();
		this.server = this.http.Server(this.app);
		this.io = this.socketIO(this.server);
		this.app.set('port', 5000);

		this.app.use("/client/game.js",this.express.static(path.join(__dirname, '..','client/game.js')));
	
		this.app.get('/', function(request, response) {
			response.sendFile(path.join(__dirname, '..','client/index.html'));
		});

		this.server.listen(5000, function() {
			console.log('Starting Server on port 5000');
		});

		this.players = {};
		this.maxPlayers = 2;
	}

	connectToSocket() {
		this.io.on("connection", function(socket) {
			socket.on('new player', function() {
				console.log(socket.id);
					this.players[socket.id] = {
						x: 300,
						y: 300
					};
				}.bind(this)
			);	
			
			socket.on('movement', function(data) {
				var player = this.players[socket.id] || {};
				if (data.left) {
					player.x -= 5;
				}
				if (data.up) {
					player.y -= 5;
				}
				if (data.right) {
					player.x += 5;
				}
				if (data.down) {
					player.y += 5;
				}
			 }.bind(this));
		}.bind(this));

		setInterval(() => {this.io.sockets.emit('state', this.players)},1000/60);
	}
}

const server = new Server();
server.connectToSocket();