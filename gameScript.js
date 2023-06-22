"use strict"
/* CONSTANTS
 * Put all constant variables in the CONSTANTS section. 
 */
const GAME_CONTAINER = document.getElementById('main'),
    CANVAS_WIDTH = 800,
    CANVAS_HEIGHT = 600,
    CAMERA_X_OFFSET = 150,

    BACKGROUND_WIDTH = 1000,//480,
    GROUND_Y = 540,
    HORIZON_Y = 20,
    GRAVITY_PULL = 1,

    PLAYER_WIDTH = 96,
    PLAYER_HEIGHT = 96,
    PLAYER_RUN_SPEED = 5,
    PLAYER_JUMP_SPEED = 20,

    JUMP_KEY = 32;

/* SETTINGS
* In this section we put everything we need before our game can be started, such as the canvas width and image loading settings. We also put all the variable declarations used in the rest of the program here. Finally, we also place the main loop of our program here.
*/
let gameCanvas = document.createElement('canvas'),
    gameContext = gameCanvas.getContext('2d');

gameCanvas.width = CANVAS_WIDTH;
gameCanvas.height = CANVAS_HEIGHT;

GAME_CONTAINER.appendChild(gameCanvas);

// 
let cameraX = 0,
    cameraY = 0;

// 
let backgroundImage = new Image();
backgroundImage.src = "imgs/set4_hills.png";

// PLAYER
let playerImage = new Image();
playerImage.src = "imgs/platformChar_idle.png";

let playerX = (CANVAS_WIDTH / 2),
    playerY = (GROUND_Y - PLAYER_HEIGHT),
    playerXSpeed = 1,
    playerYSpeed = 0,
    isJumpPress = false,
    isJumping = false;

//
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUP);
window.addEventListener('load', init);


function init() {
    startGame();
}


function startGame() {
    window.requestAnimationFrame(gameLoop);
}
/* GAME LOOP
* This section is where keystroke processing, updating, and drawing takes place. So you would think this section is huge. Still, this part of your program is small, because we break all these things into functions that are placed in other sections. Long functions are confusing, so we break them down into smaller parts that are easier to understand. It makes no difference to your browser.
*/
function gameLoop() {
    GameUpdate();
    CanvasDraw();
    window.requestAnimationFrame(gameLoop);
}

/* PLAYER OPERATIONS
* This section will contain callbacks. As you have read before, these are functions that are called when the player presses a button.
*/
function onKeyDown (event) {
    let keyCode = event.keyCode;
    if (keyCode === JUMP_KEY) {
        isJumpPress = true;
    }
}

function onKeyUP (event) {
    let keyCode = event.keyCode;
    if (keyCode === JUMP_KEY) {
        isJumpPress = false;
    }
}


/* GAME UPDATE
* In this section we put all the code that looks at what happens and what keys the player presses. This section then adjusts the position of the character and the score.
*/
function GameUpdate() {
    // Player Run
    playerX += (playerXSpeed*PLAYER_RUN_SPEED);

    // Player Jump
    if (isJumpPress && !isJumping) {
        playerYSpeed = -PLAYER_JUMP_SPEED;
        isJumping = true;
    }

    // Update Player Y Pos
    playerY += playerYSpeed;
    playerYSpeed += GRAVITY_PULL;

    // Artificial Gravity
    if (playerY > (GROUND_Y - PLAYER_HEIGHT)) {
        playerY = GROUND_Y - PLAYER_HEIGHT;
        playerYSpeed = 0;
        isJumping = false;
    }

    // Update Camera Pos
    cameraX = playerX - CAMERA_X_OFFSET;
    cameraY = 0;
}

/* CANVAS DRAW
* this section looks at the calculations from the previous section. Then he draws everything back in the browser as it should be.
*/
function CanvasDraw() {
    // gameContext.clearRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);
    //Sky Draw
    gameContext.fillStyle = 'LightSkyBlue';
    gameContext.fillRect(0, 0, CANVAS_WIDTH, (GROUND_Y - (HORIZON_Y*2)));
    
    // Background Draw
    let backgroundX = -(cameraX % BACKGROUND_WIDTH);
    gameContext.drawImage(backgroundImage, backgroundX, HORIZON_Y);
    gameContext.drawImage(backgroundImage, (backgroundX + BACKGROUND_WIDTH), HORIZON_Y);
    
    // Ground Draw
    gameContext.fillStyle = 'ForestGreen';
    gameContext.fillRect(0, (GROUND_Y - (HORIZON_Y*2)), CANVAS_WIDTH, (CANVAS_HEIGHT - GROUND_Y + (HORIZON_Y*2)));

    // Player Image
    gameContext.drawImage(playerImage, (playerX - cameraX), (playerY - cameraY));
}