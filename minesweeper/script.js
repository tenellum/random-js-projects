var Field = /** @class */ (function () {
    function Field(xPos, yPos, hasBomb, hasFlag, isRevealed) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.hasBomb = hasBomb;
        this.hasFlag = hasFlag;
        this.isRevealed = isRevealed;
    }
    Field.prototype.log = function () {
        console.log(this);
    };
    return Field;
}());
var Grid = /** @class */ (function () {
    function Grid(height, width, bombs) {
        this.fields = [];
        for (var i = 0; i < height; i++) {
            this.fields.push([]);
            for (var j = 0; j < width; j++) {
                this.fields[i].push(new Field(j, i, false, false, false));
            }
        }
        this.placeBombs(bombs);
    }
    Grid.prototype.placeBombs = function (bombs) {
        var x, y, xmax, ymax;
        xmax = this.fields[0].length;
        ymax = this.fields.length;
        if (bombs >= xmax * ymax) {
            bombs = xmax * ymax - 1;
        }
        var bombsPlaced = 0;
        while (bombsPlaced < bombs) {
            x = Math.floor(Math.random() * xmax);
            y = Math.floor(Math.random() * xmax);
            if (this.fields[y][x].hasBomb) {
                continue;
            }
            else {
                this.fields[y][x].hasBomb = true;
                bombsPlaced++;
            }
        }
    };
    Grid.prototype.draw = function (drawn_canvas, size, border) {
        if (!game_is_over) {
            var canvas_width = drawn_canvas.canvas.width;
            var canvas_height = drawn_canvas.canvas.height;
            drawQuat(drawn_canvas, canvas_width / 2, canvas_height / 2, canvas_width + canvas_height, 'white');
            var field_dim = size + border;
            for (var i = 0; i < this.fields.length; i++) {
                for (var j = 0; j < this.fields[i].length; j++) {
                    if (this.fields[i][j].isRevealed) {
                        drawQuat(drawn_canvas, j * (size + 2 * border) + size / 2 + border, i * (size + 2 * border) + size / 2 + border, size, 'darkgrey', border, 'dimgrey');
                        if (this.fields[i][j].hasBomb) {
                            drawText(drawn_canvas, j * (size + 2 * border) + size / 2 + border, i * (size + 2 * border) + size / 2 + border, size, 'black', '💣', 'Arial');
                        }
                        else {
                            var neigborBombs = this.countNeighborBombs(i, j);
                            if (neigborBombs > 0) {
                                drawText(drawn_canvas, j * (size + 2 * border) + size / 2 + border, i * (size + 2 * border) + size / 2 + border, size, 'black', String(neigborBombs));
                            }
                        }
                    }
                    else {
                        drawShadedQuat(drawn_canvas, j * (size + 2 * border) + size / 2 + border, i * (size + 2 * border) + size / 2 + border, size, [192, 192, 192], border, 'dimgrey');
                        if (this.fields[i][j].hasFlag) {
                            drawText(drawn_canvas, j * (size + 2 * border) + size / 2 + border, i * (size + 2 * border) + size / 2 + border, size, 'black', '🚩', 'Arial');
                        }
                    }
                }
            }
        }
    };
    Grid.prototype.countNeighborBombs = function (x, y) {
        var bombNumber = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                try {
                    if (!(i == 0 && j == 0) && this.fields[x + i][y + j].hasBomb) {
                        bombNumber++;
                    }
                }
                catch (_a) {
                    continue;
                }
            }
        }
        return bombNumber;
    };
    Grid.prototype.log = function () {
        console.log(this);
    };
    return Grid;
}());
var canvas = document.getElementById('gameGrid');
var can = canvas.getContext('2d');
var revealed_fields;
var revealable_fields;
var timer;
var px_field_size = 50;
var px_field_border = 2;
var game_is_over = false;
var game_has_started = false;
//canvas.style = 'border: 2px solid black; text-align: center;'
var game;
startGame(9, 9, 10);
function startGame(w, h, b) {
    var grid_width = w;
    var grid_height = h;
    var grid_bombs = b;
    revealed_fields = 0;
    revealable_fields = grid_width * grid_height - grid_bombs;
    game = new Grid(grid_height, grid_width, grid_bombs);
    canvas.addEventListener('click', function (e) { revealField(e.pageY, e.pageX, true); game.draw(can, px_field_size, px_field_border); }, false);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); flagField(e.y, e.x); }, true);
    canvas.width = game.fields.length * (px_field_size + 2 * px_field_border);
    canvas.height = game.fields[0].length * (px_field_size + 2 * px_field_border);
    game.draw(can, px_field_size, px_field_border);
}
var win_interval = setInterval(function () {
    console.log(revealed_fields + '/' + revealable_fields);
    if (revealed_fields >= revealable_fields) {
        gameOver('YOU WIN!');
    }
}, 1000);
function revealField(my, mx, is_canvas_coords) {
    var x = mx;
    var y = my;
    if (is_canvas_coords) {
        x = canIndex(mx);
        y = canIndex(my);
    }
    if (!game.fields[y][x].hasFlag) {
        if (!game.fields[y][x].isRevealed) {
            game.fields[y][x].isRevealed = true;
            revealed_fields++;
            game.draw(can, px_field_size, px_field_border);
        }
        if (game.fields[y][x].hasBomb) {
            gameOver('YOU LOOSE!');
        }
        else {
            //Reveal sorrounding bomb-free fields and recourse if clear
            if (game.countNeighborBombs(y, x) < 1) {
                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        try {
                            if (!game.fields[y + i][x + j].hasBomb && !game.fields[y + i][x + j].isRevealed) {
                                game.fields[y + i][x + j].isRevealed = true;
                                revealed_fields++;
                                if (game.countNeighborBombs(y + i, x + j) == 0) {
                                    revealField(y + i, x + j, false);
                                }
                            }
                        }
                        catch (_a) {
                            continue;
                        }
                    }
                }
            }
        }
    }
}
function flagField(y, x) {
    if (!game.fields[canIndex(y)][canIndex(x)].isRevealed) {
        game.fields[canIndex(y)][canIndex(x)].hasFlag = !game.fields[canIndex(y)][canIndex(x)].hasFlag;
        game.draw(can, px_field_size, px_field_border);
    }
}
function canIndex(n) {
    var fieldInterval = px_field_size + 2 * px_field_border;
    var index = Math.floor(n / fieldInterval);
    return index;
}
function gameOver(text) {
    if (!game_is_over) {
        //drawQuat(can, canvas.width/2, canvas.height/2, canvas.width + canvas.height, 'black');
        //drawText(can, canvas.width/2, canvas.height/2, canvas.width/5, 'white', text);
        alert(text);
        for (var i = 0; i < game.fields.length; i++) {
            for (var j = 0; j < game.fields[i].length; j++) {
                game.fields[i][j].isRevealed = true;
            }
        }
        game.draw(can, px_field_size, px_field_border);
        canvas.removeEventListener('click', revealField, false);
        canvas.removeEventListener('contextmenu', flagField, true);
        clearInterval(win_interval);
        game_is_over = true;
    }
}
function drawQuat(drawn_canvas, x, y, size, color, border, border_color) {
    if (border === void 0) { border = 0; }
    if (border_color === void 0) { border_color = 'black'; }
    if (border > 0) {
        drawn_canvas.beginPath();
        drawn_canvas.fillStyle = border_color;
        drawn_canvas.rect(x - size / 2 - border, y - size / 2 - border, size + border * 2, size + border * 2);
        drawn_canvas.fill();
    }
    drawn_canvas.beginPath();
    drawn_canvas.fillStyle = color;
    drawn_canvas.rect(x - size / 2, y - size / 2, size, size);
    drawn_canvas.fill();
}
function drawShadedQuat(drawn_canvas, x, y, size, rgb_color, border, border_color) {
    if (border === void 0) { border = 0; }
    if (border_color === void 0) { border_color = 'black'; }
    if (border > 0) {
        drawn_canvas.beginPath();
        drawn_canvas.fillStyle = border_color;
        drawn_canvas.rect(x - size / 2 - border, y - size / 2 - border, size + border * 2, size + border * 2);
        drawn_canvas.fill();
    }
    // Dark Lower Polygon
    can.fillStyle = "rgb(".concat(rgb_color[0] - 20, ",").concat(rgb_color[1] - 20, ",").concat(rgb_color[2] - 20, ")");
    drawn_canvas.beginPath();
    drawn_canvas.moveTo(x, y);
    drawn_canvas.lineTo(x - size / 2, y + size / 2);
    drawn_canvas.lineTo(x + size / 2, y + size / 2);
    drawn_canvas.lineTo(x + size / 2, y - size / 2);
    drawn_canvas.closePath();
    drawn_canvas.fill();
    // Light Upper Polygon
    can.fillStyle = "rgb(".concat(rgb_color[0] + 20, ",").concat(rgb_color[1] + 20, ",").concat(rgb_color[2] + 20, ")");
    drawn_canvas.beginPath();
    drawn_canvas.moveTo(x, y);
    drawn_canvas.lineTo(x - size / 2, y + size / 2);
    drawn_canvas.lineTo(x - size / 2, y - size / 2);
    drawn_canvas.lineTo(x + size / 2, y - size / 2);
    drawn_canvas.closePath();
    drawn_canvas.fill();
    // Normal Smaller Quat
    drawn_canvas.beginPath();
    drawn_canvas.fillStyle = "rgb(".concat(rgb_color[0], ",").concat(rgb_color[1], ",").concat(rgb_color[2], ")");
    drawn_canvas.rect(x - (size * 0.75) / 2, y - (size * 0.75) / 2, size * 0.75, size * 0.75);
    drawn_canvas.fill();
}
function drawText(drawn_canvas, x, y, size, color, text, font) {
    if (font === void 0) { font = 'Consolas'; }
    drawn_canvas.fillStyle = color;
    drawn_canvas.font = "".concat(size / 1.5, "px ").concat(font);
    drawn_canvas.textAlign = 'center';
    drawn_canvas.textBaseline = 'middle';
    drawn_canvas.fillText("".concat(text), x, y);
}
