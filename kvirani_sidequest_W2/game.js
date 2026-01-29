
let player = {
    x: 100,
    y: 450,
    radius: 25,
    velocityX: 0,
    velocityY: 0,
    speed: 8,
    jumpForce: 35, 
    onGround: false,
    hue: 190, 
    squashAmount: 1,
    targetSquash: 1,
    bounceOffset: 0 
};

\\
const gravity = 0.8; 
const friction = 0.8;
const airResistance = 0.95;
let platforms = [];
let time = 0;
let colorPulseTime = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);

    platforms = [
        { x: 0, y: height - 30, width: width, height: 30, col: color(210, 45, 35) },
        { x: width * 0.15, y: height * 0.75, width: 120, height: 20, col: color(355, 76, 92) },
        { x: width * 0.4, y: height * 0.6, width: 130, height: 20, col: color(25, 80, 94) },
        { x: width * 0.65, y: height * 0.45, width: 140, height: 20, col: color(48, 100, 100) },
        { x: width * 0.35, y: height * 0.3, width: 120, height: 20, col: color(355, 76, 92) },
        { x: width * 0.7, y: height * 0.2, width: 150, height: 20, col: color(25, 80, 94) },
        { x: width * 0.05, y: height * 0.5, width: 100, height: 20, col: color(48, 100, 100) }
    ];
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    platforms = [
        { x: 0, y: height - 30, width: width, height: 30, col: color(210, 45, 35) },
        { x: width * 0.15, y: height * 0.75, width: 120, height: 20, col: color(355, 76, 92) },
        { x: width * 0.4, y: height * 0.6, width: 130, height: 20, col: color(25, 80, 94) },
        { x: width * 0.65, y: height * 0.45, width: 140, height: 20, col: color(48, 100, 100) },
        { x: width * 0.35, y: height * 0.3, width: 120, height: 20, col: color(355, 76, 92) },
        { x: width * 0.7, y: height * 0.2, width: 150, height: 20, col: color(25, 80, 94) },
        { x: width * 0.05, y: height * 0.5, width: 100, height: 20, col: color(48, 100, 100) }
    ];
}

function draw() {
    background(26, 26, 46);
    colorPulseTime += 0.005;
    const colorPhase = (sin(colorPulseTime) + 1) / 2;
    player.hue = lerp(190, 30, colorPhase);

    updatePlayer();
    drawPlatforms();
    drawBlob();
    time += 0.01;
}
function checkPlatformCollision(player, platform) {
    const playerBottom = player.y + player.radius;
    const playerTop = player.y - player.radius;
    const playerLeft = player.x - player.radius;
    const playerRight = player.x + player.radius;
    return playerRight > platform.x &&
           playerLeft < platform.x + platform.width &&
           playerBottom > platform.y &&
           playerTop < platform.y + platform.height;
}


function updatePlayer() {

    if (keyIsDown(65)) { 
        player.velocityX -= player.speed * 0.3;
    }
    if (keyIsDown(68)) { 
        player.velocityX += player.speed * 0.3;
    }

    if (player.onGround) {
        player.velocityX *= friction;
    } else {
        player.velocityX *= airResistance;
    }

 
    player.velocityX = constrain(player.velocityX, -player.speed, player.speed);


    player.velocityY += gravity;

  
    if (keyIsDown(32) && player.onGround) { 
        player.velocityY = -player.jumpForce;
        player.onGround = false;
        player.targetSquash = 1.5; 
    }


    if (player.onGround && abs(player.velocityX) > 0.5) {
        player.bounceOffset = sin(frameCount * 0.15) * 3;
    } else {
        player.bounceOffset = 0;
    }

    if (!player.onGround && player.velocityY < 0) {

        player.targetSquash = 1.3;
    } else if (!player.onGround && player.velocityY > 5) {
     
        player.targetSquash = 0.9;
    } else if (player.onGround) {
        
        if (abs(player.velocityY) > 2) {
            player.targetSquash = 0.6; 
        } else {
            player.targetSquash = 1; 
        }
    }


    player.squashAmount = lerp(player.squashAmount, player.targetSquash, 0.2);


    player.x += player.velocityX;
    player.y += player.velocityY;

    player.onGround = false;


    for (let platform of platforms) {
        if (checkPlatformCollision(player, platform)) {
            if (player.velocityY > 0 && player.y - player.radius < platform.y + platform.height / 2) {
                player.y = platform.y - player.radius;
                player.velocityY = 0;
                player.onGround = true;
            }
            else if (player.velocityY < 0 && player.y + player.radius > platform.y + platform.height / 2) {
                player.y = platform.y + platform.height + player.radius;
                player.velocityY = 0;
            }
   
            else if (player.velocityX > 0) {
                player.x = platform.x - player.radius;
                player.velocityX = 0;
            } else if (player.velocityX < 0) {
                player.x = platform.x + platform.width + player.radius;
                player.velocityX = 0;
            }
        }
    }


    if (player.x - player.radius < 0) {
        player.x = player.radius;
        player.velocityX = 0;
    }
    if (player.x + player.radius > width) {
        player.x = width - player.radius;
        player.velocityX = 0;
    }
    if (player.y + player.radius > height) {
        player.y = height - player.radius;
        player.velocityY = 0;
        player.onGround = true;
    }
}


function drawBlob() {
    const segments = 20; 
    const morphStrength = 3;
    const pulseSpeed = 1.5;
    const pulseAmount = 2;


    const pulse = sin(frameCount * 0.02 * pulseSpeed) * pulseAmount;
    const currentRadius = player.radius + pulse;

    push();
    translate(player.x, player.y + player.bounceOffset);


    scale(1 / player.squashAmount, player.squashAmount);


    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(player.hue, 70, 80);


    fill(player.hue, 70, 85, 20);
    noStroke();

    beginShape();
    for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * TWO_PI;
        const noiseValue = noise(
            cos(angle) * 2 + time,
            sin(angle) * 2 + time
        );
        const radius = (currentRadius + 4) + map(noiseValue, 0, 1, -morphStrength, morphStrength);
        vertex(cos(angle) * radius, sin(angle) * radius);
    }
    endShape(CLOSE);


    fill(player.hue, 65, 85);

    beginShape();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * TWO_PI;
        const noiseValue = noise(
            cos(angle) * 2 + time,
            sin(angle) * 2 + time
        );
        const radius = currentRadius + map(noiseValue, 0, 1, -morphStrength, morphStrength);
        vertex(cos(angle) * radius, sin(angle) * radius);
    }
    endShape(CLOSE);


    fill(player.hue, 40, 95, 50);
    beginShape();
    for (let i = 0; i <= 10; i++) { 
        const angle = (i / 10) * PI - PI / 3;
        const noiseValue = noise(cos(angle) * 2 + time, sin(angle) * 2 + time);
        const radius = (currentRadius * 0.5) + map(noiseValue, 0, 1, -morphStrength * 0.3, morphStrength * 0.3);
        vertex(-3 + cos(angle) * radius, -8 + sin(angle) * radius);
    }
    endShape(CLOSE);

    drawingContext.shadowBlur = 0;
    pop();
}


function drawPlatforms() {
    noStroke();

    platforms.forEach(platform => {

        fill(platform.col);
        rect(platform.x, platform.y, platform.width, platform.height);

   
        fill(0, 0, 100, 10);
        rect(platform.x, platform.y, platform.width, platform.height / 2);
    });
}
