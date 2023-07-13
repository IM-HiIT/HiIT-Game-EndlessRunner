"use strict"
//
let debugMode = true;

/* CONSTANTS
 * Put all constant variables in the CONSTANTS section. 
 */
const GAME_CONTAINER = document.getElementById('main'), // Element to draw Canvas in
    MODE_PLAY = 0,          // Play Game Mode
    MODE_GAMEOVER = 1,      // Game Over Mode
    MODE_PAUSE = 2,         // Pause Game Mode

    // Camera and Canvas Globals
    CANVAS_WIDTH = 800,         // Width of Game Canves
    CANVAS_HEIGHT = 600,        // Height of Game Canvas
    CAMERA_X_OFFSET = 150,      // Camera Offset on X to keep Player in Center Screen
    CAMERA_SHAKERADIUS = 16,    // Radius of the Camera Shake on Collision

    // World Globals
    BACKGROUND_WIDTH = 1000,    // Width of the Background Image
    GROUND_Y = 540,             // Ground Y position for Jumping
    HORIZON_Y = 20,             // Horizon Y position for GameWorld positions
    GRAVITY_PULL = 1,           // Pull of Gravity
    JUMP_KEY = 87,              // Jump with "W"-key
    SLIDE_KEY = 83,             // Slide with "S"-key
    PAUSE_KEY = 81,             // Pause/Unpause with "Q"-key

    // Player Globals
    PLAYER_WIDTH = 96,          // Player Sprite Width
    PLAYER_HEIGHT = 96,         // Player Spirte Height
    PLAYER_ANIM_FRAMES = 8,     // Number of Animation Frames in SpriteSheet
    PLAYER_ANIM_SPEED = 6,      // Speed of Animation Cycle
    PLAYER_RUN_SPEED = 5,       // Run Speed of Player
    PLAYER_JUMP_SPEED = 20,     // Jump Force of Player
    PLAYER_MAX_HEALTH = 10,     // Max Health of Player


    // Enemy Globals
    //Walking: 50x45, Flying: 64x43, Swimming: 64x32
    ENEMY_WIDTH = 50,           // Width of Enemy Sprite
    ENEMY_HEIGHT = 45,          // Height of Enemy Sprite
    ENEMY_ANIM_FRAMES = 4,      // Number of Animation Frames in SpriteSheet
    ENEMY_ANIM_SPEED = 6,       // Speed of Animation Cycle
    ENEMY_RUN_SPEED = 4,        // Run Speed of Enemy
    ENEMY_MIN_DIST = 400,       // Minimal Distance between Enemy Spawn Locations
    ENEMY_MAX_DIST = 1200,      // Maximal Distance between Enemy Spawn Locations
    ENEMY_MAX_ACTIVE = 3;       // Maximal Number of Enemies to Spawn Active

/* SETTINGS
* In this section we put everything we need before our game can be started, such as the canvas width and image loading settings. 
We also put all the variable declarations used in the rest of the program here. 
Finally, we also place the main loop of our program here.
*/
let gameCanvas = document.createElement('canvas'),  // Create the Game Canvas
    gameContext = gameCanvas.getContext('2d');      // 2D Game Canvas
gameCanvas.width = CANVAS_WIDTH;                    // Set Width of Game Canvas
gameCanvas.height = CANVAS_HEIGHT;                  // Set Height of Game Canvas
GAME_CONTAINER.appendChild(gameCanvas);             // Add Game Canvas to Page

let gameMode = MODE_PLAY;           // Current Game Mode (Play, GameOver, Pause)

// Camera and Frames
let cameraX = 0,                    // Camera X Position
    cameraY = 0,                    // Camera Y Position
    shakeCamera = false,            // Shake Camera on Hit
    gameFrameCount = 0;             // Number of Game Frames

// Background Image
let backgroundImage1 = new Image();                 // New Background Sprite
backgroundImage1.src = "imgs/lvl_hills1.png";       // Set Source of Background Sprite
let backgroundImage2 = new Image();                 // New Background Sprite
backgroundImage2.src = "imgs/lvl_hills2.png";       // Set Source of Background Sprite

// Level Decor Images
let shrubberyImage1 = new Image();                  // New Level Decor Sprite
shrubberyImage1.src = "imgs/lvl_shrub1.png";        // Set Source of Decor Sprite
let shrubberyImage2 = new Image();                  // New Level Decor Sprite
shrubberyImage2.src = "imgs/lvl_shrub2.png";        // Set Source of Decor Sprite
let fenceImage = new Image();                       // New Level Decor Sprite
fenceImage.src = "imgs/lvl_fence.png";              // Set Source of Decor Sprite
let levelDecorData = generateDecor();               // Get a random Array of Decor for GameWorld

// PLAYER
let playerImage = new Image();                          // New Player Sprite
playerImage.src = "imgs/platformerPack_character.png";  // Set SpriteSheet Source

let playerX = (CANVAS_WIDTH / 2),           // Position of Player on X Axis (Center Screen)
    playerY = (GROUND_Y - PLAYER_HEIGHT),   // Position of Player on Y Axis (On Ground Floor)
    playerXDirection = 1,                   // Direction of Player Movement on X Axis
    playerYSpeed = 0,                       // Fall and Jump Speed of Player on Y Axis
    playerHealth = PLAYER_MAX_HEALTH,       // Set Current Player Health to Max
    isJumpPress = false,                    // Check if Jumping Button is Pressed
    isJumping = false,                      // Check if Currently already Jumping (Prevents Double Jump)
    playerFrameNum = 0,                     // Current Number of Animation Frame
    playerSpriteSheet = {                   // Players SpriteSheet Data
        framesPerRow: 4,                    // Number of Animation Frames per SpriteSheet Row
        spriteWidth: PLAYER_WIDTH,          // Set Sprite Width
        spriteHeight: PLAYER_HEIGHT,        // Set Sprite Height
        image: playerImage                  // Set Sprite Image
    },
    playerCollisionBox = {                  // Players Collision Box Data
        xOffset: 20, //60,                  // X Axis Offset of Collision Box
        yOffset: 40, //20,                  // Y Axis Offset of Collision Box
        width: 50,                          // Width of Collision Box
        height: 50 //200                    // Height of Collision Box
    };

// Enemy
let enemyImage = new Image();                           // New Enemey Sprite
enemyImage.src = "imgs/spritesheet_Enemy_Walking.png";  // Set SpriteSheet Source
let enemySpriteSheet = {                    // Enemy SpriteSheet Data
    framesPerRow: 4,                        // Number of Animation Frames per SpriteSheet Row
    spriteWidth: ENEMY_WIDTH,               // Set Sprite Width 
    spriteHeight: ENEMY_HEIGHT,             // Set Sprite Height
    image: enemyImage                       // Set Sprite Image
},
    enemyData = [{                          // Singular Enemy Data
        x: 2000,                            // Spawn Position X at start
        y: (GROUND_Y - ENEMY_HEIGHT),       // Set enemy on Ground
        frameNum: 0                         // Current Number of Animation Frame 
    }],
    enemyCollisionBox = {                   // Enemy Collision Box Data
        xOffset: 10,//55,                   // X Axis Offset of Collision Box
        yOffset: 10, //20,                  // Y Axis Offset of Collision Box
        width: 30,//50,                     // Width of Collision Box
        height: 30//100                     // Height of Collision Box
    }

// Event Listeners
window.addEventListener('keydown', onKeyDown);      // Add Keydown EventListener to Page Window
window.addEventListener('keyup', onKeyUP);          // Add KeyUp EventLinstener to Page Window
window.addEventListener('load', init);              // Add Load function to Page
gameCanvas.addEventListener('click', modeSwitch);   // Add Click function to Game Canvas

/** Initialize the Page
 * Starts the Game
 */
function init() {
    startGame();
}

/** Mode Switch
 * Switches between Gameplay Modes, ie. Play / GameOver / Pause.
 * Resets the Game on GameOver
 */
function modeSwitch() {
    switch (gameMode) {             // Switch the Game Mode
        case MODE_PAUSE:            // If Game is Paused
            gameMode = MODE_PLAY;   // Play the Game
            break;                  // Break out of the Switch
        case MODE_PLAY:             // If Game is Playing
            gameMode = MODE_PAUSE;  // Pause the Game
            break;                  // Break out of the Switch
        case MODE_GAMEOVER:         // If Game Over
            resetGame();            // Reset the Game
            break;                  // Break out of the Switch
        default: MODE_GAMEOVER;     // On Default GameOver and Reset
            break;                  // Break out of the Switch
    }
}

/** Reset Game
 * Resets Player Health, Player X Position and Restarts the Gameplay
 */
function resetGame() {
    playerHealth = PLAYER_MAX_HEALTH;   // Reset the Players Current Health to Max Health
    playerX = 0;                        // Reset the Players X position
    gameMode = MODE_PLAY;               // Set GameMode to Play
}

/** Start Game
 * Pause Game on Start
 * Request Animation Frames for the GameLoop (60fps)
 */
function startGame() {
    gameMode = MODE_PAUSE;                     // Set Game to Pause
    window.requestAnimationFrame(gameLoop);    // Start the GameLoop with 60fps
}

/** Generate World Decor
 * Get a random Decor Image and set a semirandom Y Position
 * @returns generated Decor Data - Random World Decor Images on X and Y Position
 */
function generateDecor() {
    let generatedDecorData = [],                    // Generated Data to Return
        decorXOffset = 0;                           // Reset Decor X offset
    while (decorXOffset < (2 * CANVAS_WIDTH)) {     // While the Decor X offset is smaller than 2times the CanvasWidth (ie. outside screen)
        let decorImage;                             // New temporary Decor Image
        if (Math.random() < 0.33) {                 // If Random is less than 33%
            decorImage = shrubberyImage1;           // Random Decor is Shrubbery 1
        } else if (Math.random() > 0.66) {          // if Random is more than 66%
            decorImage = shrubberyImage2;           // Random Decor is Shrubbery 2
        } else {                                    // Otherwise
            decorImage = fenceImage;                // Random Decor is Fence
        }
        generatedDecorData.push({                   // Push the new temporary Decor Image to the Data
            x: decorXOffset,                        // Set a new X position
            y: (80 + Math.random() * 20),           // Set a semi random Y Position
            image: decorImage                       // Set the Chosen decor Image
        });
        decorXOffset += (150 + Math.random() * 200) // ???
    }
    return generatedDecorData;                      // Return the Decor
}

/* GAME LOOP
* This section is where keystroke processing, updating, and drawing takes place. So you would think this section is huge.
Still, this part of your program is small, because we break all these things into functions that are placed in other sections. 
Long functions are confusing, so we break them down into smaller parts that are easier to understand. It makes no difference to your browser.
*/
function gameLoop() {
    GameUpdate();                               // Update the Game Logics
    CanvasDraw();                               // Draw the Game
    window.requestAnimationFrame(gameLoop);     // Request GameLoop Again
}

/* PLAYER OPERATIONS
* This section will contain callbacks. As you have read before, these are functions that are called when the player presses a button.
*/
function onKeyDown(event) {         // When a KB-Button is pressed
    let keyCode = event.keyCode;    // Get what KB-Button is Pressed
    if (keyCode === JUMP_KEY) {     // If JumpButton was pressed
        isJumpPress = true;         // JumpButton is pressed
    }
    if (keyCode === PAUSE_KEY) {    // If the Pause Button was Pressed
        modeSwitch();               // Switch Game mode from Unpause/Paused
    }
}

function onKeyUP(event) {           // When a KB-Button is released
    let keyCode = event.keyCode;    // Get what KB-Button was released
    if (keyCode === JUMP_KEY) {     // If JumpButton was released
        isJumpPress = false;        // JumpButton is nolonger pressed
    }
}


/* GAME UPDATE
* In this section we put all the code that looks at what happens and what keys the player presses. This section then adjusts the position of the character and the score.
*/
function GameUpdate() {
    if (gameMode != MODE_PLAY) {    // If the Game is not Playing
        return;                     // Return out of the Loop
    }
    gameFrameCount += 1;            // Update the FrameCounter each Loop Cycle
    updateLevelDecor();             // World Decor Update
    updateEnemyMove();              // Update Enemies
    updateEnemyCollision();         // Enemy Collision Update
    updateCollision();              // Collision Update
    updatePlayerHealth();           // Player Health Update
    updatePlayerMove();             // Player Movement Update
    updatePlayerAnim();             // Player Animation Update
    updateCamera();                 // Update Camera
}

// Enemy Update
function updateEnemyMove() {
    for (let i = 0; i < enemyData.length; i++) {
        // Movement
        enemyData[i].x -= ENEMY_RUN_SPEED;
        // Animation
        if ((gameFrameCount % ENEMY_ANIM_SPEED) === 0) {
            enemyData[i].frameNum += 1;
            if (enemyData[i].frameNum >= ENEMY_ANIM_FRAMES) {
                enemyData[i].frameNum = 0;
            }
        }
    }
    // Remove Out-of-Bound Enemies
    let enemyIndex = 0;
    while (enemyIndex < enemyData.length) {
        if (enemyData[enemyIndex].x < cameraX - ENEMY_WIDTH) {
            enemyData.splice(enemyIndex, 1);
        } else {
            enemyIndex += 1;
        }
    }
    // Position Max Active Enemies, with Distance between
    if (enemyData.length < ENEMY_MAX_ACTIVE) {
        let lastEnemyX = CANVAS_WIDTH;
        if (enemyData.length > 0) {
            lastEnemyX = enemyData[enemyData.length - 1].x;
        }
        let newEnemyX = lastEnemyX + ENEMY_MIN_DIST + Math.random() * (ENEMY_MAX_DIST - ENEMY_MIN_DIST);
        enemyData.push({
            x: newEnemyX,
            y: GROUND_Y - ENEMY_HEIGHT,
            frameNum: 0
        });
    }
}

//
function updateEnemyCollision() {
    let collisionDetected = false;
    for (let i = 0; i < enemyData.length; i++) {
        // Collision
        if (collidingPlayerEnemy(playerX + playerCollisionBox.xOffset, playerY + playerCollisionBox.yOffset,
            playerCollisionBox.width, playerCollisionBox.height,
            enemyData[i].x + enemyCollisionBox.xOffset, enemyData[i].y + enemyCollisionBox.yOffset,
            enemyCollisionBox.width, enemyCollisionBox.height)) {
            collisionDetected = true;
        }
    }
    //
    return collisionDetected;
}
// Collision Detection
function collisionDetection(playerMinX, playerMaxX, enemyMinX, enemyMaxX) {
    let collisionMin = (playerMaxX >= enemyMinX) && (playerMaxX <= enemyMaxX),
        collisionMax = (playerMinX >= enemyMinX) && (playerMinX <= enemyMaxX),
        collisionFull = (playerMinX <= enemyMinX) && (playerMaxX >= enemyMaxX);
    return collisionMin || collisionMax || collisionFull;
}
//
function collidingPlayerEnemy(playerX, playerY, playerWidth, playerHeight, enemyX, enemyY, enemyWidth, enemyHeight) {
    let collideXAxis = collisionDetection(playerX, playerX + playerWidth, enemyX, enemyX + enemyWidth),
        collideYAxis = collisionDetection(playerY, playerY + playerHeight, enemyY, enemyY + enemyHeight);
    return collideXAxis && collideYAxis;
}
// Collision Update
function updateCollision() {
    shakeCamera = false;
    let collisionOccured = updateEnemyCollision();
    if (collisionOccured) {
        shakeCamera = true;
        if (playerHealth > 0) {
            playerHealth -= 1;
        }
    }
}
// 
function updateLevelDecor() {
    // Level Decor Update
    for (let i = 0; i < levelDecorData.length; i++) {
        if ((levelDecorData[i].x - cameraX) < -CANVAS_WIDTH) {
            levelDecorData[i].x += (2 * CANVAS_WIDTH) + 150;
        }

    }
}
//
function updatePlayerMove() {

    // Player Run
    playerX += (playerXDirection * PLAYER_RUN_SPEED);

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

}
//
function updatePlayerAnim() {
    // Animations Update
    if ((gameFrameCount % PLAYER_ANIM_SPEED) === 0) {
        playerFrameNum += 1;
        // RUNNING ANIM FRAMES = 2/4
        if (playerFrameNum >= PLAYER_ANIM_FRAMES || playerFrameNum >= 4) {
            playerFrameNum = 2;
        }
        if (isJumping) {
            playerFrameNum = 1;
        } // else if (LANDING ANIM) {// playerFrameNum = 6;}
    }
}
//
function updatePlayerHealth() {
    // Game Over State
    if (playerHealth <= 0) {
        gameMode = MODE_GAMEOVER;
        shakeCamera = false;
    }
}
//
function updateCamera() {
    // Update Camera Pos
    cameraX = playerX - CAMERA_X_OFFSET;
    cameraY = 0;
}

/* CANVAS DRAW
* this section looks at the calculations from the previous section. Then he draws everything back in the browser as it should be.
*/
function CanvasDraw() {
    // 
    let camShakeX = cameraX,
        camShakeY = cameraY;
    if (shakeCamera) {
        //
        camShakeX += (Math.random() - 0.5) * CAMERA_SHAKERADIUS;
        camShakeY += (Math.random() - 0.5) * CAMERA_SHAKERADIUS;
    }

    drawGameWorld(camShakeX, camShakeY);

    // Enemies
    for (let i = 0; i < enemyData.length; i++) {
        drawAnimatedSprite(
            enemyData[i].x - camShakeX,
            enemyData[i].y - camShakeY,
            enemyData[i].frameNum,
            enemySpriteSheet
        );

        if (debugMode) {
            gameContext.strokeStyle = 'red';
            gameContext.strokeRect(enemyData[i].x + enemyCollisionBox.xOffset - camShakeX, enemyData[i].y + enemyCollisionBox.yOffset - camShakeY, enemyCollisionBox.width, enemyCollisionBox.height);
        }
    }

    // Player
    drawAnimatedSprite(
        playerX - camShakeX,
        playerY - camShakeY,
        playerFrameNum,
        playerSpriteSheet
    );

    drawGUI();

    if (debugMode) {
        /// DEBUGGING HITBOXES
        gameContext.strokeStyle = 'red';
        gameContext.strokeRect(playerX + playerCollisionBox.xOffset - camShakeX, playerY + playerCollisionBox.yOffset - camShakeY, playerCollisionBox.width, playerCollisionBox.height,);
    }
}

// Draw Game World
function drawGameWorld(camShakeX, camShakeY) {
    //Sky Draw
    gameContext.fillStyle = 'LightSkyBlue';
    gameContext.fillRect(0, 0, CANVAS_WIDTH, (GROUND_Y - (HORIZON_Y * 2)));

    // Background Draw
    let backgroundX = -(camShakeX % BACKGROUND_WIDTH);
    gameContext.drawImage(backgroundImage2, backgroundX, HORIZON_Y);
    gameContext.drawImage(backgroundImage1, (backgroundX + BACKGROUND_WIDTH), HORIZON_Y);

    // Ground Draw
    gameContext.fillStyle = 'ForestGreen';
    gameContext.fillRect(0, (GROUND_Y - (HORIZON_Y * 2)), CANVAS_WIDTH, (CANVAS_HEIGHT - GROUND_Y + (HORIZON_Y * 2)));

    // Level Decor Draw
    for (let i = 0; i < levelDecorData.length; i++) {
        gameContext.drawImage(levelDecorData[i].image, (levelDecorData[i].x - camShakeX), (GROUND_Y - levelDecorData[i].y - camShakeY));
    }

}

function drawGUI() {
    // Player Points System
    let playerDistance = playerX / 1000; // Distance of Pixel divided bij 1000 is "1 meter"
    gameContext.fillStyle = 'gold';
    gameContext.font = '48px sans-serif';
    gameContext.fillText(playerDistance.toFixed(0) + "m", 20, 40);

    // HealthBar UI
    gameContext.fillStyle = 'red';
    gameContext.fillRect(400, 10, playerHealth / PLAYER_MAX_HEALTH * 380, 20);
    gameContext.strokeStyle = 'red';
    gameContext.strokeRect(400, 10, 380, 20);

    // Game Pause Text
    if (gameMode == MODE_PAUSE) {
        gameContext.fillStyle = 'black';
        gameContext.font = '96px sans-serif';
        //gameContext.fillText('PAUSED', 120, 200);
        gameContext.fillText('PAUSED', 170, CANVAS_HEIGHT / 2);
    }

    // Game-Over screen
    if (gameMode == MODE_GAMEOVER) {
        gameContext.fillStyle = 'black';
        gameContext.font = '96px sans-serif';
        gameContext.fillText('GAME OVER', 110, CANVAS_HEIGHT / 2 - 20);

        gameContext.font = '48px sans-serif';
        gameContext.fillText('PRESS Q or CLICK TO RESTART', 25, CANVAS_HEIGHT / 2 + 20);
    }
}

// Animate Sprites
function drawAnimatedSprite(screenX, screenY, frameNum, spriteSheet) {
    let spriteSheetRow = Math.floor(frameNum / spriteSheet.framesPerRow),
        spriteSheetColomn = frameNum % spriteSheet.framesPerRow,
        spriteSheetX = spriteSheetColomn * spriteSheet.spriteWidth,
        spriteSheetY = spriteSheetRow * spriteSheet.spriteHeight;

    gameContext.drawImage(spriteSheet.image, spriteSheetX, spriteSheetY,
        spriteSheet.spriteWidth, spriteSheet.spriteHeight,
        screenX, screenY,
        spriteSheet.spriteWidth, spriteSheet.spriteHeight);
}