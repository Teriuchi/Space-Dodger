//**********************************
//Globals
//**********************************

var fps = 60;
var Canvas_Width = 640;
var Canvas_Heigth = 640;

//**********************************
//Player Unit
//**********************************

var playerUnit = {
	color: "white",
	x: 310,
	y: 560,
	width: 28,
	height: 27,
	cooldown: 0,
	cooldown_time: 15,
	draw: function(){
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	}
};

playerUnit.sprite = Sprite("spaceship");

playerUnit.draw = function() {
	this.sprite.draw(canvas, this.x, this.y);
}

//**********************************
//Bullets
//**********************************

var playerBullets = [];

function Bullet(I) {
	I.active = true;
        
	I.xVelocity = 0;
	I.yVelocity = -I.speed;
	I.width = 4;
	I.height = 9;
	I.color = "white";
	I.sprite = new Sprite("projectile");
        
	I.inBounds = function() 
	{
		return I.x >= 0 && I.x <= Canvas_Width &&
		I.y >= 0 && I.y <= Canvas_Heigth;
	};
	
	I.draw = function()
	{
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
		this.sprite.draw(canvas, this.x, this.y);
	}
          
	I.update = function() 
	{
		I.x += I.xVelocity;
		I.y += I.yVelocity;
        
		I.active = I.active && I.inBounds();
	}
        
	I.explode = function() 
	{
		this.active = false;
	}
	return I;
}

//**********************************
//Enemies
//**********************************

enemies = [];
    
function Enemy(I) {
	I = I || {};
        
	I.active = true;
	I.age = Math.floor(Math.random() * 128);
          
	I.color = "#A2B";
        
	I.x = Canvas_Width / 5 + Math.random() * Canvas_Width / 3;
	I.y = 0;
	I.xVelocity = 0;
	I.yVelocity = 2;
        
	I.width = 24;
	I.height = 24;
        
	I.inBounds = function() {
		return I.x >= 0 && I.x <= Canvas_Width &&
		I.y >= 0 && I.y <= Canvas_Heigth;
	};
        
	I.sprite = Sprite("enemy");
        
	I.draw = function() {
		this.sprite.draw(canvas, this.x, this.y);
	};
        
	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;    
		I.xVelocity = 6 * Math.sin(I.age * Math.PI / 140);
	
		I.age++;
        I.yVelocity = I.yVelocity + (Math.random() / 9);
		I.active = I.active && I.inBounds();
	
		if(score > 100 && score <= 199){
			I.yVelocity = I.yVelocity + 0.02;
		}
	
		if(score > 200 && score <= 299){
			I.yVelocity = I.yVelocity + 0.03;
			I.xVelocity = 6 * Math.cos(I.age * Math.PI / 60);
		}
		
		if(score > 300 && score <= 399){
			I.yVelocity = I.yVelocity + 0.06;
			I.xVelocity = 6 * Math.sin(I.age * Math.PI / 140);
		}
		
		if(score > 400 && score <= 499){
			I.yVelocity = I.yVelocity + 0.9;
		}
		
		if(score > 500 && score <= 599){
			I.yVelocity = I.yVelocity + 0.13;
			I.xVelocity = 8 * Math.cos(I.age * Math.PI / 80);
		}
	
	};
    
	I.explode = function() {
		this.active = false;
		score = score + 5;
	};
		return I;
};

//**********************************
//Canvas
//**********************************

var canvasElement = $("'<canvas id='jqueryCanvas' width='" + Canvas_Width + 
			"' height='" + Canvas_Heigth + "'></canvas");	  
	canvas = canvasElement.get(0).getContext("2d");
    canvasElement.appendTo('body');

//**********************************
//Frame Refresh & Set boundaries
//**********************************

var gameLoop = setInterval(function()
{
	update();
	draw();
}, 1000/fps);

function update() {
	if(playerUnit.cooldown > 0)
		playerUnit.cooldown--;
	if(keydown.space) {
		playerUnit.shoot();
	}
	if(keydown.left) {
		playerUnit.x -= 5;
	}
	if(keydown.right) {
		playerUnit.x += 5;
	}

	playerUnit.x = playerUnit.x.clamp(0, Canvas_Width - 52);

	playerBullets.forEach(function(bullet) {
		bullet.update();
	});

	playerBullets = playerBullets.filter(function(bullet) {
		return bullet.active;
	});
	
	handleCollisions();
	
	enemies.forEach(function(enemy) {
		enemy.update();
	});
        
	enemies = enemies.filter(function(enemy) {
		return enemy.active;
	});
	
	if(Math.random() < 0.08) {
    enemies.push(Enemy());
	}
}
          


//**********************************
//Drawing
//**********************************    	

playerUnit.shoot = function() {
	var bulletPosition = this.midpoint();
	if(playerBullets.length < 5 && playerUnit.cooldown === 0){	
		playerUnit.cooldown = playerUnit.cooldown_time;
		playerBullets.push(Bullet({
			speed: 12,
			x: bulletPosition.x,
			y: bulletPosition.y
		}));
	}
};

playerUnit.midpoint = function() {
	return {
		x: this.x + this.width/2,
		y: this.y + this.height/2
	};
};

function draw() {
	canvas.clearRect(0, 0, Canvas_Width, Canvas_Heigth);
	
	playerUnit.draw();
	
	playerBullets.forEach(function(bullet) {
		bullet.draw();
	});
	
	enemies.forEach(function(enemy) {
        enemy.draw();
    });
	
	if(gOver.over){
		gOver.sprite.draw(canvas,0,0);
	}
	myScore();
	scoring();
}

//**********************************
//Collision Checker
//**********************************

function collides(a, b) {
	return a.x < b.x + b.width &&
	a.x + a.width > b.x &&
	a.y < b.y + b.height &&
	a.y + a.height > b.y
}

function handleCollisions() {
	playerBullets.forEach(function(bullet) {
		enemies.forEach(function(enemy) {
			if(collides(bullet, enemy)){
				enemy.explode();
				bullet.active = false;
			}
		});
	});
	
	enemies.forEach(function(enemy) {
		if(collides(enemy, playerUnit)) {
			playerUnit.explode();
		}
	});
}

playerUnit.explode = function() {
	this.active = false;
	gameOver(); 
};

//**********************************
//Game Over
//**********************************

var gOver = {};
gOver.over = false;
gOver.sprite = Sprite("GameoverSMB", 0, 0, 640, 376);

function gameOver() {
	clearInterval(gameLoop);
	clearInterval(scoring);
	gOver.over = true;
};


//**********************************
//Score
//**********************************
	
var score = 0;
var tick = 0;
var tickMax = 60;
function myScore() {
	canvas.font = "20px Arial";
	canvas.fillStyle = "white";
	canvas.fillText("Score: " + score,10,30);
}

function scoring() {
	if(tick < tickMax){
		tick++;
	} else {	
		score = score + 1;
		tick = 0;
	}
}
