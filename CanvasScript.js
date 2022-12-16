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

function sizeCanvas(s) {
    //Directly set cavas size according to switch
    S = s;
    canvas.width = DIMENSIONS[S];
    canvas.height = DIMENSIONS[S];

    //set new constants
    CENTRE_X = DIMENSIONS[S] / 2;
    CENTRE_Y = DIMENSIONS[S] / 2;
    STAR_SIZE = 0.002*CENTRE_X; // This could be a free parameter as well

    // Redraw everything after resizing the window
    drawCanvas();
  }

  function drawCanvas() {
    // Order matters, start with the furthest objects and progress to the "nearest"
    background();
    //centralStar();
    PROBABILITY = getProbabilityField();
    //offset();
    starField(PROBABILITY);

    console.log("drawCanvas finished")

  }

  //FUNCTIONS

  function background() {

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
    grd.addColorStop(0, "#000040"); //A very dark blue

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

function drawStar(x_coord, y_coord){
    CTX.beginPath();
    //Note: arc takes arguments of form x, y, radius, start angle, end angle, counter-clockwise (bool)
    CTX.arc(x_coord, y_coord, STAR_SIZE, 0, 2 * Math.PI, false);
    CTX.fillStyle = "white";
    CTX.fill();
}

function offset() {
    //creates a little offset star, for testing purposes, unimportant
    CTX.beginPath();
    CTX.arc(CENTRE_X*0.75, 0.75*CENTRE_Y, STAR_SIZE, 0, 2 * Math.PI, false);
    CTX.fillStyle = "yellow";
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
    //grab parameters from DOM
    array = []
    var spread = document.getElementById("spreadRange").value;
    var sW = DIMENSIONS[S] //sW means screen width

    //generate probability field thereof
    for (var i = 0; i < sW; i++){
        for (var j = 0; j < sW; j++){
        array.push(probabilityField(0.11, i, j, 0, spread));
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
                drawStar(i,j);
                
            }
            c = c + 1;
            

        }
    }
}
console.log(Math.random());
//Upon opening document for the first time:
sizeCanvas(0); //defaults to size 0
