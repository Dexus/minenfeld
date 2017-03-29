var game;

// main game options
var gameOptions = {
    gameWidth: 1000,
    gameHeight: 800,
    tileSize: 50
};

// current level
var levelNumber = 0;

// when the window finishes loading...
window.onload = function () {
    game = new Phaser.Game(gameOptions.gameWidth, gameOptions.gameHeight);
    game.state.add('TheGame', TheGame);
    game.state.start('TheGame');
};

var TheGame = function () {};

TheGame.prototype = {
    
    rows: 15,
    cols: 11,

    // preloading assets
    preload: function () {
        game.load.spritesheet('tiles', 'assets/images/tilesheet.png', 128, 128);
    },

    // when the game starts
    create: function () {
        // set game scale
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        
        // create level
        this.createLevel();
        
        // define inputs (touch and keyboard)
        game.input.onDown.add(this.beginSwipe, this);
        var keyUp = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        keyUp.onDown.add(this.moveUp, this);
        var keyDown = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        keyDown.onDown.add(this.moveDown, this);
        var keyLeft = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        keyLeft.onDown.add(this.moveLeft, this);
        var keyRight = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        keyRight.onDown.add(this.moveRight, this);
    },

    // function to create a level
    createLevel: function () {

        var minefield = new Minefield(this.cols, this.rows, 30);
        minefield.x = (game.width - gameOptions.tileSize * this.cols) / 2;
        minefield.y = (game.height -  gameOptions.tileSize * this.rows) / 2;
        //minefield.takeTurn(0,0);
        
        // add player
        /*
        this.playerPosition = new Phaser.Point(0, 5);
        var tilePos = this.getTilePosition(this.playerPosition.x, this.playerPosition.y);
        this.player = game.add.sprite(tilePos.x, tilePos.y, 'tiles');
        this.player.width = gameOptions.tileSize;
        this.player.height = gameOptions.tileSize;
        this.player.frame = 65;
        this.player.anchor.set(0.5);
        this.tileGroup.add(this.player);
        */
	},
    
    // return tile position
    getTilePosition: function (row, col) {
        return {
            x: col * gameOptions.tileSize + gameOptions.tileSize / 2,
            y: row * gameOptions.tileSize + gameOptions.tileSize / 2
        };
    },
    
    // return a tile
    getTile: function (row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.tilesArray[row][col];
    },

    // start checking for swipes
    beginSwipe: function (event) {
        game.input.onDown.remove(this.beginSwipe, this);
        game.input.onUp.add(this.endSwipe, this);
    },
     
    // end checking for swipes
    endSwipe: function (event) {
        game.input.onUp.remove(this.endSwipe, this);
        var swipeTime = event.timeUp - event.timeDown;
        var swipeDistance = Phaser.Point.subtract(event.position, event.positionDown);
        var swipeMagnitude = swipeDistance.getMagnitude();
        var swipeNormal = Phaser.Point.normalize(swipeDistance);
        if (swipeMagnitude > 20 && swipeTime < 1000 && (Math.abs(swipeNormal.x) > 0.8 || Math.abs(swipeNormal.y) > 0.8)) {
            if (swipeNormal.y < -0.8) {
                this.moveUp();
            } else if (swipeNormal.y > 0.8) {
                this.moveDown();
            } else if (swipeNormal.x < -0.8) {
                this.moveLeft();
            } else if (swipeNormal.x > 0.8) {
                this.moveRight();
            }
        } else {
            game.input.onDown.add(this.beginSwipe, this);
        }
    },
    
    // move player to up
    moveUp: function () {
        this.handleMovement(new Phaser.Point(0, -1));
        this.player.frame = 68;
    },
    
    // move player to down
    moveDown: function () {
        this.handleMovement(new Phaser.Point(0, 1));
        this.player.frame = 65;
    },
    
    // move player to left
    moveLeft: function () {
        this.handleMovement(new Phaser.Point(-1, 0));
        this.player.frame = 94;
    },
    
    // move player to right
    moveRight: function () {
        this.handleMovement(new Phaser.Point(1, 0));
        this.player.frame = 91;
    },

    // handling swipes
    handleMovement: function (position) {
    },

    // routine to start when the level is failed
    levelRestart: function () { 
        var tween = game.add.tween(this.player).to({
            alpha: 0,
            width: gameOptions.tileSize / 4,
            height: gameOptions.tileSize / 4
        }, 500, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function() {
            game.state.start('TheGame');
        }, this);
    }
}