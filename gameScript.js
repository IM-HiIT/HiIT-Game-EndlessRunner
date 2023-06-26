"use strict"
/* CONSTANTS
 * Put all constant variables in the CONSTANTS section. 
 */
const GAME_CONTAINER = document.getElementById('main'),
    CANVAS_WIDTH = 800,
    CANVAS_HEIGHT = 600,
    CAMERA_X_OFFSET = 150,
    CAMERA_SHAKERADIUS = 16,

    //
    BACKGROUND_WIDTH = 1000,//480,
    GROUND_Y = 540,
    HORIZON_Y = 20,
    GRAVITY_PULL = 1,
    JUMP_KEY = 32,

    //
    PLAYER_WIDTH = 96,
    PLAYER_HEIGHT = 96,
    PLAYER_ANIM_FRAMES = 8,
    PLAYER_ANIM_SPEED = 6,
    PLAYER_RUN_SPEED = 5,
    PLAYER_JUMP_SPEED = 20,
    PLAYER_MAX_HEALTH = 100,

    //
    ENEMY_WIDTH = 46,
    ENEMY_HEIGHT = 32,
    ENEMY_ANIM_FRAMES = 4,
    ENEMY_ANIM_SPEED = 6,
    ENEMY_RUN_SPEED = 4,
    ENEMY_MIN_DIST = 400,
    ENEMY_MAX_DIST = 1200,
    ENEMY_MAX_ACTIVE = 3;

/* SETTINGS
* In this section we put everything we need before our game can be started, such as the canvas width and image loading settings. We also put all the variable declarations used in the rest of the program here. Finally, we also place the main loop of our program here.
*/
let gameCanvas = document.createElement('canvas'),
    gameContext = gameCanvas.getContext('2d');

gameCanvas.width = CANVAS_WIDTH;
gameCanvas.height = CANVAS_HEIGHT;

GAME_CONTAINER.appendChild(gameCanvas);

// Camera and Frames
let cameraX = 0,
    cameraY = 0,
    shakeCamera = false,
    gameFrameCount = 0;

// Background Image
let backgroundImage = new Image();
backgroundImage.src = "imgs/set4_hills.png";

// Level Decor Images
let shrubberyImage = new Image();
shrubberyImage.src = "imgs/platformPack_tile045.png";

let fenceImage = new Image();
fenceImage.src = "imgs/platformPack_tile037.png";

let levelDecorData = generateDecor();

// PLAYER
let playerImage = new Image();
playerImage.src = "imgs/platformerPack_character.png";

let playerX = (CANVAS_WIDTH / 2),
    playerY = (GROUND_Y - PLAYER_HEIGHT),
    playerXSpeed = 1,
    playerYSpeed = 0,
    playerHealth = PLAYER_MAX_HEALTH,
    isJumpPress = false,
    isJumping = false,

    playerFrameNum = 0,
    playerSpriteSheet = {
        framesPerRow: 4,
        spriteWidth: PLAYER_WIDTH,
        spriteHeight: PLAYER_HEIGHT,
        image: playerImage
    },
    playerCollisionBox = { /* SHOULD BE TWEAKED */
        xOffset: 60,
        yOffset: 20,
        width: 50,
        height: 200
    };

// Enemy
let enemyImage = new Image();
enemyImage.src = "imgs/enemy_spritesheet.png";
let enemySpriteSheet = {
    framesPerRow: 2,
    spriteWidth: ENEMY_WIDTH,
    spriteHeight: ENEMY_HEIGHT,
    image: enemyImage
},
    enemyData = [{
        x: 400,
        y: (GROUND_Y - ENEMY_HEIGHT),
        frameNum: 0
    }],
    enemyCollisionBox = { /* SHOULD BE TWEAKED */
        xOffset: 50,
        yOffset: 20,
        width: 50,
        height: 100
    }

// Event Listeners
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUP);
window.addEventListener('load', init);


/**
 * 
 */
function init() {
    startGame();
}

/**
 * 
 */
function startGame() {
    window.requestAnimationFrame(gameLoop);
}

/**
 * 
 * @returns 
 */
function generateDecor() {
    let generatedDecorData = [],
        decorXOffset = 0;
    while (decorXOffset < (2 * CANVAS_WIDTH)) {
        let decorImage;
        if (Math.random() >= 0.5) {
            decorImage = shrubberyImage;
        } else {
            decorImage = fenceImage;
        }

        generatedDecorData.push({
            x: decorXOffset,
            y: (80 + Math.random() * 20),
            image: decorImage
        });
        decorXOffset += (150 + Math.random() * 200)
    }
    return generatedDecorData;
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
function onKeyDown(event) {
    let keyCode = event.keyCode;
    if (keyCode === JUMP_KEY) {
        isJumpPress = true;
    }
}

function onKeyUP(event) {
    let keyCode = event.keyCode;
    if (keyCode === JUMP_KEY) {
        isJumpPress = false;
    }
}


/* GAME UPDATE
* In this section we put all the code that looks at what happens and what keys the player presses. This section then adjusts the position of the character and the score.
*/
function GameUpdate() {
    //
    gameFrameCount += 1;

    // Level Decor Update
    for (let i = 0; i < levelDecorData.length; i++) {
        if ((levelDecorData[i].x - cameraX) < -CANVAS_WIDTH) {
            levelDecorData[i].x += (2 * CANVAS_WIDTH) + 150;
        }

    }

    // Update Enemies
    updateEnemies();
    shakeCamera = false;
    let collisionOccured = updateEnemies();
    if (collisionOccured) {
        shakeCamera = true;
        if (playerHealth > 0) {
            playerHealth -= 1;
        }
    }

    function updateEnemies() {
        let collisionDetected = false;
        for (let i = 0; i < enemyData.length; i++) {
            // Collision
            if (collidingPlayerEnemy(
                playerX + playerCollisionBox.xOffset,
                playerY + playerCollisionBox.yOffset,
                playerCollisionBox.width,
                playerCollisionBox.height,
                enemyData[i].x + enemyCollisionBox.xOffset,
                enemyData[i].y + enemyCollisionBox.yOffset,
                enemyCollisionBox.width,
                enemyCollisionBox.height)) {
                collisionDetected = true;
            }
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
        //
        return collisionDetected;
    }

    // Player Run
    playerX += (playerXSpeed * PLAYER_RUN_SPEED);

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

    // Animations Update
    if ((gameFrameCount % PLAYER_ANIM_SPEED) === 0) {
        playerFrameNum += 1;
        if (playerFrameNum >= PLAYER_ANIM_FRAMES) {
            playerFrameNum = 0;
        }
    }

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
    //Sky Draw
    gameContext.fillStyle = 'LightSkyBlue';
    gameContext.fillRect(0, 0, CANVAS_WIDTH, (GROUND_Y - (HORIZON_Y * 2)));

    // Background Draw
    let backgroundX = -(cameraX % BACKGROUND_WIDTH);
    gameContext.drawImage(backgroundImage, backgroundX, HORIZON_Y);
    gameContext.drawImage(backgroundImage, (backgroundX + BACKGROUND_WIDTH), HORIZON_Y);

    // Ground Draw
    gameContext.fillStyle = 'ForestGreen';
    gameContext.fillRect(0, (GROUND_Y - (HORIZON_Y * 2)), CANVAS_WIDTH, (CANVAS_HEIGHT - GROUND_Y + (HORIZON_Y * 2)));

    // Level Decor Draw
    for (let i = 0; i < levelDecorData.length; i++) {
        gameContext.drawImage(levelDecorData[i].image, (levelDecorData[i].x - camShakeX), (GROUND_Y - levelDecorData[i].y - camShakeY));
    }

    // Enemies
    for (let i = 0; i < enemyData.length; i++) {
        drawAnimatedSprite(
            enemyData[i].x - cameraX,
            enemyData[i].y - cameraY,
            enemyData[i].frameNum,
            enemySpriteSheet
        );
    }

    // Player
    drawAnimatedSprite(
        playerX - camShakeX,
        playerY - camShakeY,
        playerFrameNum,
        playerSpriteSheet
    );

    // HealthBar UI
    gameContext.fillStyle = 'red';
    gameContext.fillRect(400, 10, playerHealth / PLAYER_MAX_HEALTH * 380, 20);
    gameContext.strokeStyle = 'red';
    gameContext.strokeRect(400, 10, 380, 20);

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
}