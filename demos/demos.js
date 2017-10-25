var initId = 0;
var world = createWorld();
var ctx;
var canvasWidth;
var canvasHeight;
var canvasTop;
var canvasLeft;

function setupWorld(did) {
    if (!did) did = 0;
    world = createWorld();
    initId += did;
    initId %= demos.InitWorlds.length;
    if (initId < 0) initId = demos.InitWorlds.length + initId;
    demos.InitWorlds[initId](world);
}
function setupNextWorld() { setupWorld(1); }
function setupPrevWorld() { setupWorld(-1); }

function step(cnt) {
    var stepping = false;
    var timeStep = 5/600;
    var iteration = 1;
    var i;
    for(i=0;i<2;i++){
	world.Step(timeStep, iteration);
    }
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawWorld(world, ctx);
    setTimeout('step(' + (cnt || 0) + ')', 15);
}

var track = true;
function createBall(world, x, y,vx,vy, rad, fixed) {
    var ballSd = new b2CircleDef();
    var ballBd = new b2BodyDef();
    if (!fixed){
	ballSd.density = 3;
	ballSd.radius = 15;
	ballSd.restitution = 0.2;
	if(track){
	    ballSd.radius = 20;
	    ballSd.restitution = 0.2;
	    ballSd.density = 5.;
	    track = false;
	}
    }
    ballBd.AddShape(ballSd);
    ballBd.position.Set(x,y);
    var r = world.CreateBody(ballBd);
    r.SetLinearVelocity(new b2Vec2(0,0));

    return r;
};

var ox,oy;
var tracking;
var mouse_joint;
Event.observe(window, 'load', function() {
    setupWorld();
    ctx = $('canvas').getContext('2d');
    var canvasElm = $('canvas');
    canvasWidth = parseInt(canvasElm.width);
    canvasHeight = parseInt(canvasElm.height);
    canvasTop = parseInt(canvasElm.style.top);
    canvasLeft = parseInt(canvasElm.style.left);
    Event.observe('canvas', 'mousemove', function(e) {
	if(tracking != undefined){
	    if(mouse_joint == undefined){
		var def = new b2MouseJointDef();
		
		def.body1 = world.GetGroundBody(); // 物理世界 groundBd;
		def.body2 = tracking;
		def.target = new b2Vec2(Event.pointerX(e) - canvasLeft,Event.pointerY(e) - canvasTop);
		def.collideConnected = true;
		def.maxForce = 10000 * tracking.GetMass();
		def.dampingRatio = 2;

		mouse_joint = world.CreateJoint(def);
	    }else{
		mouse_joint.SetTarget(new b2Vec2(Event.pointerX(e) - canvasLeft,Event.pointerY(e) - canvasTop));
	    }
	}
    });
    Event.observe('canvas', 'click', function(e) {
	//setupNextWorld();
	    tracking = createBall(world, Event.pointerX(e) - canvasLeft, Event.pointerY(e) - canvasTop,-ox+Event.pointerX(e),-oy+Event.pointerY(e), 20, false);
	    ox = Event.pointerX(e);
	    oy = Event.pointerY(e);
    });
    Event.observe('canvas', 'contextmenu', function(e) {
	if (e.preventDefault) e.preventDefault();
	setupPrevWorld();
	return false;
    });
    step();
});
