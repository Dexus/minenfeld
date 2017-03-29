function Tile(col, row) {
    Phaser.Group.call(this, game);
    
    this.col = col;
    this.row = row;
    
    this._mine = false;
    this._adjacents = -1;
    this.neighbors = [
        {'col':col-1, 'row':row-1}, {'col':col-1, 'row':row}, {'col':col-1, 'row':row+1},
        {'col':col+1, 'row':row-1}, {'col':col+1, 'row':row}, {'col':col+1, 'row':row+1},
        {'col':col,   'row':row-1}, {'col':col,   'row':row+1}
    ];
    
    // add the floor sprite
    this.floor = new Phaser.Sprite(game, 0, 0, 'tiles');
    this.floor.frame = 102;
    this.floor.anchor.set(0.5, 0.5);
    this.floor.tint = 0xaaaaaa;
    this.add(this.floor);
    
    // add the label
    var style = { font: 'bold 48px Arial', fill: '#000', align: 'center' };
    this.label = new Phaser.Text(game, 0, 0, '0', style);
    this.label.anchor.set(0.5, 0.5);
    this.label.visible = false;
    this.add(this.label)
}
Tile.prototype = Object.create(Phaser.Group.prototype);

Object.defineProperty(Tile.prototype, 'size', {
    set: function(value) {
        this.width = value;
        this.height = value;
    }
});

Object.defineProperty(Tile.prototype, 'mine', {
    get: function() { return this._mine; },
    set: function(value) {
        this._mine = value;
        this.floor.tint = value ? 0xff0000 : 0xaaaaaa;
    }
});

Object.defineProperty(Tile.prototype, 'adjacents', {
    get: function() { return this._adjacents; },
    set: function(value) {
        this._adjacents = value;
        this.label.text = value;
        if (value > -1) {
            this.label.visible = true;
            this.floor.tint = 0xffffff;
        }
    }
});