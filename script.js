console.log("js started!");

// GLOBAL VARIABLES
var ANIMATE, SECOND, TIME, COUNTER = {};
var WIDTH, HEIGHT, BALLS_NEED = 0;
var FPS = 50, BALLS = 35, R = 20;
var GRAVITY_Y = 1,GRAVITY_X=0;
var BOUNCE_F = 0.7, AIR_F = 0.04, MAGNET_WALL_X = 8, MAGNET_WALL_Y = 4, MAGNET = 0.5, MARGIN = 6;
var TOO_FAR = 150;

function scaleAll(){
	HEIGHT = parseInt($( document ).height()*0.95);
    WIDTH = parseInt($( document ).width()*0.95);
	console.log(WIDTH,"x",HEIGHT);
}
function choose(choices) {
	var index = Math.floor(Math.random() * choices.length);
	return choices[index];
}
function addBall(x,y,r,id){
	var ball = document.createElement("figure");
	var color = "#";
	for(var i=0;i<6;i++)
		color += choose("0123456789ABCDEF");
	$(ball)
		.addClass("ball").attr("id",id)
		.attr('velY', -5 + Math.random()*10).attr('velX', -5 + Math.random()*10)
		.height(r*2).width(r*2)
		.css({top: y+r, left: x+r, 'background-color': color});
	$("#screen").append(ball);
	ball = undefined;
}
function initAll(){
	console.log("init");
	TIME = Date.now();
	// init COUNTERS
	COUNTER["FPS"] = 1;
	COUNTER["COLLISIONS"] = 1;
	//
	for(var i=0;i<BALLS;i++){
		addBall(
			WIDTH*0.1+(i/BALLS)*WIDTH*0.8,HEIGHT*0.2+(i/BALLS)*HEIGHT*0.65,R*0.6+(i/BALLS)*R*0.4,'b'+i);
	}
	$("#killSwitch").on('click',function(){
		window.clearInterval(ANIMATE);
		window.clearInterval(SECOND);
	});
	$("#reset").on('click',function(){
		$(".ball").remove();
		window.clearInterval(ANIMATE);
		window.clearInterval(SECOND);
		initAll();
	});
	
	console.log(1000/FPS);
    ANIMATE = window.setInterval(ANIMATION,parseInt(1000/FPS));
	SECOND = window.setInterval(SECONDER,1000);
	
}
function changeBallsVel(ball,dVX,dVY,multiple){
	var vX = $(ball).attr("velX");
	var vY = $(ball).attr("velY");
	if(!multiple)
		$(ball)
			.attr("velX",parseFloat(vX)+dVX)
			.attr("velY",parseFloat(vY)+dVY);
	else
		$(ball)
			.attr("velX",parseFloat(vX)*dVX)
			.attr("velY",parseFloat(vY)*dVY);
}
function gravityBalls(){
	$(".ball").each(function(){
		changeBallsVel(this,GRAVITY_X,GRAVITY_Y,false);
	});
}
function airBalls(){
	$(".ball").each(function(){
		changeBallsVel(this,(1-AIR_F),(1-AIR_F),true);
	});
}
function bounceBalls(){
	$(".ball").each(function(){
		var position = $(this).offset();
		var h = $(this).height();
		var w = $(this).width();
		if(position.top + h>HEIGHT){
			var vY = $(this).attr("velY");
			$(this)
				.attr("velY",-BOUNCE_F*parseFloat(vY))
				.css({top: HEIGHT-MARGIN-h, left: "+=0"});
		}
		if(position.top < 0){
			var vY = $(this).attr("velY");
			$(this)
				.attr("velY",-BOUNCE_F*parseFloat(vY))
				.css({top: MARGIN, left: "+=0"});
		}
		if(position.left < 0){
			var vX = $(this).attr("velX");
			$(this)
				.attr("velX",-BOUNCE_F*parseFloat(vX))
				.css({top: "+=0", left: MARGIN});
		}
		if(position.left + w > WIDTH){
			var vX = $(this).attr("velX");
			$(this)
				.attr("velX",-BOUNCE_F*parseFloat(vX))
				.css({top: "+=0", left: WIDTH - MARGIN - w});
		}
		
		var x = position.left + w/2;
		var y = position.top - h/2;
		var Mww = MAGNET_WALL_X*w*w, Mhh = MAGNET_WALL_Y*h*h;
		changeBallsVel(this,
			Mww/(x*x),
			Mhh/(y*y),false);
		changeBallsVel(this,
			-Mww/((WIDTH - x)*(WIDTH - x)),
			-Mhh/((HEIGHT - y)*(HEIGHT - y)),false);
			
	});
}
function collideBalls(){
	for(var i=0;i<BALLS;i++)
		for(var i2=i+1;i2<BALLS;i2++){
			var b1 = $("#b"+i),b2 = $("#b"+i2);
			
			var pos1 = $(b1).offset(), pos2 = $(b2).offset();
			var h1 = $(b1).height(), h2 = $(b2).height();
			var w1 = $(b1).width(), w2 = $(b2).width();				
			var disX = (pos2.left+w2/2) - (pos1.left+w1/2);
			var disY = (pos2.top+h2/2) - (pos1.top+h1/2);
			
			if(disX<TOO_FAR && disY<TOO_FAR){
				
				COUNTER["COLLISIONS"] += 1;
				var dis = Math.sqrt(disX*disX + disY*disY);
				var disdis = dis*dis;
				
				var forceX = MAGNET*(disX/dis)/(disdis);
				var forceY = MAGNET*(disY/dis)/(disdis);

				changeBallsVel(b2,
					w1*w1*forceX,
					h1*h1*forceY,false);
				changeBallsVel(b1,
					-w2*w2*forceX,
					-h2*h2*forceY,false);
			}
		}
}
function animateBalls(){
	$(".ball").each(function(){
		var vX = $(this).attr("velX");
		var vY = $(this).attr("velY");
		$(this).css({"top": '+='+vY,"left":'+='+vX});
	});	
}
function ANIMATION(){
	gravityBalls();
	bounceBalls();
	collideBalls();
	airBalls();
	
	animateBalls();
	COUNTER["FPS"] += 1;
}
function SECONDER(){
	var print = "";
	for(c in COUNTER){
		print += c + ": " + COUNTER[c] + "<br>"
		COUNTER[c] = 0;
	}
	$("#timer").html(
		"SIM: " + parseInt((Date.now() - TIME)/1000) + " s.<br>" + 
		print);
}
$(document).ready(function(){
    
    scaleAll();    
    $( window ).resize(function(){
        scaleAll();
    });
    
	initAll();
	
	
	console.log("loaded!");
});



console.log("js ended!");
