function Minefield(cols, rows, mines) {
    Phaser.Group.call(this, game);
    
    this.cols = cols;
    this.rows = rows;
    this.mines = mines;
    this.tiles = [];
    
    // build the field
    this.build();
    
    // sort the mines, but check if there is a possible way to get to the end
    var possibleWay = [];
    do {
        this.removeMines();
        this.sortMines();
        var graph = new Graph(this.getGraph());
        possibleWay = astar.search(graph, graph.grid[0][0], graph.grid[cols-1][rows-1]);
    }
    while (possibleWay.length == 0);
    
    /*
    console.log(possibleWay);
    for (var i = 0; i < possibleWay.length; i++) {
        var node = possibleWay[i];
        setTimeout(function(floor){floor.tint = 0xffffff}, 50*i, this.tiles[node.x][node.y].floor);
    }
    */
}
Minefield.prototype = Object.create(Phaser.Group.prototype);

Minefield.prototype.addOnTile = function(child, col, row) {
    child.x = 50 * col + 25;
    child.y = 50 * row + 25;
    this.add(child);
}

Minefield.prototype.getTile = function(col, row) {
    return this.tiles[col][row];
}

Minefield.prototype.build = function() {
    // builds an array, each item being a tile object
    for (var col = 0; col < this.cols; col++) {
        this.tiles[col] = [];
        for (var row = 0; row < this.rows; row++) {    
            var tile = new Tile(col, row);
            tile.size = 50;
            this.tiles[col][row] = tile;
            this.addOnTile(this.tiles[col][row], col, row);
        }
    }
}

Minefield.prototype.removeMines = function() {
    for (var col = 0; col < this.cols; col++) {
        for (var row = 0; row < this.rows; row++) {
            this.tiles[col][row].mine = false;
        }
    }
}

Minefield.prototype.sortMines = function() {
    // sort the mines
    var col, row;
    for (var i = 0; i < this.mines; i++) {
        do {
            col = Math.floor(Math.random() * this.cols);
            row = Math.floor(Math.random() * this.rows);
        }
        while (this.tiles[col][row].mine || (col == 0 && row == 0) || (col == this.cols-1 && row == this.rows-1));
        this.tiles[col][row].mine = true;
    }
    /*
    this.tiles[2][1].mine = true;
    this.tiles[2][1].floor.tint = 0xff0000;
    
    this.tiles[1][3].mine = true;
    this.tiles[1][3].floor.tint = 0xff0000;
    
    this.tiles[3][3].mine = true;
    this.tiles[3][3].floor.tint = 0xff0000;
    
    this.tiles[3][4].mine = true;
    this.tiles[3][4].floor.tint = 0xff0000;
    
    this.tiles[10][4].mine = true;
    this.tiles[10][4].floor.tint = 0xff0000;
    
    this.tiles[8][5].mine = true;
    this.tiles[8][5].floor.tint = 0xff0000;
    */
}

Minefield.prototype.inBounds = function(col, row) {
    // true if column and row are inside of minefield bounds
    return row >= 0 && row < this.rows && col >=0 && col < this.cols;
}
    
Minefield.prototype.minesAround = function(col, row) {
    // look the adjacent tiles and returns the amount of mines around
    var total = 0
    var tile = this.tiles[col][row]
    for (var i = 0; i < tile.neighbors.length; i++) {
        var neighbor = tile.neighbors[i];
        if (this.inBounds(neighbor.col, neighbor.row) && this.tiles[neighbor.col][neighbor.row].mine) {
            total += 1
        }
    }

    return total;
}

Minefield.prototype.takeTurn = function(col, row, action='g') {
    // take some action in a tile
    if (!this.inBounds(col, row)) return;
    
    // get the tile
    var tile = this.tiles[col][row];
    
    // if action is flag, set tile as flagged
    if (action == 'f') {
        tile.flag = true;
        return;
    }

    // if the tile has a mine, explode
    if (tile.mine) {
        this.exploded = true;
        return;
    }

    // if the tile already has a flag, get out
    if (tile.flag) return;

    // first time in this tile, see tiles around
    if (tile.adjacents == -1) {
        tile.adjacents = this.minesAround(col, row);

        if (tile.adjacents == 0) {
            for (var i = 0; i < tile.neighbors.length; i++) {
                var neighbor = tile.neighbors[i];
                //this.takeTurn(neighbor.col, neighbor.row, 'g');
                setTimeout(this.takeTurn.bind(this), 100, neighbor.col, neighbor.row);
            }
        }
    }
}

Minefield.prototype.getGraph = function() {
    var graph = [];
    for (var col = 0; col < this.cols; col++) {
        graph[col] = [];
        for (var row = 0; row < this.rows; row++) {
            graph[col][row] = this.tiles[col][row].mine ? 0 : 1;
        }
    }
    return graph;
}