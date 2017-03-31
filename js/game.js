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

        // start and end point
        var pStart = {col:0, row:0};
        var pEnd = {col:this.cols-1, row:this.rows-1};
        
        // build minefield
        this.minefield = new Minefield(this.cols, this.rows, 50, pStart, pEnd);
        this.minefield.x = (game.width - gameOptions.tileSize * this.cols) / 2;
        this.minefield.y = (game.height -  gameOptions.tileSize * this.rows) / 2;
        
        // add player
        this.player = game.add.sprite(0, 0, 'tiles');
        this.player.col = pStart.col;
        this.player.row = pStart.row;
        this.player.width = gameOptions.tileSize;
        this.player.height = gameOptions.tileSize;
        this.player.frame = 65;
        this.player.anchor.set(0.5);
        this.minefield.addOnTile(this.player, this.player.col, this.player.row);
        
        // take the first turn
        this.minefield.takeTurn(this.player.col, this.player.row);
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
        if (this.player.row > 0) {
            this.handleMovement(new Phaser.Point(0, -1));
        }
        this.player.frame = 68;
    },
    
    // move player to down
    moveDown: function () {
        if (this.player.row < this.rows - 1) {
            this.handleMovement(new Phaser.Point(0, 1));
        }
        this.player.frame = 65;
    },
    
    // move player to left
    moveLeft: function () {
        if (this.player.col > 0) {
            this.handleMovement(new Phaser.Point(-1, 0));
        }
        this.player.frame = 94;
    },
    
    // move player to right
    moveRight: function () {
        if (this.player.col < this.cols - 1) {
            this.handleMovement(new Phaser.Point(1, 0));
        }
        this.player.frame = 91;
    },

    // handling swipes
    handleMovement: function (position) {
        // update position
        this.player.col += position.x;
        this.player.row += position.y;
        
        // take an action in current tile
        this.minefield.takeTurn(this.player.col,this.player.row);
        if (this.minefield.exploded) this.levelRestart()
        
        // move player
        var playerTween = game.add.tween(this.player).to({
            x: this.player.col * gameOptions.tileSize + gameOptions.tileSize / 2,
            y: this.player.row * gameOptions.tileSize + gameOptions.tileSize / 2
        }, 100, Phaser.Easing.Linear.None, true);
        
        playerTween.onComplete.add(function(){
            game.input.onDown.add(this.beginSwipe, this);
        }, this);
    },

    // routine to start when the level is failed
    levelRestart: function () { 
        var tween = game.add.tween(this.player).to({
            alpha: 0,
            width: gameOptions.tileSize * 2,
            height: gameOptions.tileSize * 2
        }, 1000, Phaser.Easing.Linear.None, true);
        tween.onComplete.add(function() {
            game.state.start('TheGame');
        }, this);
    }
}