let player;

let enemies = [];

let bullets = [];

let enemyBullets = [];

let powerUps = [];

let explosions = [];

let boss = null;

let level = 1;

let score = 0;

let gameState = 'menu';

let enemySpacing = 50;

let enemySpeed = 1;

let enemyDirection = 1;

let enemyShootInterval = 3000; // Intervalo de tiro dos inimigos aumentado para 3000ms

let upgradeOptions = [];

let leftButton, rightButton, shootButton, startButton;

function setup() {

  createCanvas(800, 600);

  // Controles de celular

  leftButton = createButton('←');

  leftButton.position(20, height - 60);

  leftButton.size(50, 50);

  leftButton.touchStarted(() => player && (player.moveLeft = true));

  leftButton.touchEnded(() => player && (player.moveLeft = false));

  leftButton.mousePressed(() => player && (player.moveLeft = true));

  leftButton.mouseReleased(() => player && (player.moveLeft = false));

  rightButton = createButton('→');

  rightButton.position(80, height - 60);

  rightButton.size(50, 50);

  rightButton.touchStarted(() => player && (player.moveRight = true));

  rightButton.touchEnded(() => player && (player.moveRight = false));

  rightButton.mousePressed(() => player && (player.moveRight = true));

  rightButton.mouseReleased(() => player && (player.moveRight = false));

  shootButton = createButton('Shoot');

  shootButton.position(width - 100, height - 60);

  shootButton.size(80, 50);

  shootButton.touchStarted(() => player && bullets.push(new Bullet(player.x, player.y)));

  shootButton.mousePressed(() => player && bullets.push(new Bullet(player.x, player.y)));

  startButton = createButton('Start Game');

  startButton.position(width / 2 - 50, height / 2 + 20);

  startButton.size(100, 50);

  startButton.mousePressed(startGame);

}

function draw() {

  background(0);

  if (gameState === 'menu') {

    displayMenu();

  } else if (gameState === 'playing') {

    player.display();

    player.move();

    for (let i = bullets.length - 1; i >= 0; i--) {

      bullets[i].display();

      bullets[i].move();

      if (bullets[i].offScreen()) {

        bullets.splice(i, 1);

      }

    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {

      enemyBullets[i].display();

      enemyBullets[i].move();

      if (enemyBullets[i].offScreen()) {

        enemyBullets.splice(i, 1);

      }

    }

    for (let i = enemies.length - 1; i >= 0; i--) {

      enemies[i].display();

      enemies[i].move();

      enemies[i].shoot();

    }

    for (let i = explosions.length - 1; i >= 0; i--) {

      explosions[i].display();

      if (explosions[i].isFinished()) {

        explosions.splice(i, 1);

      }

    }

    if (boss) {

      boss.display();

      boss.move();

    }

    for (let i = powerUps.length - 1; i >= 0; i--) {

      powerUps[i].display();

      powerUps[i].move();

      if (powerUps[i].offScreen()) {

        powerUps.splice(i, 1);

      }

    }

    checkCollisions();

    displayUI();

    if (enemies.length === 0 && !boss) {

      level++;

      spawnEnemies(level);

      spawnPowerUps(level);

      if (level % 5 === 0) {

        spawnBoss(level);

      }

    }

  } else if (gameState === 'gameOver') {

    displayGameOver();

  } else if (gameState === 'upgrade') {

    displayUpgradeMenu();

  }

}

function keyPressed() {

  if (key === ' ') {

    if (gameState === 'menu') {

      startGame();

    } else if (gameState === 'playing') {

      if (player.doubleShot) {

        bullets.push(new Bullet(player.x - 10, player.y));

        bullets.push(new Bullet(player.x + 10, player.y));

      } else {

        bullets.push(new Bullet(player.x, player.y));

      }

    }

  }

}

function startGame() {

  gameState = 'playing';

  player = new Player();

  spawnEnemies(level);

  spawnPowerUps(level);

  startButton.hide();

}

function displayMenu() {

  fill(255);

  textAlign(CENTER, CENTER);

  textSize(32);

  text("Galactic Wars", width / 2, height / 2 - 50);

  textSize(16);

  text("Por Michael", width / 2, height / 2 - 20);

  text("Pressione Espaço ou o botão Iniciar para começar", width / 2, height / 2);

  text("Use as setas ou os botões para mover e espaço para atirar", width / 2, height / 2 + 40);

  startButton.show();

}

function displayGameOver() {

  fill(255);

  textAlign(CENTER, CENTER);

  textSize(32);

  text("Game Over", width / 2, height / 2 - 50);

  textSize(16);

  text(`Pontuação Final: ${score}`, width / 2, height / 2 - 20);

  text("Pressione R ou o botão Iniciar para reiniciar", width / 2, height / 2);

  startButton.show();

  startButton.mousePressed(resetGame);

}

function displayUpgradeMenu() {

  fill(255);

  textAlign(CENTER, CENTER);

  textSize(32);

  text("Upgrade", width / 2, height / 2 - 100);

  textSize(16);

  text("Escolha uma melhoria:", width / 2, height / 2 - 60);

  for (let i = 0; i < upgradeOptions.length; i++) {

    text(`${i + 1}. ${upgradeOptions[i].name}`, width / 2, height / 2 - 40 + i * 20);

  }

  text("Pressione o número correspondente para escolher", width / 2, height / 2 + 80);

}

function resetGame() {

  gameState = 'menu';

  level = 1;

  score = 0;

  player = null;

  enemies = [];

  bullets = [];

  enemyBullets = [];

  powerUps = [];

  explosions = [];

  boss = null;

  startButton.mousePressed(startGame);

  startButton.show();

}

function checkCollisions() {

  for (let i = bullets.length - 1; i >= 0; i--) {

    for (let j = enemies.length - 1; j >= 0; j--) {

      if (bullets[i].hits(enemies[j])) {

        if (enemies[j].takeDamage(player.bulletPower)) {

          explosions.push(new Explosion(enemies[j].x, enemies[j].y));

          score += 10;

          enemies.splice(j, 1);

        }

        bullets.splice(i, 1);

        break;

      }

    }

  }

  if (boss) {

    for (let i = bullets.length - 1; i >= 0; i--) {

      if (bullets[i].hits(boss)) {

        if (boss.takeDamage(player.bulletPower)) {

          explosions.push(new Explosion(boss.x, boss.y));

          score += 100;

          boss = null;

        }

        bullets.splice(i, 1);

        break;

      }

    }

  }

  for (let i = powerUps.length - 1; i >= 0; i--) {

    if (powerUps[i].hits(player)) {

      powerUps[i].applyEffect(player);

      powerUps.splice(i, 1);

    }

  }

  for (let i = enemies.length - 1; i >= 0; i--) {

    if (enemies[i].hits(player)) {

      player.health -= 1;

      enemies.splice(i, 1);

      if (player.health <= 0) {

        gameState = 'gameOver';

      }

    }

  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {

    if (enemyBullets[i].hits(player)) {

      player.health -= 1;

      enemyBullets.splice(i, 1);

      if (player.health <= 0) {

        gameState = 'gameOver';

      }

    }

  }

  if (boss && boss.hits(player)) {

    player.health -= 1;

    if (player.health <= 0) {

      gameState = 'gameOver';

    }

  }

}

function spawnEnemies(level) {

  enemies = [];

  enemySpeed = 1 + level * 0.5;

  let formation = random(['rectangle', 'triangle', 'circle']);

  if (formation === 'rectangle') {

    for (let row = 0; row < 5; row++) {

      for (let col = 0; col < 10; col++) {

        enemies.push(new Enemy(col * enemySpacing + 50, row * enemySpacing + 50));

      }

    }

  } else if (formation === 'triangle') {

    for (let row = 0; row < 5; row++) {

      for (let col = 0; col <= row; col++) {

        enemies.push(new Enemy(width / 2 - row * enemySpacing / 2 + col * enemySpacing, row * enemySpacing + 50));

      }

    }

  } else if (formation === 'circle') {

    let radius = 100;

    let angleStep = TWO_PI / 12;

    for (let i = 0; i < 12; i++) {

      let x = width / 2 + radius * cos(i * angleStep);

      let y = 100 + radius * sin(i * angleStep);

      enemies.push(new Enemy(x, y));

    }

  }

}

function spawnBoss(level) {

  boss = new Boss(width / 2, 100, level * 10);

}

function spawnPowerUps(level) {

  powerUps = [];

  for (let i = 0; i < level; i++) {

    powerUps.push(new PowerUp(random(width), random(height / 2)));

  }

}

function displayUI() {

  fill(255);

  textSize(20);

  text(`Pontuação: ${score}`, 10, 40);

  text(`Vida: ${player.health}`, 10, 60);

}

class Player {

  constructor() {

    this.x = width / 2;

    this.y = height - 30;

    this.size = 30;

    this.speed = 5;

    this.color = color(0, 0, 255);

    this.bulletSpeed = 7;

    this.bulletPower = 1;

    this.doubleShot = false;

    this.health = 3;

    this.moveLeft = false;

    this.moveRight = false;

  }

  display() {

    fill(this.color);

    triangle(this.x - this.size / 2, this.y + this.size / 2, this.x + this.size / 2, this.y + this.size / 2, this.x, this.y - this.size / 2);

  }

  move() {

    if (this.moveLeft) {

      this.x -= this.speed;

    }

    if (this.moveRight) {

      this.x += this.speed;

    }

    this.x = constrain(this.x, 0, width);

  }

}

class Enemy {

  constructor(x, y) {

    this.x = x;

    this.y = y;

    this.size = 25;

    this.health = 1;

    this.lastShot = 0;

  }

  display() {

    fill(255, 0, 0);

    triangle(this.x - this.size / 2, this.y + this.size / 2, this.x + this.size / 2, this.y + this.size / 2, this.x, this.y - this.size / 2);

  }

  move() {

    this.x += enemySpeed * enemyDirection;

    if (this.x > width - 50 || this.x < 50) {

      enemyDirection *= -1;

      for (let enemy of enemies) {

        enemy.y += 20;

      }

    }

  }

  shoot() {

    if (millis() - this.lastShot > enemyShootInterval) {

      enemyBullets.push(new EnemyBullet(this.x, this.y));

      this.lastShot = millis();

    }

  }

  takeDamage(damage) {

    this.health -= damage;

    return this.health <= 0;

  }

  hits(player) {

    return dist(this.x, this.y, player.x, player.y) < (this.size + player.size) / 2;

  }

}

class Boss {

  constructor(x, y, health) {

    this.x = x;

    this.y = y;

    this.size = 50;

    this.health = health;

    this.direction = 1;

  }

  display() {

    fill(255, 0, 255);

    rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

  }

  move() {

    this.x += enemySpeed * this.direction;

    if (this.x > width - 50 || this.x < 50) {

      this.direction *= -1;

    }

  }

  takeDamage(damage) {

    this.health -= damage;

    return this.health <= 0;

  }

  hits(player) {

    return dist(this.x, this.y, player.x, player.y) < (this.size + player.size) / 2;

  }

}

class Bullet {

  constructor(x, y) {

    this.x = x;

    this.y = y;

    this.size = 8;

    this.speed = player.bulletSpeed;

  }

  display() {

    fill(255, 255, 0);

    rect(this.x - this.size / 2, this.y - this.size, this.size, this.size);

  }

  move() {

    this.y -= this.speed;

  }

  offScreen() {

    return this.y < 0;

  }

  hits(enemy) {

    return dist(this.x, this.y, enemy.x, enemy.y) < (this.size + enemy.size) / 2;

  }

}

class EnemyBullet {

  constructor(x, y) {

    this.x = x;

    this.y = y;

    this.size = 8;

    this.speed = 5;

  }

  display() {

    fill(255, 0, 0);

    rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

  }

  move() {

    this.y += this.speed;

  }

  offScreen() {

    return this.y > height;

  }

  hits(player) {

    return dist(this.x, this.y, player.x, player.y) < (this.size + player.size) / 2;

  }

}

class PowerUp {

  constructor(x, y) {

    this.x = x;

    this.y = y;

    this.size = 15;

    this.speed = 2;

    this.type = random(['speed', 'bulletSpeed', 'doubleShot', 'extraLife', 'bulletPower']);

    this.color = this.getColor();

  }

  getColor() {

    switch (this.type) {

      case 'speed': return color(0, 255, 0);

      case 'bulletSpeed': return color(255, 255, 0);

      case 'doubleShot': return color(0, 255, 255);

      case 'extraLife': return color(255, 0, 0);

      case 'bulletPower': return color(255, 0, 255);

    }

  }

  display() {

    fill(this.color);

    ellipse(this.x, this.y, this.size, this.size);

  }

  move() {

    this.y += this.speed;

    if (this.y > height) {

      this.y = 0;

      this.x = random(width);

    }

  }

  offScreen() {

    return this.y > height;

  }

  hits(player) {

    return dist(this.x, this.y, player.x, player.y) < (this.size + player.size) / 2;

  }

  applyEffect(player) {

    if (this.type === 'speed') {

      player.speed += 1;

    } else if (this.type === 'bulletSpeed') {

      player.bulletSpeed += 1;

    } else if (this.type === 'doubleShot') {

      player.doubleShot = true;

    } else if (this.type === 'extraLife') {

      player.health += 1;

    } else if (this.type === 'bulletPower') {

      player.bulletPower += 1;

    }

  }

}

class Explosion {

  constructor(x, y) {

    this.x = x;

    this.y = y;

    this.frames = 20; // Duração da explosão

    this.currentFrame = 0;

  }

  display() {

    if (this.currentFrame < this.frames) {

      fill(255, 150, 0, 255 - (this.currentFrame * 255 / this.frames));

      ellipse(this.x, this.y, 50 - (this.currentFrame * 50 / this.frames));

      this.currentFrame++;

    }

  }

  isFinished() {

    return this.currentFrame >= this.frames;

  }

}


  



  