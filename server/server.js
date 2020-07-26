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

        this.app.use("/client/game.js", this.express.static(path.join(__dirname, '..', 'client/game.js')));
        //This path has to be included 
        this.app.use("/sprites", this.express.static("../sprites"));

        this.app.get('/', function(request, response) {
            response.sendFile(path.join(__dirname, '..', 'client/index.html'));
        });

        this.server.listen(5000, function() {
            console.log('Starting Server on port 5000');
        });

        this.players = {};
        this.maxPlayers = 2;
    }

    connectToSocket() {
        let $this = this;
        this.io.on("connection", function(socket) {
            //Init players on new connection
            if (!$this.players[socket.id]) {
                $this.players[socket.id] = {};
            }
            //Check on new player exceeding max has to go here
            socket.on('new player', function(data) {
                var player = $this.players[socket.id];
                player.type = data.type;
                player.x = 300;
                player.y = 300;
                //Only send accepte if added 
                socket.emit("state", {
                    "player": "accepted",
                    "type": data.type
                });
                //Send state information to inform all participants new player added
                $this.io.sockets.emit('state', $this.players);

            }.bind(this));
            socket.on('movement', function(data) {

                var player = this.players[socket.id];
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
                //Send state information to inform all participants position has changed
                $this.io.sockets.emit('state', $this.players);
            }.bind(this));
        }.bind(this));
        //Removed to prevent unnecessary network traffic
        //setInterval(() => {this.io.sockets.emit('state', this.players)},1000/60);
    }
}

const server = new Server();
server.connectToSocket();