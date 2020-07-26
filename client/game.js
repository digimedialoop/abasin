const MD_SELECTION = 0;
const MD_PLAY = 1;
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 80;
const TPE_FIGHTER = 0;
const TPE_ATHLETE= 1;
const SA_FIGHTER_LEFT=120;
const SA_ROW_TOP=430;
const SA_ATHLETE_LEFT=700;
const ICON_SIZE=180;

/*Class for reosurce loading*/
class AssetLoader {
	
	/*Load a single resource*/
    loadAsset(name, url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.addEventListener('load', function() {
                return resolve({
                    name,
                    image: this
                });
            });
        });
    }

	/*Load a set of assets*/
    loadAssets(assetsToLoad) {
        return Promise.all(
                assetsToLoad.map(asset => this.loadAsset(asset.name, asset.url))
            )
            .then(assets =>
                assets.reduceRight(
                    (acc, elem) => ({
                        ...acc,
                        [elem.name]: elem.image
                    }), {}
                )
            )
            .catch(error => {
                throw new Error('Not all assets could be loaded.');
            });
    }
}

/*Main class for client of the game*/
class Client {




    constructor() {
		
		//Setup communication interface
        this.socket = io();
		
		//Drawing context initialisation
        this.canvas = document.getElementById('canvas');
        this.canvas.width = 1280;
        this.canvas.height = 700;
        this.context = this.canvas.getContext('2d');
		
		//Set closure for inner class usage
        let $this = this;
		
		//Define resused resources
        this.athlete = null;
        this.fighter = null;
        this.map = null;
		
		
        new AssetLoader()
            .loadAssets([{
                name: 'homescreen',
                url: '/sprites/homescreen.png'
            }, {
                name: 'map',
                url: '/sprites/map.png'
            }, {
                name: 'athlete',
                url: '/sprites/athlete.png'
            }, {
                name: 'fighter',
                url: '/sprites/fighter.png'
            }])
            .then(assets => {
                $this.context.drawImage(assets.homescreen, 0, 0);
                $this.map = assets.map;
                $this.athlete = assets.athlete;
                $this.fighter = assets.fighter;

            });
			
		//Initial mode is player selection
        this.mode = MD_SELECTION;
		
		//Event handler for slection screen
        document.addEventListener("click", function(event) {
			//Check if in selction mode
			if($this.mode==MD_SELECTION){
				//Check click within icon are --> Caution screen resize causes invalid location. Refactoring should split screen and icons 
				if ((event.offsetX) > SA_FIGHTER_LEFT && (event.offsetX) < SA_FIGHTER_LEFT+ICON_SIZE && 
				(event.offsetY) > SA_ROW_TOP && (event.offsetY) < SA_ROW_TOP+ICON_SIZE) {
					$this.socket.emit("new player", {
						type: TPE_FIGHTER
					});
				} else
				if ((event.offsetX) > SA_ATHLETE_LEFT && (event.offsetX) < SA_ATHLETE_LEFT+ICON_SIZE && 
				(event.offsetY) > SA_ROW_TOP && (event.offsetY) < SA_ROW_TOP+ICON_SIZE) {
					$this.socket.emit("new player", {
						type: TPE_ATHLETE
					});
				}
            }
        });
		//Server sent state change
		//Caution: Check maximum number of players!
        this.socket.on('state', function(state) {
			//Extend protocol for error messages aso
            if (state.player && state.player == "accepted") {

                $this.context.drawImage($this.map, 0, 0);
                $this.mode = MD_PLAY;
			
            } else {
                if ($this.mode == MD_PLAY) {
                    $this.context.drawImage($this.map, 0, 0);
					//Paint new positions of players
                    Object.keys(state).forEach(function(key) {
                        let player = state[key];
                        if (typeof(player.x) != "undefined" && typeof(player.y) != "undefined" && typeof(player.type) != "undefined") {
                            switch (player.type) {
                                case 0:
                                    $this.context.drawImage($this.fighter, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
                                    break;
                                case 1:
                                    $this.context.drawImage($this.athlete, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
                                    break;

                            }

                        }
                    });
                }

            }
        }.bind(this));
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
		//This should be changed for performance optimisation 
		//Only transfer data if anything changed
        setInterval(() =>
            this.socket.emit('movement', movement), 1000 / 60);
    }


}




const client = new Client();
client.keyboard();
