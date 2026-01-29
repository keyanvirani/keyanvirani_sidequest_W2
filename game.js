
let player = {
    x: 100,
    y: 450,
    radius: 25,
    speedX: 0,
    speedY: 0,
    speed: 8,
    jumpForce: 35,
    onGround: false,
    hue: 190,
    squash: 1,
    targetSquash: 1,
    bounceOffset: 0
};

const gravity = 0.8;
const friction = 0.8;
const airResistance = 0.95;
let platforms = [];
let time = 0;
let colorPulse = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 100);

    platforms = [
        { x: 0, y: height - 30, w: width, h: 30, col: color(210, 45, 35) },
        { x: width * 0.15, y: height * 0.75, w: 120, h: 20, col: color(355, 76, 92) },
        { x: width * 0.4, y: height * 0.6, w: 130, h: 20, col: color(25, 80, 94) },
        { x: width * 0.65, y: height * 0.45, w: 140, h: 20, col: color(48, 100, 100) },
        { x: width * 0.35, y: height * 0.3, w: 120, h: 20, col: color(355, 76, 92) },
        { x: width * 0.7, y: height * 0.2, w: 150, h: 20, col: color(25, 80, 94) },
        { x: width * 0.05, y: height * 0.5, w: 100, h: 20, col: color(48, 100, 100) }
    ];
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    platforms = [
        { x: 0, y: height - 30, w: width, h: 30, col: color(210, 45, 35) },
        { x: width * 0.15, y: height * 0.75, w: 120, h: 20, col: color(355, 76, 92) },
        { x: width * 0.4, y: height * 0.6, w: 130, h: 20, col: color(25, 80, 94) },
        { x: width * 0.65, y: height * 0.45, w: 140, h: 20, col: color(48, 100, 100) },
        { x: width * 0.35, y: height * 0.3, w: 120, h: 20, col: color(355, 76, 92) },
        { x: width * 0.7, y: height * 0.2, w: 150, h: 20, col: color(25, 80, 94) },
        { x: width * 0.05, y: height * 0.5, w: 100, h: 20, col: color(48, 100, 100) }
    ];
}

function draw() {
    background(26, 26, 46);
    colorPulse += 0.005;
    const colorPhase = (sin(colorPulse) + 1) / 2;
    player.hue = lerp(190, 30, colorPhase);

    updatePlayer();
    drawPlatforms();
    drawBlob();
    time += 0.01;
}

function checkCollision(player, platform) {
    const bottom = player.y + player.radius;
    const top = player.y - player.radius;
    const left = player.x - player.radius;
    const right = player.x + player.radius;
    return right > platform.x && left < platform.x + platform.w && bottom > platform.y && top < platform.y + platform.h;
}

function updatePlayer() {
    if (keyIsDown(65)) {
        player.speedX -= player.speed * 0.3;
    }
    if (keyIsDown(68)) {
        player.speedX += player.speed * 0.3;
    }

    if (player.onGround) {
        player.speedX *= friction;
    } else {
        player.speedX *= airResistance;
    }

    player.speedX = constrain(player.speedX, -player.speed, player.speed);
    player.speedY += gravity;

    if (keyIsDown(32) && player.onGround) {
        player.speedY = -player.jumpForce;
        player.onGround = false;
        player.targetSquash = 1.5;
    }

    if (player.onGround && abs(player.speedX) > 0.5) {
        player.bounceOffset = sin(frameCount * 0.15) * 3;
    } else {
        player.bounceOffset = 0;
    }

    if (!player.onGround && player.speedY < 0) {
        player.targetSquash = 1.3;
    } else if (!player.onGround && player.speedY > 5) {
        player.targetSquash = 0.9;
    } else if (player.onGround) {
        if (abs(player.speedY) > 2) {
            player.targetSquash = 0.6;
        } else {
            player.targetSquash = 1;
        }
    }

    player.squash = lerp(player.squash, player.targetSquash, 0.2);

    player.x += player.speedX;
    player.y += player.speedY;
    player.onGround = false;

    for (let i = 0; i < platforms.length; i++) {
        let plat = platforms[i];
        if (checkCollision(player, plat)) {
            if (player.speedY > 0 && player.y - player.radius < plat.y + plat.h / 2) {
                player.y = plat.y - player.radius;
                player.speedY = 0;
                player.onGround = true;
            }
            else if (player.speedY < 0 && player.y + player.radius > plat.y + plat.h / 2) {
                player.y = plat.y + plat.h + player.radius;
                player.speedY = 0;
            }
            else if (player.speedX > 0) {
                player.x = plat.x - player.radius;
                player.speedX = 0;
            } else if (player.speedX < 0) {
                player.x = plat.x + plat.w + player.radius;
                player.speedX = 0;
            }
        }
    }

    if (player.x - player.radius < 0) {
        player.x = player.radius;
        player.speedX = 0;
    }
    if (player.x + player.radius > width) {
        player.x = width - player.radius;
        player.speedX = 0;
    }
    if (player.y + player.radius > height) {
        player.y = height - player.radius;
        player.speedY = 0;
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
    scale(1 / player.squash, player.squash);

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = color(player.hue, 70, 80);

    fill(player.hue, 70, 85, 20);
    noStroke();

    beginShape();
    for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * TWO_PI;
        const noiseVal = noise(cos(angle) * 2 + time, sin(angle) * 2 + time);
        const r = (currentRadius + 4) + map(noiseVal, 0, 1, -morphStrength, morphStrength);
        vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);

    fill(player.hue, 65, 85);

    beginShape();
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * TWO_PI;
        const noiseVal = noise(cos(angle) * 2 + time, sin(angle) * 2 + time);
        const r = currentRadius + map(noiseVal, 0, 1, -morphStrength, morphStrength);
        vertex(cos(angle) * r, sin(angle) * r);
    }
    endShape(CLOSE);

    fill(player.hue, 40, 95, 50);
    beginShape();
    for (let i = 0; i <= 10; i++) {
        const angle = (i / 10) * PI - PI / 3;
        const noiseVal = noise(cos(angle) * 2 + time, sin(angle) * 2 + time);
        const r = (currentRadius * 0.5) + map(noiseVal, 0, 1, -morphStrength * 0.3, morphStrength * 0.3);
        vertex(-3 + cos(angle) * r, -8 + sin(angle) * r);
    }
    endShape(CLOSE);

    drawingContext.shadowBlur = 0;
    pop();
}

function drawPlatforms() {
    noStroke();
    for (let i = 0; i < platforms.length; i++) {
        let plat = platforms[i];
        fill(plat.col);
        rect(plat.x, plat.y, plat.w, plat.h);
        fill(0, 0, 100, 10);
        rect(plat.x, plat.y, plat.w, plat.h / 2);
    }
}
