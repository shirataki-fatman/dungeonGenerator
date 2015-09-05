/*
このコードは、以下のURLのコードをjavascriptで置き換えたものです
http://www.roguebasin.com/index.php?title=C%2B%2B_Example_of_Dungeon-Building_Algorithm
*/

var Tile = {
	Unused: ".",
	Floor: "_",
	Corridor: ",",
	Wall: "#",
	ClosedDoor: "+",
	OpenDoor: "-",
	UpStairs: "<",
	DownStairs: ">"
};

var Direction = {
	North: 0,
	South: 1,
	West: 2,
	East: 3,
	length: 4
};

function randomInt(min, max) {
	if (max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	else {
		return Math.floor(Math.random() * min);
	}
}
function randomBool(probablity) {
	probablity = probablity || 0.5;
	return mctad.bernoulli(0.5).generate(1)[0];
}

function getRandomDirection() {
	var dirs = [Direction.North, Direction.South, Direction.West, Direction.East];
	var random = randomInt(dirs.length);
	return dirs[random];
}

function Dungeon(width, height) {
	this._width = width;
	this._height = height;

	var tile = [];
	var tileNum = width * height;
	for (var i = 0; i < tileNum; i++) {
		tile[i] = Tile.Unused;
	}
	this._tile = tile;
	this._rooms = [];
	this._exits = [];
}

// public
Dungeon.prototype.generate = function(maxFeatures) {
	if (!this._makeRoom(this._width / 2, this._height / 2, getRandomDirection())) {
		console.log("unable to place the first room");
	}

	for (var i = 0; i < maxFeatures; i++) {
		if (!this._createFeature()) {
			console.log("unable to place more features (placed " + i + "\").");
			break;
		}
	}

	return this;
};
Dungeon.prototype.getTile = function(x, y) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
		return Tile.Unused;
	}

	return this._tile[x + y * this._width];
};
Dungeon.prototype.getTiles = function() {
	var result = [];
	for (var y = 0; y < this._height; y++) {
		var row = [];
		for (var x = 0; x < this._width; x++) {
			row.push(this.getTile(x, y));
		}
		result.push(row);
	}

	return result;
}
Dungeon.prototype.toString = function() {
	var result = "";
	for (var y = 0; y < this._height; y++) {
		var row = "";
		for (var x = 0; x < this._width; x++) {
			row += this.getTile(x, y);
		}
		console.log(row);
		result += row + "\n";
	}

	return result;
};

// private
Dungeon.prototype._setTile = function(x, y, tile) {
	if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
		console.error("over area");
		return;
	}

	this._tile[x + y * this._width] = tile;
}
Dungeon.prototype._createFeature = function(x, y, dir) {
	if (typeof x === "number" && typeof y === "number" && typeof dir === "number") {
		// const
		var roomChance = 50;

		var dx = 0, dy = 0;
		if (dir === Direction.North) {
			dy = 1;
		}
		else if (dir === Direction.South) {
			dy = -1;
		}
		else if (dir === Direction.West) {
			dx = 1;
		}
		else if (dir === Direction.East) {
			dx = -1;
		}
		else {
			console.error("undefined dir", dir);
		}

		if (this.getTile(x + dx, y + dy) !== Tile.Floor && this.getTile(x + dx, y + dy) !== Tile.Corridor) {
			return false;
		}

		if (randomInt(100) < roomChance) {
			if (this._makeRoom(x, y, dir)) {
				this._setTile(x, y, Tile.ClosedDoor);
				return true;
			}
		}
		else {
			if (this._makeCorridor(x, y, dir)) {
				if (this.getTile(x + dx, y + dy) === Tile.Floor) {
					this._setTile(x, y, Tile.ClosedDoor);
				}
				else {
					this._setTile(x, y, Tile.Corridor);
				}

				return true;
			}
		}

		return false;
	}
	else {
		for (var i = 0; i < 1000; i++) {
			if (this._exits.length === 0) {
				break;
			}

			var r = randomInt(this._exits.length);
			var x = randomInt(this._exits[r].x, this._exits[r].x + this._exits[r].width - 1);
			var y = randomInt(this._exits[r].y, this._exits[r].y + this._exits[r].height - 1);

			for (var j = 0; j < Direction.length; j++) {
				if (this._createFeature(x, y, j)) {
					this._exits.splice(r, 1);
					return true;
				}
			}
		}

		return false;
	}
}
Dungeon.prototype._makeRoom = function(x, y, dir, firstRoom) {
	firstRoom = firstRoom || false;

	// const
	var minRoomSize = 3;
	var maxRoomSize = 6;

	var room = {
		width: randomInt(minRoomSize, maxRoomSize),
		height: randomInt(minRoomSize, maxRoomSize)
	};

	switch(dir) {
		case Direction.North:
			room.x = x - Math.floor(room.width / 2);
			room.y = y - room.height;
			break;
		case Direction.South:
			room.x = x - Math.floor(room.width / 2),
			room.y = y + 1;
			break;
		case Direction.West:
			room.x = x - room.width;
			room.y = y - Math.floor(room.height / 2);
			break;
		case Direction.East:
			room.x = x + 1;
			room.y = y - Math.floor(room.height / 2);
			break;
		default:
			console.error(dir, "dir error");
	}

	if (this._placeRect(room, Tile.Floor)) {
		this._rooms.push(room);

		if (dir != Direction.South || firstRoom) {
			this._exits.push({
				x: room.x,
				y: room.y - 1,
				width: room.width,
				height: 1
			});
		}
		if (dir != Direction.North || firstRoom) {
			this._exits.push({
				x: room.x,
				y: room.y + room.height,
				width: room.width,
				height: 1
			});
		}
		if (dir != Direction.East || firstRoom) {
			this._exits.push({
				x: room.x - 1,
				y: room.y,
				width: 1,
				height: room.height
			});
		}
		if (dir != Direction.South || firstRoom) {
			this._exits.push({
				x: room.x + room.width,
				y: room.y,
				width: 1,
				height: room.height
			});
		}

		return true;
	}

	return false;
}
Dungeon.prototype._makeCorridor = function(x, y, dir) {
	// const
	var minCorridorSize = 6;
	var maxCorridorSize = 12;

	var corridor = {
		x: x,
		y: y
	};

	if (randomBool()) {
		corridor.width = randomInt(minCorridorSize, maxCorridorSize);
		corridor.height = 1;

		switch (dir) {
			case Direction.North:
				corridor.y = y - 1;
				if (randomBool()){
					corridor.x = x - corridor.width + 1;
				}
				break;
			case Direction.South:
				corridor.y = y + 1;
				if (randomBool()) {
					corridor.x = x - corridor.width + 1;
				}
				break;
			case Direction.West:
				corridor.x = x - corridor.width;
				break;
			case Direction.East:
				corridor.x = x + 1;
				break;
			default:
				console.error("undefined dir", dir);
		}
	}
	else {
		corridor.width = 1;
		corridor.height = randomInt(minCorridorSize, maxCorridorSize);

		switch(dir) {
			case Direction.North:
				corridor.y = y - corridor.width;
				break;
			case Direction.South:
				corridor.y = y + 1;
				break;
			case Direction.West:
				corridor.x = x - 1;
				if (randomBool()) {
					corridor.y = y - corridor.height + 1;
				}
				break;
			case Direction.East:
				corridor.x = x + 1;
				if (randomBool()) {
					corridor.y = y - corridor.height + 1;
				}
				break;
			default:
				console.error("undefined dir", dir);
		}
	}

	if (this._placeRect(corridor, Tile.Corridor)) {
		if (dir != Direction.South && corridor.width != 1) {
			this._exits.push({
				x: corridor.x,
				y: corridor.y - 1,
				width: corridor.width,
				height: 1
			});
		}
		if (dir != Direction.North && corridor.width != 1) {
			this._exits.push({
				x: corridor.x,
				y: corridor.y + corridor.height,
				width: corridor.width,
				height: 1
			});
		}
		if (dir != Direction.East && corridor.height != 1) {
			this._exits.push({
				x: corridor.x - 1,
				y: corridor.y,
				width: 1,
				height: corridor.height
			});
		}
		if (dir != Direction.West && corridor.height != 1) {
			this._exits.push({
				x: corridor.x + corridor.width,
				y: corridor.y,
				width: 1,
				height: corridor.height
			});
		}

		return true;
	}

	return false;
};
Dungeon.prototype._placeRect = function(rect, tile) {
	if (rect.x < 1 || rect.y < 1 || rect.x + rect.width > this._width - 1 || rect.y + rect.height > this._height - 1) {
		return false;
	}

	for (var y = rect.y; y < rect.y + rect.height; y++) {
		for (var x = rect.x; x < rect.x + rect.width; x++) {
			if (this.getTile(x, y) !== Tile.Unused) {
				return false;
			}
		}
	}

	for (var y = rect.y - 1; y < rect.y + rect.height + 1; y++) {
		for (var x = rect.x - 1; x < rect.x + rect.width + 1; x++) {
			if (x === rect.x - 1 || y === rect.y - 1 || x === rect.x + rect.width || y === rect.y + rect.height) {
				this._setTile(x, y, Tile.Wall);
			}
			else {
				this._setTile(x, y, tile);
			}
		}
	}

	return true;
}
