var debug_mode = false
var gameIsOver = false
var canvas = document.getElementById('gameField');
var score_canvas = document.getElementById('scoreField');
var can = canvas.getContext('2d');
var sco = score_canvas.getContext('2d');
document.addEventListener('keydown', function(event) { inputHandler(event.keyCode) } );
window.addEventListener('resize', function(event) { resizeGame() } );
var dim = canvas.height; // 800 * 800 Pixel Canvas
var fields = 11; // 11 * 11 Fields
var field_dim = dim / fields; // = 40px per Field
var field_colors = ['lightgray', 'darkgray'];
var field_border = Math.floor(field_dim / 10)

var fruit_field = Array.from(Array(fields), () => new Array(fields).fill(false));
var fruit_color = 'red';
var snake_field = Array.from(Array(fields), () => new Array(fields).fill(0));
var snake_color = 'green';
var head_field = [Math.floor(fields/2), Math.floor(fields/2)];
var head_color = 'darkgreen';

var gameInterval = null;
var delay = 500;
var paused = false;
var score = 0;
var scored = 1;
var movement = [0, 0];
var last_movement = [0, 0];
var length = 3;
var visual = 'rect'
var game_loop_counter = 0;
var game_won = true;

var auto_play = false;
var auto_counter = 0;
var auto_instruction = [];
//[[1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [0, 1]]
for (let auto_constructor = 0; auto_constructor < fields - 1; auto_constructor++){
	auto_instruction.push([1, 0]);
}
auto_instruction.push([0, 1]);
processing_Time = Date.now();


function resizeGame(){
	canvas.height = 0.8 * window.innerHeight;
	canvas.width = canvas.height;
	dim = canvas.height;
	field_dim = dim / fields;
	field_border = Math.floor(field_dim / 10);
	drawField();
	
	score_canvas.height = field_dim;
	score_canvas.width = canvas.height;
	drawScoreText(`Score : ${score}`);
}

resizeGame();
function drawField(){
	// First Clear Field
	can.beginPath();
	can.rect(0, 0, dim, dim);
	can.fillStyle = 'white';
	can.fill();
	var flip;
	for (let i = 0; i < fields; i++){
		if (i % 2 == 0){
			flip = true;
		} 
		else{
			flip = false
		}
		for (let j = 0; j < fields; j++){
			can.beginPath();
			let x = j * field_dim + field_border;
			let y = i * field_dim + field_border;
			let wh = field_dim - 2 * field_border
			formFromRect(x, y, wh, visual);
			if (flip) {
				can.fillStyle = field_colors[0];
				flip = false;
			}
			else{
				can.fillStyle = field_colors[1];
				flip = true;
			}
			
			if (fruit_field[j][i]){
				can.fillStyle = fruit_color;
			}
			if (snake_field[j][i]){
				can.fillStyle = snake_color;
			}
			if (head_field[0] == j && head_field[1] == i){
				can.fillStyle = head_color;
			}
			can.fill();
			
			if (debug_mode){
				can.font = `${field_dim/2}px Consolas`
				can.textAlign = 'center'
				can.fillStyle = 'magenta'
				can.fillText(`${snake_field[j][i]}`, j * field_dim + field_dim / 2, i * field_dim + field_dim / 2)
			}
		}
	}
	if (debug_mode){
		let des_x = head_field[0] + movement[0];
		if (des_x >= fields) {des_x -= fields;}
		else if (des_x < 0) {des_x += fields;}
		let des_y = head_field[1] + movement[1];
		if (des_y >= fields) {des_y -= fields;}
		else if (des_y < 0) {des_y += fields;}
		des_size = field_dim * 0.8;
		
		can.beginPath();
		can.arc(des_x * field_dim + field_dim/2, des_y * field_dim + field_dim/2, field_dim * 0.2, 0, 2 * Math.PI);
		can.fillStyle = 'black';
		can.fill();
		can.beginPath();
		can.arc(des_x * field_dim + field_dim/2, des_y * field_dim + field_dim/2, field_dim * 0.18, 0, 2 * Math.PI);
		can.fillStyle = 'yellow';
		can.fill();
	}
}

function spawnFruit(){
	let generating = true;
	while (generating) {
		xpos = Math.floor(Math.random() * fields);
		ypos = Math.floor(Math.random() * fields);
		if (snake_field[xpos][ypos] == 0 && fruit_field[xpos][ypos] == 0 && !(head_field[0] == xpos && head_field[1] == ypos)){
			fruit_field[xpos][ypos] = true;
			generating = false;
		}
		else{
			if (length + 1 >= fields ** 2){
				generating = false
				game_won = true
				gameOver()
				break;
			}
			console.log('Picking new Spawnspot ');
		}
	}
	
	/*
	console.log("Picking Fruit Spawnspot");
	
	console.log(snake_field[5][5])
	
	let free_fields = [];
	
	for (let x = 0; x < snake_field.length; x++) {
		for (let y = 0; y < snake_field[x].length; y++) {
			if (snake_field[x][y] == 0) {
				free_fields.push([x, y])
			}
		}
	}
	
	console.log(free_fields);
	
	if (free_fields.length == 0) {
		game_won = true;
		gameOver();
	}
	else {
		rand_field_index = Math.floor(Math.random() * free_fields.length);
		rand_field = [...free_fields[rand_field_index]]
		fruit_field[rand_field[0]][rand_field[1]] = true;
	}
	*/	
}

function moveSnake(xmov, ymov){
	if (auto_play){
		console.log('Move [' +auto_instruction[auto_counter] + '], ' + auto_counter + '/' + (auto_instruction.length - 1)  + ' ::: ' + (Date.now() - processing_Time))
		processing_Time = Date.now();
		xmov = auto_instruction[auto_counter][0];
		movement[0] = xmov;
		ymov = auto_instruction[auto_counter][1];
		movement[1] = ymov;
		if (auto_counter >= auto_instruction.length - 1){
			auto_counter = 0;
		}
		else{
			auto_counter++;
		}
	}
	snake_field[head_field[0]][head_field[1]] = 1;
	new_xpos = head_field[0] + xmov;
	if (new_xpos >= fields) {new_xpos -= fields;}
	else if (new_xpos < 0) {new_xpos += fields;}
	new_ypos = head_field[1] + ymov;
	if (new_ypos >= fields) {new_ypos -= fields;}
	else if (new_ypos < 0) {new_ypos += fields;}
	
	if ((snake_field[new_xpos][new_ypos] != 0 && !(movement[0] == 0 && movement[1] == 0)) && snake_field[new_xpos][new_ypos] != length + 1){
		game_won = false;
		gameOver();
	}
	else{		
		for (let i = 0; i < fields; i++){
			for (let j = 0; j < fields; j++){
				if (snake_field[j][i] >= 1){
					if (snake_field[j][i] > length){
						snake_field[j][i] = 0;
					}
					else {
						snake_field[j][i]++;
					}
				}
			}
		}
		head_field[0] = new_xpos;
		head_field[1] = new_ypos;
		last_movement = [xmov, ymov]
		
		if (fruit_field[new_xpos][new_ypos]){
			scorePoint();
			fruit_field[new_xpos][new_ypos] = false;
		}
	}
}

function gameOver(){
	if (game_won){
		console.log('Game Won!');
		drawScoreText(`You Win! Score : ${score}`);
		snake_color = 'rgb(255, 215, 0)'
		head_color = 'rgb(255, 215, 0)'
	}
	else {
		console.log('Game Over!');
		drawScoreText(`You loose. Score : ${score}`);
		snake_color = 'rgb(102, 127, 102)'
		head_color = 'rgb(79, 99, 79)'
	}
	clearInterval(gameInterval);	
	drawField();
}

function scorePoint(){
	
	if (score > 0) {
		score += scored;
	}
	else {
		score = 1;
	}
	scored++;
	length++;
	
	if (delay > 100) {
		delay -= 10;
		//clearInterval(gameInterval);
		//gameInterval = setInterval(gameLoop, delay - score);
	}
	
	console.log(`Scored! new score : ${score}pts, new delay : ${delay}`);
	drawScoreText(`Score : ${score}`);
	
	spawnFruit();
}

function drawScoreText(text){
	// Clear Canvas
	sco.beginPath()
	sco.fillStyle = 'white';
	sco.rect(0, 0, score_canvas.width, score_canvas.height);
	sco.fill();
	// Write Score Text
	sco.font = `${field_dim*0.75}px Comic Sans MS`
	sco.textAlign = 'center'
	sco.textBaseline = 'middle'
	sco.fillStyle = 'black'
	sco.fillText(text, score_canvas.width/2, score_canvas.height/2)
}

function inputHandler(key){
	if ((key == 37 || key == 65) && movement[0] == 0 && last_movement[0] == 0){ // left
		movement[0] = -1;
		movement[1] = 0;
	}
	else if ((key == 39 || key == 68) && movement[0] == 0 && last_movement[0] == 0){ // right
		movement[0] = 1;
		movement[1] = 0;
	}
	else if ((key == 38 || key == 87) && movement[1] == 0 && last_movement[1] == 0){ // up
		movement[0] = 0;
		movement[1] = -1;
	}
	else if ((key == 40 || key == 83) && movement[1] == 0 && last_movement[1] == 0){ // down
		movement[0] = 0;
		movement[1] = 1;
	}
	else if (key == 32) { // toggle pause
		paused = !paused
		if (paused) {
			clearInterval(gameInterval);
		}
		else {
			if (!gameIsOver){
				gameInterval = setInterval(gameLoop, delay)
			}
		}
	}
	else if (key == 19) { // toggle debug mode
		debug_mode = !debug_mode
	}
	if (debug_mode){
		if (key == 187) { // increase length
			length++;
		}
		else if (key == 189) { // decrease length
			length--;
		}
		if (key == 80) { // toggle autoplay
			auto_play = !auto_play;
			console.log('Auto Play = ' + auto_play)
		}
	}
	else{
		if (key == 80) { // toggle autoplay
			auto_play = false;
			console.log('Auto Play = ' + auto_play)
		}
	}
}

function gameLoop(){
	moveSnake(movement[0], movement[1])
	drawField();
	game_loop_counter++;
	
	setTimeout(gameLoop, delay);
}

drawScoreText(`Score : 0`);
spawnFruit();
drawField();
//gameInterval = setInterval(gameLoop, delay);
gameLoop();



function formFromRect(x, y, wh, type = 'rect'){
	let r = wh / 2;
	if (type == 'rect'){
		//can.rect(x * field_dim + field_border, y * field_dim + field_border, field_dim - 2 * field_border, field_dim - 2 * field_border);
		can.rect(x, y, wh, wh);
	}
	else if (type == 'arc'){
		can.arc(x + r, y + r, r, 0, 2 * Math.PI);
	}
	else if (type == 'big_arc'){
		can.arc(x + r, y + r, wh, 0, 2 * Math.PI);
	}
	else if (type == 'hex'){
		for (let i = 0; i < 6; i++){
			can.lineTo(x + r * Math.cos(2 * Math.PI / 6 * i) + r, y + r * Math.sin(2 * Math.PI / 6 * i) + r);
		}
	}
	else if (type == 'rand'){
		let rand_range = [wh*-0.05, wh*0.05]
		let rand_offset = Math.random() * (rand_range[1] - rand_range[0]) + rand_range[0]
		can.moveTo(x + rand_offset, y + rand_offset);
		rand_offset = Math.random() * (rand_range[1] - rand_range[0]) + rand_range[0]
		can.lineTo(x + wh + rand_offset, y + rand_offset);
		rand_offset = Math.random() * (rand_range[1] - rand_range[0]) + rand_range[0]
		can.lineTo(x + wh + rand_offset, y + wh + rand_offset);
		rand_offset = Math.random() * (rand_range[1] - rand_range[0]) + rand_range[0]
		can.lineTo(x + rand_offset, y + wh + rand_offset);
		can.closePath();
	}
}
