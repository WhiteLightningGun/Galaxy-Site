//CANVAS SECTION

let canvas = document.getElementById("CanvasBox");
let CTX = canvas.getContext("2d");

//DEFINE IMPORTANT letIABLES
let DIMENSIONS = [300, 500]; // side length of the square canvas in which the galaxy is drawn
let CENTRE_X = DIMENSIONS[0] / 2; //Defaulting to biggest window size
let CENTRE_Y = DIMENSIONS[0] / 2;
let STAR_SIZE = 0.002*CENTRE_X;
let S = 0; //Selector letiable for DIMENSIONS
let PROBABILITY = [] //Stores the probability scalar field
let RADIUS = CENTRE_X*0.9;

//LISTENERS

let radius_input = document.getElementById('armRadius');
radius_input.addEventListener('radius_input', drawCanvas());


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

    //Grab selected values from DOM
    let radius = document.getElementById("armRadius").value;
    let fuzz_fac = (document.getElementById("fuzzFactor").value)/10;
    let theta_fac = document.getElementById("thetaFactor").value;
    let spiral_fac = (document.getElementById("spiralFactor").value)/100;

    drawArms(spiral_fac, radius, 0, fuzz_fac, theta_fac);

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

    let grd = CTX.createRadialGradient
    (
        CENTRE_X, //x-coord location
        CENTRE_Y, //y-coord location
        0.20*CENTRE_X, //radius as fraction of constant
        CENTRE_X,
        CENTRE_Y,
        1*CENTRE_X
    )

    grd.addColorStop(1, "black");
    grd.addColorStop(0, colour); // Looks nice as a very dark blue

    // Fill with gradient
    CTX.fillStyle = grd;
    CTX.fillRect(0, 0, DIMENSIONS[S], DIMENSIONS[S]);
  }

function drawRect(x_coord, y_coord, fill_colour) {
    // This draws a single pixel at a given (x,y) point
    CTX.beginPath();
    CTX.fillRect( x_coord, y_coord, 1, 1 );
    CTX.fillStyle = fill_colour 
    CTX.fill();
}

function drawStar(x_coord, y_coord, star_size, fill_col){
    CTX.beginPath();
    //Note: arc takes arguments of form x, y, radius, start angle, end angle, counter-clockwise (bool)
    CTX.arc(x_coord, y_coord, star_size, 0, 2 * Math.PI, false);
    CTX.fillStyle = fill_col;
    CTX.fill();
}

function probabilityField(p, x, y, dis, spr) {
    // Use a normal distribution to randomly distribute coordinates for a star pixel
    // based on proximity to the coordinate centre of the canvas
    // This must iterate through all 90000 pixels on the 300x300 canvas (at a minimum)

    // function: f(r) = (P)*e^-(((r - displacement)^2)/spread)
    // read the equation, take note of all variables

    // r is for radius, which will be calculated in the usual way: sqrt(x^2 + y^2)
    // xy_to_radius has been implemented for this in the HELPER FUNCTIONS area below, it will take arguments x, y

    // displacement (let dis) centres the distribution on a certain coordinate relative to r
    // obviously the displacement will always be zero, i.e. at dead centre of galaxy

    // spread (let spr) defines how far it will spread out from the central point

    // P (let p) is a normalisation factor defining the maximum possible probability 
    // this should not exceed 1 for obvious reasons

    // All variables will be tunable by the user via a slider control on the HTML

    let inner_term = (((xy_to_radius(x,y) - dis)**2)/spr)
    let probability_scalar = p*Math.exp(-inner_term)

    return probability_scalar;
}

function getProbabilityField(){
    //grab parameters from DOM and generate probability field array applicable to every (x,y) point on canvas
    let spread = document.getElementById("spreadRange").value;
    let sW = DIMENSIONS[S] //sW means screen width
    let starDensity = (document.getElementById("starDensity").value)/100; // Divided by 100 because the slider cannot return floats I believe

    resultsArray = [] //results to be returned stored here

    //generate probability field thereof
    for (let i = 0; i < sW; i++){
        for (let j = 0; j < sW; j++){
            resultsArray.push(probabilityField(starDensity, i, j, 0, spread));
        }
    }
        return resultsArray;
}

function starField(probability_array) {
    let c = 0;
    let sW = DIMENSIONS[S] //sW means screen width
    for (let i = 0; i < sW; i++){
        for (let j = 0; j < sW; j++){
            if(Math.random() <= probability_array[c])
            {
                drawStar(i,j, STAR_SIZE, "white");
            }
            c = c + 1;
        }
    }
}

function spirals(b, r, rot_fac, fuz_fac, arm, theta_arg)
{
    /*
    Draws spiral arms

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


    for(let i = 0; i < theta_arg; i++)
    {
        theta = degrees_to_radians(i);

        let x = r*Math.exp(b*theta) * Math.cos(theta + Math.PI * rot_fac)
        + ((Math.random() - Math.random()) *fuzz) * fuz_fac*(1 - 0.6*(i/theta_arg));

        let y = r*Math.exp(b*theta) * Math.sin(theta + Math.PI * rot_fac)
        + ((Math.random() - Math.random()) *fuzz) * fuz_fac*(1 - 0.6*(i/theta_arg));

        spiral_stars.push([x+offset, y+offset]); //offset normalises coordinates to centre on the canvas around the centre
    }

    let ssLen = spiral_stars.length 

    for(let k = 0; k < ssLen; k++)
    {
        let x = spiral_stars[k][0];
        let y = spiral_stars[k][1];

        // These conditions ensure some slight colour and radius variation are added to the stars based on evenness or oddness of x coordinate
        // the arm that trails slightly behind the main arm, selected with arm = 1 in function arguments, will be light yellow

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

// HELPER FUNCTIONS

function degrees_to_radians(degrees)
{
  let pi = Math.PI;
  return degrees * (pi/180);
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

//Upon opening document for the first time:
sizeCanvas(0); //defaults to size 0
