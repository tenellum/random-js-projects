var debug_mode = false;
var game_over = false;
var game_started = false;
var score = 0;
document.addEventListener('keydown', function(event) { inputHandler(event.keyCode) } );
var canvas = document.getElementById('gameCanvas');
var can = canvas.getContext('2d');
var score_text = document.getElementById('scoreText');
var canvas_is_sized = false;
var next_block_text = document.getElementById('nextBlockText');
var next_block_canvas = document.getElementById('nextBlockCanvas');
var next_block_can = next_block_canvas.getContext('2d');
var next_block_type = 0;
var spawn_offset = [3, 0];
var game_field_size_x = 10;
var game_field_size_y = 20;
var game_field = [];
var active_field = [];
for (let field_i = 0; field_i < game_field_size_x; field_i++){
	game_field.push([]);
	active_field.push([]);
	for (let field_j = 0; field_j < game_field_size_y; field_j++){
		game_field[field_i].push(0);
		active_field[field_i].push(0);
	}
}
drawField(game_field, false);
/* // Array Testing
game_field[2][4] = 2;
console.log(game_field);
console.log(active_field);
for (let i = 0; i < game_field.length; i++){
	for (let j = 0; j < game_field[i].length; j++){
		if (game_field[i][j] == 2){
			console.log(game_field[i][j]);
			console.log(active_field[i][j]);
		}
	}
}*/

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

function drawField(field, transparent){
	let field_dim = 30;
	let field_border = 0.05;
	field_border = Math.floor(field_dim * field_border);
	
	if (!canvas_is_sized){
		canvas.width = field.length * (field_dim + 2 * field_border);
		canvas.height = field[0].length * (field_dim + 2 * field_border);
		canvas.style = `position:absolute; left: 50%; margin-left: ${(canvas.width/2) * -1}px; margin-top: 50px`;
		canvas_is_sized = true;
	}
	
	let border_color = 'black'
	// 0 'grid' lightgray, 1 'I' cyan, 2 'J' blue, 3 'L' orange, 4 'O' yellow, 5 'S' green, 6 'T' purple, 7 'Z' red 
	let block_colors = ['lightgray', 'cyan', 'blue', 'orange', 'yellow', 'lime', 'purple', 'red'];
	
	for (let i = 0; i < field.length; i++){
		for (let j = 0; j < field[i].length; j++){
			if (!transparent || field[i][j] > 0){
				drawQuat([i * (field_dim + 2 * field_border) + field_dim / 2 + field_border, j * (field_dim + 2 * field_border) + field_dim / 2 + field_border], field_dim, block_colors[field[i][j]], field_border, border_color, [i,j]);
			}
		}
	}
	
	let score_text_text = 'Rows Cleared: ';
	if (game_started){
		score_text.innerHTML = score_text_text + score;
	}
}

function multiDrawField(fields = [game_field, active_field], visibilities = [false, true]){
	//console.log(fields);
	//console.log(visibilities);
	if (fields.length == visibilities.length){
		for (let i = 0; i < fields.length; i++){
			drawField(fields[i], visibilities[i]);
		}
	}
}

function spawnNewBlock(spawned_field /*Array*/, offset /*Array*/, block_type, is_next_block = false){
	if(!is_next_block){
		next_block_type = Math.floor(Math.random() * 7) + 1;
		console.log(`Next Block = ${next_block_type}`);
		//next_block_text.innerHTML = String(next_block_type);
		
		let block_image = new Image;
		
		block_image.onload = function(){
			next_block_can.drawImage(block_image, 0, 0);
		}
		block_image.src = `./img/${next_block_type}-Block.png`;
	}
	
	if (block_type == 0){
		new_block_type = Math.floor(Math.random() * 7 + 1);
	}
	else{
		new_block_type = block_type;
	}
	
	let block_instruction = []
	switch (new_block_type){
		case 1:
			//console.log('Spawn: spawning I block ');
			block_instruction.push([0, 1], [1, 1], [2, 1], [3, 1]);
			break;
		case 2:
			//console.log('Spawn: spawning J block');
			block_instruction.push([0, 0], [0, 1], [1, 1], [2, 1]);
			break;
		case 3:
			//console.log('Spawn: spawning L block');
			block_instruction.push([0, 1], [1, 1], [2, 0], [2, 1]);
			break;
		case 4:
			//console.log('Spawn: spawning O block');
			block_instruction.push([1, 0], [1, 1], [2, 0], [2, 1]);
			break;
		case 5:
			//console.log('Spawn: spawning S block');
			block_instruction.push([0, 1], [1, 0], [1, 1], [2, 0]);
			break;
		case 6:
			//console.log('Spawn: spawning T block');
			block_instruction.push([0, 1], [1, 0], [1, 1], [2, 1]);
			break;
		case 7:
			//console.log('Spawn: spawning Z block');
			block_instruction.push([0, 0], [1, 0], [1, 1], [2, 1]);
			break;
		default:
			//console.log('Spawn: nonexistent block type, spawning I block instead.');
			break;
	}
	
	let game_over_check = false;
	for (let i = 0; i < block_instruction.length; i++){
		//console.log(block_instruction[i]);
		if (!game_over_check){
			let xcoord = block_instruction[i][0] + offset[0];
			let ycoord = block_instruction[i][1] + offset[1];
			if (game_field[xcoord][ycoord] == 0){
				spawned_field[xcoord][ycoord] = new_block_type;
			}
			else{
				game_over_check = true;
				game_over = true;
				console.log('Game Over')
			}
		}
	}
	if (game_over_check){
		for (let i = 0; i < spawned_field.length; i++){
			for (let j = 0; j < spawned_field[i].length; j++){
				spawned_field[i][j] = 0;
			}
		}
	}
	
	s1_flip = false;
	s2_flip = false;
	z_state = 0;
	i_state = 0;
	return new_block_type;
}

function gravityHandler(){
	let free_to_fall = true;
	for (let i = 0; i < active_field.length - 1; i++){ // -2 to stop at second last row
		for (let j = 0; j < active_field[i].length; j++){
			if (active_field[i][j] > 0){ // if field is a block
				if (game_field[i][j + 1] > 0) { // if field below contains block
					mergeFields();
					free_to_fall = false;
					break;
				}
				else if (j == active_field[i].length - 1){
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
	return free_to_fall;
}
function moveFieldDown(){
	let move_possible = true;
	for (let i = active_field.length - 1; i >= 0 ; i--){
		for (let j = active_field[0].length - 1; j >= 0; j--){
			if (active_field[i][active_field[i].length - 1] > 0){
				move_possible = false;
			}
			if (active_field[i][j] > 0 && game_field[i][j+1] > 0){
				move_possible = false;
			}
		}
	}
	if (move_possible){
		for (let i = active_field.length - 1; i >= 0 ; i--){
			for (let j = active_field[0].length - 1; j >= 0; j--){
				if (j == 0){
					active_field[i][j] = 0;
				}
				else{
					active_field[i][j] = active_field[i][j-1];
				}
			}
		}
	}
	else{
		console.log('cannot move down');
		mergeFields();
	}
}
function moveBlockHori(right){
	let move_possible = true;
	if (right){
		for (let i = active_field.length - 1; i >= 0 ; i--){
			for (let j = active_field[0].length - 1; j >= 0; j--){
				if (active_field[active_field.length - 1][j] > 0){
					move_possible = false;
				}
				if (i < active_field.length - 1){
					if (active_field[i][j] > 0 && game_field[i+1][j] > 0){
						move_possible = false;
					}
				}
			}
		}
		if(move_possible){
			for (let i = active_field.length - 1; i >= 0 ; i--){
				for (let j = active_field[0].length - 1; j >= 0; j--){
					if (i == 0){
						active_field[i][j] = 0
					}
					else {
						active_field[i][j] = active_field[i-1][j];
					}
				}
			}
		}
		else{
			console.log('cannot move right');
		}
	}
	else{
		for (let i = active_field.length - 1; i >= 0 ; i--){
			for (let j = active_field[0].length - 1; j >= 0; j--){
				if (active_field[0][j] > 0){
					move_possible = false;
				}
				if (i > 0){
					if (active_field[i][j] > 0 && game_field[i-1][j] > 0){
						move_possible = false;
					}
				}
			}
		}
		
		if(move_possible){
			for (let i = 0; i < active_field.length; i++){
				for (let j = 0; j < active_field[i].length - 1; j++){
					if (i == active_field.length - 1){
						active_field[i][j] = 0
					}
					else{
						active_field[i][j] = active_field[i+1][j];
					}
				}
			}
		}
		else{
			console.log('cannot move left');
		}
	}
}
function mergeFields(){
	//console.log('MERGE INITIATED');
	let transfer_value;
	for (let i = 0; i < game_field.length; i++){
		for (let j = 0; j < game_field[i].length; j++){
			if (active_field[i][j] > 0){
				transfer_value = active_field[i][j];
				active_field[i][j] = 0;
				game_field[i][j] = transfer_value;
			}
		}
	}
	checkScore();
	spawnNewBlock(active_field, spawn_offset, next_block_type);
}

function checkScore(){
	console.log('checking for full row..')
	let row_is_full;
	for (let i = game_field[0].length - 1; i >= 0; i--){
		row_is_full = true;
		for(let j = 0; j < game_field.length; j++){
			if (game_field[j][i] < 1){
				row_is_full = false;
			}
		}
		if (row_is_full){
			console.log(`Row ${i} is full`);
			score++;
			clearRow(i);
			i++;
		}
	}
}

function clearRow(row){
	for (let i = row; i >= 1; i--){
		for(let j = 0; j < game_field.length; j++){
			game_field[j][i] = game_field[j][i-1];
		}
	}
	for (let k = 0; k < game_field.length; k++){
		game_field[k][0] = 0;
	}
}

function inputHandler(key){
	if (!game_over && game_started){
		if (key == 37 || key == 65){ // left
			moveBlockHori(false);
			multiDrawField();
		}
		else if (key == 39 || key == 68){ // right
			moveBlockHori(true);
			multiDrawField();
		}
		else if (key == 38 || key == 87){ // up
			rotateBlock();
		}
		else if (key == 40 || key == 83){ // down
			moveFieldDown();
			multiDrawField();
		}
		else if (key == 32 || key == 83){ // drop
			let looping = true;
			while (looping){
				looping = gravityHandler();
			}
			multiDrawField();
		}
	}
	if (!game_started){
		main();
		game_started = true;
	}
}

var s1_flip = false;
var s2_flip = false;
var z_state = 0;
var i_state = 0;
function rotateBlock(test = true){
	console.log('Trying Rotation')
	// Searching for the Block
	let has_found_block = false;
	let found_block_coord;
	let found_block_type;
	for (let i = 0; i < active_field.length; i++){
		if (has_found_block){
			break;
		}
		for (let j = 0; j < active_field[i].length; j++){
			if (active_field[i][j] > 0){
				has_found_block = true;
				found_block_coord = [i, j];
				found_block_type = active_field[i][j];
				break;
			}
		}
	}
	let offset = found_block_coord;
	try{
		let i_block_check;
		// Setting the offset depending on the block
		switch (found_block_type){
			case 1: // I Block
				if (i_state == 0){
					i_block_check = active_field[offset[0]+0][offset[1]-1]
					i_block_check = active_field[offset[0]+3][offset[1]-1]
					i_block_check = active_field[offset[0]+0][offset[1]+2]
					i_block_check = active_field[offset[0]+3][offset[1]+2]
					active_field[offset[0]+0][offset[1]+0] = 0;
					active_field[offset[0]+2][offset[1]+0] = 0;
					active_field[offset[0]+3][offset[1]+0] = 0;
					active_field[offset[0]+1][offset[1]-1] = 1;
					active_field[offset[0]+1][offset[1]+1] = 1;
					active_field[offset[0]+1][offset[1]+2] = 1;
				}
				else if (i_state == 1){
					i_block_check = active_field[offset[0]-1][offset[1]+0]
					i_block_check = active_field[offset[0]+2][offset[1]+0]
					i_block_check = active_field[offset[0]-1][offset[1]+3]
					i_block_check = active_field[offset[0]+2][offset[1]+3]
					active_field[offset[0]+0][offset[1]+0] = 0;
					active_field[offset[0]+0][offset[1]+1] = 0;
					active_field[offset[0]+0][offset[1]+3] = 0;
					active_field[offset[0]-1][offset[1]+2] = 1;
					active_field[offset[0]+1][offset[1]+2] = 1;
					active_field[offset[0]+2][offset[1]+2] = 1;
				}
				else if (i_state == 2){
					i_block_check = active_field[offset[0]+0][offset[1]-2]
					i_block_check = active_field[offset[0]+3][offset[1]-2]
					i_block_check = active_field[offset[0]+0][offset[1]+1]
					i_block_check = active_field[offset[0]+3][offset[1]+1]
					active_field[offset[0]+0][offset[1]+0] = 0;
					active_field[offset[0]+1][offset[1]+0] = 0;
					active_field[offset[0]+3][offset[1]+0] = 0;
					active_field[offset[0]+2][offset[1]-2] = 1;
					active_field[offset[0]+2][offset[1]-1] = 1;
					active_field[offset[0]+2][offset[1]+1] = 1;
				}
				else if (i_state == 3){
					i_block_check = active_field[offset[0]-2][offset[1]+0]
					i_block_check = active_field[offset[0]+1][offset[1]+0]
					i_block_check = active_field[offset[0]-2][offset[1]+3]
					i_block_check = active_field[offset[0]+1][offset[1]+3]
					active_field[offset[0]+0][offset[1]+0] = 0;
					active_field[offset[0]+0][offset[1]+2] = 0;
					active_field[offset[0]+0][offset[1]+3] = 0;
					active_field[offset[0]-2][offset[1]+1] = 1;
					active_field[offset[0]-1][offset[1]+1] = 1;
					active_field[offset[0]+1][offset[1]+1] = 1;
				}
				multiDrawField();
				
				i_state += 1;
				if (i_state > 3){
					i_state = 0;
				}
				console.log('Completed I Block Rotation.')
				throw 'Completed I Block Rotation.'
				break;
			case 2: // J Block
				if (active_field[found_block_coord[0] + 1][found_block_coord[1] - 1] > 0){
					offset[0] += 1;
					offset[1] += -1;
				}
				else if (active_field[found_block_coord[0] + 1][found_block_coord[1] + 1] > 0){
					offset[0] += 1;
					offset[1] += 1;
				}
				else if (active_field[found_block_coord[0] + 0][found_block_coord[1] + 2] > 0){
					offset[0] += 0;
					offset[1] += 1;
				}
				else if (active_field[found_block_coord[0] + 2][found_block_coord[1] + 0] > 0){
					offset[0] += 1;
					offset[1] += 0;
				}
				break;
			case 3: // L Block 
				if (active_field[found_block_coord[0] + 0][found_block_coord[1] + 2] > 0){
					offset[0] += 0;
					offset[1] += 1;
				}
				else if (active_field[found_block_coord[0] + 2][found_block_coord[1] + 0] > 0){
					offset[0] += 1;
					offset[1] += 0;
				}
				else if (active_field[found_block_coord[0] + 1][found_block_coord[1] + 1] > 0){
					offset[0] += 1;
					offset[1] += 1;
				}
				break;
			case 4: // O Block
				console.log('O Block cannot be rotated');
				throw 'O Block';
				break;
			case 5: // S Block
				if (active_field[found_block_coord[0] + 0][found_block_coord[1] + 1] > 0){
					offset[0] += 0;
					if (s1_flip){
						offset[0] += 1;
					}
					s1_flip = !s1_flip
					
					offset[1] += 1;
				}
				else if (active_field[found_block_coord[0] + 1][found_block_coord[1] + 0] > 0){
					offset[0] += 1;
					if (s2_flip){
						offset[1] += -1;
					}
					s2_flip = !s2_flip;
				}
				break;
			case 6: // T Block
				if (active_field[found_block_coord[0] + 1][found_block_coord[1] + 0] > 0){
					offset[0] += 1;
					offset[1] += 0;
				}
				else if (active_field[found_block_coord[0] + 0][found_block_coord[1] + 1] > 0){
					offset[0] += 0;
					offset[1] += 1;
				}
				break;
			case 7: // Z Block
				console.log(z_state);
				offset[0] += 1;
				if (z_state == 0){
					offset[1] += 1;
				}
				else if (z_state == 1){
					offset[0] -= 1;
				}
				z_state += 1;
				if (z_state > 3){
					z_state = 0;
				}
				break;
		}
		
		// check if rotation is possible / throws error if not
		let check = active_field[offset[0]][offset[1]];
		for (let i = -1; i <= 1; i++){
			for (let j = -1; j <= 1; j++){
				check = active_field[offset[0] + i][offset[1] + j];
			}
		}
		
		// if the code reaches this place no error has occured so rotation is possible
		console.log('Executing Rotation')
		console.log(offset[0] + '/' + offset[1])
		if (test){
			executeRotation(offset, active_field);
			executeRotation(offset, active_field);
		}
		multiDrawField();
	}
	catch (err){
		console.log('Rotation Failed : ' + err.message)
	}
}

function executeRotation(off /*offset*/, fld/*field*/){
	// 1.
	let store = fld[off[0] -1][off[1] -1];
	// 2.
	fld[off[0] -1][off[1] -1] = fld[off[0] -1][off[1] +0];
	// 3.
	fld[off[0] -1][off[1] +0] = fld[off[0] -1][off[1] +1];
	// 4.
	fld[off[0] -1][off[1] +1] = fld[off[0] +0][off[1] +1];
	// 5.
	fld[off[0] +0][off[1] +1] = fld[off[0] +1][off[1] +1];
	// 6.
	fld[off[0] +1][off[1] +1] = fld[off[0] +1][off[1] +0];
	// 7.
	fld[off[0] +1][off[1] +0] = fld[off[0] +1][off[1] -1];
	// 8.
	fld[off[0] +1][off[1] -1] = fld[off[0] +0][off[1] -1];
	// 9.
	fld[off[0] +0][off[1] -1] = store;
}

function main(){
	// console.log('start')
	// setTimeout(function(){
		// console.log('step 1');
		// drawField(active_field, true);
		// setTimeout(function(){
			// console.log('step 2');
			// drawField(game_field, false);
		// },1000);
	// },1000);
	
	spawnNewBlock(active_field, spawn_offset, next_block_type);
	drawField(game_field, false);
	drawField(active_field, true);
	setInterval(function(){
		gravityHandler(); 
		multiDrawField([game_field, active_field], [false, true]);
	}, 1000)
}