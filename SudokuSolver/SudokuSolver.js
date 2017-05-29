var WIDTH = 800;
var HEIGHT = 600;
var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var GRID_BOTTOM = 552;
var GRID_TOP = 48;
var GRID_LEFT = 40;
var GRID_RIGHT = 760;
var gridLines = [];
var numberGrid = [];
var texts = [];			
var clueGrid = [];
var clickDown = false;
var editMode = false;
var gridChange = false;

var xInc = (GRID_RIGHT-GRID_LEFT)/9;
var yInc = (GRID_BOTTOM-GRID_TOP)/9;

function preload() {

	game.load.image('bg', 'assets/sky.png');
	game.load.image('btn', 'assets/diamond.png');
	game.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
	
}

function create() {

	back = game.add.image(0, -400, 'bg');
	back.scale.set(2);
	// game.stage.backgroundColor = "#4488AA";
	
	createGrid();
	drawGrid();
	numberGrid = clone(emptyGrid);
	createClueGrid();
	drawNumbers();
	
	solveBtn = game.add.button(game.world.centerX - 30, 560, 'btn', solveAndDraw, this, 2, 1, 0);
	puzzle1Btn = game.add.button(game.world.centerX - 300, 10, 'btn', switchPuzOne, this, 2, 1, 0);
	puzzle2Btn = game.add.button(game.world.centerX - 250, 10, 'btn', switchPuzTwo, this, 2, 1, 0);
	puzzle3Btn = game.add.button(game.world.centerX - 200, 10, 'btn', switchPuzThree, this, 2, 1, 0);
	puzzle4Btn = game.add.button(game.world.centerX - 150, 10, 'btn', switchPuzFour, this, 2, 1, 0);
	puzzle5Btn = game.add.button(game.world.centerX - 100, 10, 'btn', switchPuzFive, this, 2, 1, 0);
	editBtn = game.add.button(game.world.centerX, 10, 'btn', switchPuzEdit, this, 2, 1, 0);
	
	
}

function switchPuzOne(){
	switchPuzzle(1);
	editMode = false;
	console.log("switching to puzzle 1");
}

function switchPuzTwo(){
	switchPuzzle(2);
	editMode = false;
	console.log("switching to puzzle 2");
}

function switchPuzThree(){
	switchPuzzle(3);
	editMode = false;
	console.log("switching to puzzle 3");
}

function switchPuzFour(){
	switchPuzzle(4);
	editMode = false;
	console.log("switching to puzzle 4");
}
function switchPuzFive(){
	switchPuzzle(5);
	editMode = false;
	console.log("switching to puzzle 5");
}

function switchPuzEdit(){
	switchPuzzle(0);
	editMode = true;
	console.log("switching to edit puzzle");
}

//switches what puzzle is current
function switchPuzzle(puzNum){
	numberGrid = clone(puzzles[puzNum]);
	createClueGrid();
	drawNumbers();
}

function clone (existingArray) {
   var newObj = (existingArray instanceof Array) ? [] : {};
   for (i in existingArray) {
      if (i == 'clone') continue;
      if (existingArray[i] && typeof existingArray[i] == "object") {
         newObj[i] = clone(existingArray[i]);
      } else {
         newObj[i] = existingArray[i]
      }
   }
   return newObj;
}

function solveAndDraw(){
	solveClueGrid();
	solveGrid();
	console.log(clueGrid);
	if(gridChange === false){
		for(i=0;i<numberGrid.length;i++){
			for(j=0;j<numberGrid.length;j++){
				if(numberGrid[i][j]===-1){
					solveSquareHV(i,j);
				}
			}
		}
	}
	drawNumbers();
	gridChange=false;
}

//initialize grid lines array
function createGrid(){
	for (i=1;i<=10;i++){
		gridLines.push(new Phaser.Line(xInc*i-xInc/2, GRID_TOP, xInc*i-xInc/2, GRID_BOTTOM));
		gridLines.push(new Phaser.Line(GRID_LEFT, yInc*i-8, GRID_RIGHT, yInc*i-8));
	}
}

//initializes answer/clue grid with full 1-9 possible numbers
function createClueGrid(){
	for(i=0;i<(gridLines.length/2)-1;i++){
		clueGrid[i] = []
		for(j=0;j<(gridLines.length/2)-1;j++){
			clue = new Object();
			clue.availableNumbers = [1,2,3,4,5,6,7,8,9];
			clueGrid[i][j] = clue;
		}
	}
}

//draw numbers in grid
function drawNumbers(){
	//remove previous numbers
	if(texts!==null){
		for(z=0;z<texts.length;z++){
			texts[z].destroy();
		}
	}
	//draw current numbers
	for(i=1;i<gridLines.length/2;i++){
		for(j=1;j<gridLines.length/2;j++){
			if(numberGrid[i-1][j-1] === -1){
				texts[(i-1)*9+(j-1)] = game.add.text((xInc*j)-5, (yInc*i)+5, "-");
			}
			else{
				texts[(i-1)*9+(j-1)] = game.add.text((xInc*j)-5, (yInc*i)+5, numberGrid[i-1][j-1]);
			}
		}
	}
}

//draw lines of grid
function drawGrid() {
	for (x=0;x<gridLines.length;x++){
		if(x%6===0 || (x-1)%6===0){
			game.debug.geom(gridLines[x], "#ffffff");
		}
		else{
			game.debug.geom(gridLines[x], "#000000");
		}
	}
}

//solve the sudoku puzzle, 1 iteration through
function solveGrid(){
	for(a=0;a<numberGrid.length;a++){
		for(b=0;b<numberGrid.length;b++){
			if(numberGrid[a][b]===-1 && clueGrid[a][b].availableNumbers.length===1){
				numberGrid[a][b] = clueGrid[a][b].availableNumbers[0];
			}
		}
	}
}

//solve the clue grid 
function solveClueGrid(){
	for(i=0;i<numberGrid.length;i++){
		for(j=0;j<numberGrid.length;j++){
			solveClueHoriz(i,j);
			solveClueVert(i,j);
			solveClueUnit(i,j);
		}
	}
	solveUnits();

}

//solve clue grid horizontally
function solveClueHoriz(x,y){	
	if(numberGrid[x][y]!==-1){
		clueGrid[x][y].availableNumbers = new Array(numberGrid[x][y]);
	}
	else{
		for(k=0;k<numberGrid.length;k++){
			if(k!==y && numberGrid[x][k]!==-1){
				if(clueGrid[x][y].availableNumbers.includes(numberGrid[x][k])){
					clueGrid[x][y].availableNumbers.splice(clueGrid[x][y].availableNumbers.indexOf(numberGrid[x][k]),1);
				}
			}
			
		}
	}
}

//solve clue grid vertically
function solveClueVert(x,y){
	if(numberGrid[x][y]!==-1){
		clueGrid[x][y].availableNumbers = new Array(numberGrid[x][y]);
	}
	else{
		for(k=0;k<numberGrid.length;k++){
			if(k!==x && numberGrid[k][y]!==-1){
				if(clueGrid[x][y].availableNumbers.includes(numberGrid[k][y])){
					clueGrid[x][y].availableNumbers.splice(clueGrid[x][y].availableNumbers.indexOf(numberGrid[k][y]),1);
				}
			}
		}
	}
}

//solve 1 unit/3x3 block
function solveClueUnit(x1,y1){
	var xMin, yMin;
	if(x1<3){xMin=0;}
	else if(x1<6){xMin=3;}
	else{xMin=6;}
	if(y1<3){yMin=0;}
	else if(y1<6){yMin=3;}
	else{yMin=6;}
	for(a=xMin;a<xMin+3;a++){
		for(b=yMin;b<yMin+3;b++){
			if(numberGrid[a][b]!==-1){
				if(clueGrid[x1][y1].availableNumbers.length > 1 && clueGrid[x1][y1].availableNumbers.includes(numberGrid[a][b])){
					clueGrid[x1][y1].availableNumbers.splice(clueGrid[x1][y1].availableNumbers.indexOf(numberGrid[a][b]),1);
				}
			}
		}
	}
	
}

//solve all 9 units of the puzzle based off the clue grid
function solveUnits(){
	for(i=0;i<9;i+=3){
		for(j=0;j<9;j+=3){
			solveUnit(i,j);
		}
	}
}

//solve 1 units of the puzzle
function solveUnit(x,y){
	for(m=x;m<x+3;m++){
		for(n=y;n<y+3;n++){
			if(numberGrid[m][n]===-1){
				solveSquare(m,n);
			}
		}
	}
}

//solve 1 square of the puzzle
function solveSquare(x1,y1){
	var xMin, yMin;
	if(x1<3){xMin=0;}
	else if(x1<6){xMin=3;}
	else{xMin=6;}
	if(y1<3){yMin=0;}
	else if(y1<6){yMin=3;}
	else{yMin=6;}
	var availableNumbers = clueGrid[x1][y1].availableNumbers.slice();
	for(a=xMin;a<xMin+3;a++){
		for(b=yMin;b<yMin+3;b++){
			if((a!==x1 || b!==y1) && numberGrid[a][b]===-1){
				for(c=availableNumbers.length-1;c>=0;c--){
					if(clueGrid[a][b].availableNumbers.includes(availableNumbers[c])){
						availableNumbers.splice(c,1);
					}
				}
			}
		}
	}
	if(availableNumbers.length===1){
		console.log("x1=" + y1 + " y1=" + x1 + " number=" + availableNumbers);
		numberGrid[x1][y1] = availableNumbers[0];
		clueGrid[x1][y1].availableNumbers = availableNumbers.slice();
		gridChange = true;
	}
}
	
function solveSquareHV(x2,y2){

	//check horiz/vert availableNumbers
	availableNumbers = clueGrid[x2][y2].availableNumbers.slice();
	for(k=0;k<numberGrid.length;k++){
		if(k!==y2 ){//&& numberGrid[x2][k]===-1){
			for(c=availableNumbers.length-1;c>=0;c--){
				if(clueGrid[x2][k].availableNumbers.includes(availableNumbers[c])){
					availableNumbers.splice(c,1);
				}
			}
		}
		
	}
	
	if(availableNumbers.length===1){
		// console.log("x1=" + y1 + " y1=" + x1 + " number=" + availableNumbers);
		numberGrid[x2][y2] = availableNumbers[0];
		clueGrid[x2][y2].availableNumbers = availableNumbers.slice();
		gridChange = true;
	}
	
	//check horiz/vert availableNumbers
	if(gridChange===false){
		availableNumbers = clueGrid[x2][y2].availableNumbers.slice();
		for(k=0;k<numberGrid.length;k++){
			if(k!==x2 ){//&& numberGrid[k][y2]===-1){
				for(c=availableNumbers.length-1;c>=0;c--){
					if(clueGrid[k][y2].availableNumbers.includes(availableNumbers[c])){
						availableNumbers.splice(c,1);
					}
				}
			}
			
		}
		
		if(availableNumbers.length===1){
			// console.log("x1=" + y1 + " y1=" + x1 + " number=" + availableNumbers);
			numberGrid[x2][y2] = availableNumbers[0];
			clueGrid[x2][y2].availableNumbers = availableNumbers.slice();
			gridChange = true;
		}
	}
}

function update() {
	if(editMode){
		if(game.input.activePointer.isDown && !clickDown){
			editPuzzle();
			clickDown = true;
		}
		else if(!game.input.activePointer.isDown && clickDown){
			clickDown = false;
		}
	}
}

//increases a number in the empty sudoku puzzle
function editPuzzle(){
	var x = game.input.activePointer.x;
	var y = game.input.activePointer.y;
	if(!clickDown && GRID_LEFT<x && x<GRID_RIGHT && GRID_TOP<y && y<GRID_BOTTOM){
		console.log(x);
		x = Math.round((x) / xInc);
		y = Math.round((y-GRID_LEFT/2) / yInc);
		console.log(x + " " + y);
		if(numberGrid[y-1][x-1]===-1){
			numberGrid[y-1][x-1] = 1;
		}
		else if(numberGrid[y-1][x-1]<9){
			numberGrid[y-1][x-1]++;
		}
		else{
			numberGrid[y-1][x-1] = -1;
		}
		drawNumbers();
	}
}

function render() {
	
}

