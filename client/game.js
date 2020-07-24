class Client{
	constructor() {
		this.socket = io();
		this.canvas = document.getElementById('canvas');
		this.canvas.width = 1280;
		this.canvas.height = 700;
		this.context = this.canvas.getContext('2d');
	}
	
	keyboard() {
		var movement = {
			up: false,
			down: false,
			left: false,
			right: false
		}

		document.addEventListener('keydown', function(event) {
			switch (event.keyCode) {
				case 65: // A
					movement.left = true;
					break;
				case 87: // W
					movement.up = true;
					break;
				case 68: // D
					movement.right = true;
					break;
				case 83: // S
					movement.down = true;
					break;
			}
		});

		document.addEventListener('keyup', function(event) {
			switch (event.keyCode) {
				case 65: // A
					movement.left = false;
					break;
				case 87: // W
					movement.up = false;
					break;
				case 68: // D
					movement.right = false;
					break;
				case 83: // S
					movement.down = false;
					break;
			}
		});

		this.socket.emit('new player');
		setInterval(() => this.socket.emit('movement', movement), 1000 / 60);
	}

	playerdraw() {
		
		this.socket.on('state', function(players) {
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.fillStyle = 'green';
			for (var id in players) {
				var player = players[id];
				this.context.beginPath();
				this.context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
				this.context.fill();
			}
		}.bind(this));
	}
}
const client = new Client();
client.keyboard();
client.playerdraw();

class AssetLoader {
	loadAsset(name, url) {
	  return new Promise((resolve, reject) => {
		const image = new Image();
		image.src = url;
		image.addEventListener('load', function() {
		  return resolve({ name, image: this });
		});
	  });
	}
  
	loadAssets(assetsToLoad) {
	  return Promise.all(
		assetsToLoad.map(asset => this.loadAsset(asset.name, asset.url))
	  )
		.then(assets =>
		  assets.reduceRight(
			(acc, elem) => ({ ...acc, [elem.name]: elem.image }),
			{}
		  )
		)
		.catch(error => {
		  throw new Error('Not all assets could be loaded.');
		});
	}
  }

  class Gamestate{
	constructor(){
	  new AssetLoader()
	  .loadAssets([	{name: 'map', url: 'map.png'}])
	  .then(assets => {
		  this.test = new Test(assets);
	  })
	}
  }
  
  
  
  class Test {
	  constructor(assets) {
	  this.img = assets;
	  //this.click();
	  this.drawMap();
	  }
	
	drawMap() {
		context.drawImage(this.img.map, 0,0);
	}
  }
  
  const gamestate = new Gamestate();