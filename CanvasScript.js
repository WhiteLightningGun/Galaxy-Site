//CANVAS SECTION

var canvas = document.getElementById("CanvasBox");
var CTX = canvas.getContext("2d");

//DEFINE IMPORTANT VARIABLES
var DIMENSIONS = [300, 500];
var CENTRE_X = DIMENSIONS[0] / 2; //Defaulting to biggest window size
var CENTRE_Y = DIMENSIONS[0] / 2;
var STAR_SIZE = 0.002*CENTRE_X;
var S = 0; //Selector variable
var PROBABILITY = [] //Stores the probability scalar field
var RADIUS = CENTRE_X*0.9;

function sizeCanvas(s) {
    //Directly set cavas size according to switch
    S = s;
    canvas.width = DIMENSIONS[S];
    canvas.height = DIMENSIONS[S];

    //set new constants
    CENTRE_X = DIMENSIONS[S] / 2;
    CENTRE_Y = DIMENSIONS[S] / 2;
    STAR_SIZE = 0.002*CENTRE_X; // This could be a free parameter as well
    RADIUS = DIMENSIONS[S] * 0.45;
    // Redraw everything after resizing the window
    drawCanvas();
  }

  function drawCanvas() {
    // Order matters, start with the furthest objects and progress to the "nearest" and biggest
    backgroundHaze("#000038"); //very dark blue

    //generate background haze of stars
    PROBABILITY = getProbabilityField();
    starField(PROBABILITY, STAR_SIZE);

    //drawArms(b, rad. rot_adjust, fuzz, radians)

    var Radius = document.getElementById("armRadius").value;
    RADIUS = Radius;

    var fuzz_fac = document.getElementById("fuzzFactor").value;
    FUZZ_FAC = fuzz_fac/10;

    var theta_fac = document.getElementById("thetaFactor").value;
    THETA_FAC = theta_fac

    var spiral_fac = document.getElementById("spiralFactor").value;
    SPIRAL_FAC = spiral_fac/100;

    drawArms(SPIRAL_FAC, RADIUS, 0, FUZZ_FAC, THETA_FAC);

    /*
    spirals(-0.1, RADIUS, 1.94, 2.5, 1, 650);
    spirals(-0.1, RADIUS, 2, 2.5, 0, 650);

    spirals(-0.1, -RADIUS, 1.94, 2.5, 1, 650);
    spirals(-0.1, -RADIUS, 2, 2.5, 0, 650);

    spirals(-0.1, RADIUS, 0.44, 2.5, 1, 650);
    spirals(-0.1, RADIUS, 0.5, 2.5, 0, 650);

    spirals(-0.1, -RADIUS, 0.44, 2.5, 1, 650);
    spirals(-0.1, -RADIUS, 0.5, 2.5, 0, 650);

    */
    console.log("drawCanvas finished")

  }

  //FUNCTIONS


  function drawArms(b, rad, rot_adjust, fuzz, radians)
  {
    spirals(-b, rad, 1.94 + rot_adjust, fuzz, 1, radians);
    spirals(-b, rad, 2 + rot_adjust, fuzz, 0, radians);

    spirals(-b, -rad, 1.94 + rot_adjust, fuzz, 1, radians);
    spirals(-b, -rad, 2 + rot_adjust, fuzz, 0, radians);

    spirals(-b, rad, 0.44 + rot_adjust, fuzz, 1, radians);
    spirals(-b, rad, 0.5 + rot_adjust, fuzz, 0, radians);

    spirals(-b, -rad, 0.44 + rot_adjust, fuzz, 1, radians);
    spirals(-b, -rad, 0.5 + rot_adjust, fuzz, 0, radians);

  }

  function backgroundHaze(colour) {

    var grd = CTX.createRadialGradient
    (
        CENTRE_X, //x-coord location
        CENTRE_Y, //y-coord location
        0.20*CENTRE_X, //radius as fraction of constant
        CENTRE_X,
        CENTRE_Y,
        1*CENTRE_X
    )

    grd.addColorStop(1, "black");
    grd.addColorStop(0, colour); //A very dark blue

    // Fill with gradient
    CTX.fillStyle = grd;
    CTX.fillRect(0, 0, DIMENSIONS[S], DIMENSIONS[S]);
  }

  function centralStar() {
    var r = DIMENSIONS[S]*0.02;
    CTX.beginPath();
    CTX.arc(CENTRE_X, CENTRE_Y, r, 0, 2 * Math.PI, false);
    CTX.fillStyle = "white";
    CTX.fill();
}

function drawRect(x_coord, y_coord, fill_colour) {
    CTX.beginPath();
    CTX.fillRect( x_coord, y_coord, 1, 1 );
    CTX.fillStyle = fill_colour // "white";
    CTX.fill();
}

function drawStar(x_coord, y_coord, star_size, fill_col){
    CTX.beginPath();
    //Note: arc takes arguments of form x, y, radius, start angle, end angle, counter-clockwise (bool)
    CTX.arc(x_coord, y_coord, star_size, 0, 2 * Math.PI, false);
    CTX.fillStyle = fill_col;
    CTX.fill();
}

function xy_to_radius(x_coord, y_coord){
    //This transforms from coordinate system where (0,0) is located at the top right of the canvas to the centre
    x_coord_prime = x_coord - CENTRE_X;
    y_coord_prime = -y_coord + CENTRE_Y;

    //radial vector magnitude from central point
    x_sqrd = Math.pow(x_coord_prime, 2);
    y_sqrd = Math.pow(y_coord_prime, 2);

    return Math.sqrt(x_sqrd + y_sqrd);
}

function probabilityField(p, x, y, dis, spr) {
    // Use a normal distribution to randomly distribute coordinates for a star pixel
    // based on proximity to the coordinate centre of the canvas
    // This must iterate through all 90000 pixels on the 300x300 canvas (at a minimum)

    // function: f(r) = (P)*e^-(((r - displacement)^2)/spread)
    // read the equation, take note of all variables

    // r is for radius, which will be calculated in the usual way: sqrt(x^2 + y^2)
    // xy_to_radius has been implemented for this, it will take arguments x, y

    // displacement (var dis) centres the distribution on a certain coordinate relative to r
    // obviously the displacement will always be zero, i.e. at dead centre of galaxy

    // spread (var spr) defines how far it will spread out from the central point

    // P (var p) is a normalisation factor defining the maximum possible probability 
    // this should not exceed 1 for obvious reasons

    // All variables will be tunable by the user via a slider control on the HTML

    var inner_term = (((xy_to_radius(x,y) - dis)**2)/spr)
    var probability_scalar = p*Math.exp(-inner_term)

    return probability_scalar;
}

function getProbabilityField(){
    //grab parameters from DOM and generate probability field array
    var spread = document.getElementById("spreadRange").value;
    var sW = DIMENSIONS[S] //sW means screen width
    var starDensity = document.getElementById("starDensity").value;
    var starDensity = starDensity/100; //divided by one hundred because range slider can't output floats (I think)

    array = [] //results to be returned stored here

    //generate probability field thereof
    for (var i = 0; i < sW; i++){
        for (var j = 0; j < sW; j++){
        array.push(probabilityField(starDensity, i, j, 0, spread));
        }
    }
        return array;
}

function starField(probability_array) {
    var c = 0;
    var s_w = DIMENSIONS[S] //s_w means screen width
    for (var i = 0; i < s_w; i++){
        for (var j = 0; j < s_w; j++){
            if(Math.random() <= probability_array[c])
            {
                drawStar(i,j, STAR_SIZE, "white");
                //drawRect(i,j, "white");
            }
            c = c + 1;
        }
    }
}

function spirals(b, r, rot_fac, fuz_fac, arm, theta_arg)
{
    /*
    b = an arbitrary constant required for logarithmic spirals
    r = galactic disc radius, will be around 130 for small size, and 350 for larger size
    rot_fac = rotation factor, a scalar multiple of PI
    fuz_fac = fuzz factor, randomly shifts star position in arms
    arm = spiral arm, with 0 as main arm, and 1 as the trailing arm of smaller stars

    N.B. Fuzz factor should be proportional to r, with bigger spread the further you get from the centre
    It may be possible to exploit the dependency on degree argument theta_arg to get the r proportionality 
    */

    spiral_stars = [];
    fuzz = 0.03 * Math.abs(r); //this is required for normalising the amount by which star position is jumbled according to current resolution (small/big)
    offset = DIMENSIONS[S]/2;


    for(var i = 0; i < theta_arg; i++)
    {
        theta = degrees_to_radians(i);

        var x = r*Math.exp(b*theta) * Math.cos(theta + Math.PI * rot_fac)
        + ((Math.random() - Math.random()) *fuzz /*-2*fuzz*/) * fuz_fac*(1 - 0.6*(i/theta_arg));

        var y = r*Math.exp(b*theta) * Math.sin(theta + Math.PI * rot_fac)
        + ((Math.random() - Math.random()) *fuzz /*-2*fuzz*/) * fuz_fac*(1 - 0.6*(i/theta_arg));

        spiral_stars.push([x+offset, y+offset]); //offset normalises coordinates to centre on the canvas around the centre
    }

    var ssLen = spiral_stars.length //ssLen = spiral stars length

    for(var k = 0; k < ssLen; k++)
    {
        var x = spiral_stars[k][0];
        var y = spiral_stars[k][1];

        //x and y are floats so first condition below will almost never be triggered

        if (arm == 0 && Math.round(x) % 2 === 0) 
        {
            drawStar(x,y, STAR_SIZE*3, "white");
        }
        else if (arm == 0 && x % 2 != 0) 
        {
            drawStar(x,y, STAR_SIZE*1.5, "lightblue");
        }
        else if (arm == 1) 
        {
            drawRect(x,y, "lightyellow"); //drawRect is always one pixel large
        }
    }
}

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}


//Upon opening document for the first time:
sizeCanvas(0); //defaults to size 0
