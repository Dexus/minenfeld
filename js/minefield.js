function Minefield(cols, rows, size, mines, start, goal) {
    Phaser.Group.call(this, game);
    
    // variables
    this.cols = cols;
    this.rows = rows;
    this.size = size;
    this.mines = mines;
    this.tiles = [];
    
    // build the field
    this.build();
    
    // define start and goal tile
    this.start = this.tiles[start.col][start.row];
    this.start.floor.frame = 89;
    this.goal = this.tiles[goal.col][goal.row];
    this.goal.floor.frame = 89;
    
    // sort the mines, but check if there is a possible way to get to the end
    var possibleWay = [];
    do {
        this.removeMines();
        this.sortMines();
        var graph = new Graph(this.getGraph());
        possibleWay = astar.search(graph, graph.grid[start.col][start.row], graph.grid[goal.col][goal.row]);
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

// adds a child in the minefield
Minefield.prototype.addOnTile = function(child, col, row) {
    child.x = this.size * col + this.size / 2;
    child.y = this.size * row + this.size / 2;
    this.add(child);
}

// builds an array, each item being a tile object
Minefield.prototype.build = function() {
    for (var col = 0; col < this.cols; col++) {
        this.tiles[col] = [];
        for (var row = 0; row < this.rows; row++) {    
            var tile = new Tile(col, row);
            tile.size = this.size;
            this.tiles[col][row] = tile;
            this.addOnTile(this.tiles[col][row], col, row);
        }
    }
}

// sort the mines in the minefield
Minefield.prototype.sortMines = function() {
    // get available tiles
    var available = [];
    for (var col = 0; col < this.cols; col++) {
        for (var row = 0; row < this.rows; row++) {
            if (!this.start.isNeighbor(col, row) && !this.goal.isNeighbor(col, row)) {
                available.push(this.tiles[col][row]);
            }
        }
    }
    
    // shuffle
    for (var i = available.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = available[i];
        available[i] = available[j];
        available[j] = temp;
    }
    
    // set mine
    for (var i = 0; i < this.mines; i++) {
        available[i].mine = true;
    }
}

// removes all mines from the minefield
Minefield.prototype.removeMines = function() {
    for (var col = 0; col < this.cols; col++) {
        for (var row = 0; row < this.rows; row++) {
            this.tiles[col][row].mine = false;
        }
    }
}

// returns true if column and row are inside of minefield bounds
Minefield.prototype.inBounds = function(col, row) {
    return row >= 0 && row < this.rows && col >=0 && col < this.cols;
}

// look the adjacent tiles and returns the amount of mines around
Minefield.prototype.minesAround = function(col, row, neighbors) {
    // get neighbours
    if (neighbors === 'diagonal') {
        neighbors = this.tiles[col][row].diagonal;
    } else if (neighbors === 'straight') {
        neighbors = this.tiles[col][row].straight;
    } else {
        neighbors = this.tiles[col][row].neighbors;
    }    
    
    // count
    var total = 0
    for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        if (this.inBounds(neighbor.col, neighbor.row) && this.tiles[neighbor.col][neighbor.row].mine) {
            total += 1
        }
    }

    return total;
}

// returns the amount of diagonal mines
Minefield.prototype.minesDiagonal = function(col, row) {
    return this.minesAround(col, row, 'diagonal');
}

// returns the amount of straight mines
Minefield.prototype.minesStraight = function(col, row) {
    return this.minesAround(col, row, 'straight');
}

// take some action in a tile
Minefield.prototype.takeTurn = function(col, row, action='g') {
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
        this.blowUp();
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
                setTimeout(this.takeTurn.bind(this), 50 * i, neighbor.col, neighbor.row);
            }
        }
    }
}

// reveals everything
Minefield.prototype.blowUp = function() {
    this.exploded = true;
    for (var col = 0; col < this.cols; col++) {
        for (var row = 0; row < this.rows; row++) {
            this.tiles[col][row].show();
        }
    }
}

// convert the minefield to a bidimisional array with 0 ('wall') or 1 ('walkable')
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