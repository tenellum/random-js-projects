var debug_mode = true;
var canvas = document.getElementById('gameCanvas');
var can = canvas.getContext('2d');
var canvas_is_sized = false;
var game_field_size = [20, 10]
var game_field = Array.from(Array(game_field_size[1]), () => new Array(game_field_size[0]).fill(0));
var active_game_field = Array.from(Array(game_field_size[1]), () => new Array(game_field_size[0]).fill(-1));


function drawField(drawn_field){
	let field_size = [drawn_field.length, drawn_field[0].length];
	let field_dim = 30;
	let field_border = 0.05;
	field_border = Math.floor(field_dim * field_border);
	
	if (!canvas_is_sized){
		canvas.width = field_size[0] * (field_dim + 2 * field_border);
		canvas.height = field_size[1] * (field_dim + 2 * field_border);
		canvas.style = `position:absolute; left: 50%; margin-left: ${(canvas.width/2) * -1}px;`;
		canvas_is_sized = true;
	}
	
	let border_color = 'black'
	// 0 'grid' lightgray, 1 'I' cyan, 2 'J' blue, 3 'L' orange, 4 'O' yellow, 5 'S' green, 6 'T' purple, 7 'Z' red 
	let block_colors = ['lightgray', 'cyan', 'blue', 'orange', 'yellow', 'lime', 'purple', 'red'];
	
	for (let i = 0; i < field_size[1]; i++){
		for (let j = 0; j < field_size[0]; j++){
			if (drawn_field[j][i] != -1){
				drawQuat([j * (field_dim + 2 * field_border) + field_dim / 2 + field_border, i * (field_dim + 2 * field_border) + field_dim / 2 + field_border], field_dim, block_colors[drawn_field[j][i]], field_border, border_color, [j,i]);
			}
		}
	}
}

function drawQuat(center /*Array*/, size, color, border, border_color, coords){
	if (border > 0){
		can.beginPath();
		can.fillStyle = border_color;
		//console.log(center + ' / ' + size + ' / ' + color)
		can.rect(center[0] - size / 2 - border, center[1] - size / 2 - border, size + border * 2, size + border * 2);
		can.fill();
	}
	can.beginPath();
	can.fillStyle = color;
	//console.log(center + ' / ' + size + ' / ' + color)
	can.rect(center[0] - size / 2, center[1] - size / 2, size, size);
	can.fill();
	if (debug_mode){
		can.fillStyle = 'magenta'
		can.font = `${size/2.5}px Consolas`;
		can.textAlign = 'center';
		can.textBaseline = 'middle';
		can.fillText(`${coords}`, center[0], center[1]);
	}
}

function multiDrawField(fields){
	for (let i = 0; i < fields.length; i++){
		drawField(fields[i]);
	}
}

function spawnNewBlock(spawned_field /*Array*/, offset /*Array*/, held_block_type = 0){
	if (held_block_type == 0){
		new_block_type = Math.floor(Math.random() * 7 + 1);
	}
	else{
		new_block_type = held_block_type;
	}
	
	let block_instruction = [];
	switch (new_block_type){
		case 1:
			console.log('Spawn: spawning I block ');
			block_instruction.push([0, 1], [1, 1], [2, 1], [3, 1]);
			break;
		case 2:
			console.log('Spawn: spawning J block');
			block_instruction.push([0, 0], [0, 1], [1, 1], [2, 1]);
			break;
		case 3:
			console.log('Spawn: spawning L block');
			block_instruction.push([0, 1], [1, 1], [2, 0], [2, 1]);
			break;
		case 4:
			console.log('Spawn: spawning O block');
			block_instruction.push([1, 0], [1, 1], [2, 0], [2, 1]);
			break;
		case 5:
			console.log('Spawn: spawning S block');
			block_instruction.push([0, 1], [1, 0], [1, 1], [2, 0]);
			break;
		case 6:
			console.log('Spawn: spawning T block');
			block_instruction.push([0, 1], [1, 0], [1, 1], [2, 1]);
			break;
		case 7:
			console.log('Spawn: spawning Z block');
			block_instruction.push([0, 0], [1, 0], [1, 1], [2, 1]);
			break;
		default:
			console.log('Spawn: nonexistent block type, spawning I block instead.');
			break;
	}
	
	for (let i = 0; i < block_instruction.length; i++){
		console.log(block_instruction[i]);
		spawned_field[block_instruction[i][0] + offset[0]][block_instruction[i][1] + offset[1]] = new_block_type;
	}
	return new_block_type;
}

function mergeFields(){
	console.log('MERGE INITIATED');
	for (let i = 0; i < active_game_field.length; i++){
		for (let j = 0; j < active_game_field[i].length; j++){
			game_field[i][j] = active_game_field[i][j];
			active_game_field[i][j] = -1
		}
	}
}

function moveFieldDown(){
	for (let i = active_game_field.length - 1; i >= 0 ; i--){
		for (let j = active_game_field[0].length - 1; j >= 0; j--){
			if (i == 0){
				active_game_field[i][j] = -1;
			}
			else{
				active_game_field[i][j] = active_game_field[i][j - 1];
			}
			console.log(i + ', ' + j);
		}
	}
}

function gravityHandler(){
	for (let k = 0; k < active_game_field.length; k++){
		if (active_game_field[k][active_game_field.length - 1] > 0){ // if lowest row contains block
			mergeFields();
		}
	}
	let free_to_fall = true;
	for (let i = 0; i < active_game_field.length - 1; i++){ // -2 to stop at second last row
		for (let j = 0; j < active_game_field[i].length; j++){
			if (active_game_field[i][j] > 0){ // if field is a block
				if (game_field[i][j + 1] > 0) { // if field below contains block
					mergeFields();
					free_to_fall = false;
					break;
				}
			}
		}
	}
	if (free_to_fall){
		moveFieldDown();
	}
}

function main(){
	let next_block = spawnNewBlock(active_game_field, [3, 0]);
	multiDrawField([game_field, active_game_field]);
	
	setInterval(function(){gravityHandler(); multiDrawField([game_field, active_game_field]);}, 2000)
}
main()