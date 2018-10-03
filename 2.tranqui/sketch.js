//var yoff = 0.0;        // 2nd dimension of perlin noise
var divisions = 5;
var cnv;
var speed = 5;



function preload(){
	song = loadSound('https://ia800600.us.archive.org/26/items/TheNightLoopTheBirthdayMassacreWebsiteMusic/The%20Night%20Loop%20%28The%20Birthday%20Massacre%20Website%20Music%29.mp3');
}

function setup() {
  
	//background(220, 220, 220);
	cnv = createCanvas(windowWidth, windowHeight);
	background('#6C3483');
	noFill();
	strokeWeight(1);
	stroke(255, 255, 255);
	
	
	song.loop();
  fft = new p5.FFT(0.9, 1024);
  fft.setInput(song);
	//fill('#9B59B6');
	//nofill();
	
	stroke(0,100);
}

function mousePressed() {
  if ( song.isPlaying() ) { // .isPlaying() returns a boolean
    song.pause();
  } else {
    song.loop();
  }
}

function draw() {
	var h = height/divisions;
  var spectrum = fft.analyze();
  var newBuffer = [];

  var scaledSpectrum = splitOctaves(spectrum, 12);
  var len = scaledSpectrum.length;

  background(108, 52, 131, 10);
  //background('#6C3483');
	// copy before clearing the background
  copy(cnv,0,0,width,height,0,speed,width,height);
	
	beginShape();
		curveVertex(0, h);

    for (var i = 0; i < len; i++) {
      var point = smoothPoint(scaledSpectrum, i, 2);
      var x = map(i, 0, len-1, 0, width);
      var y = map(point, 0, 255, h, 0);
      curveVertex(x, y);
    }

    // one last point at the end
    curveVertex(width, h);
  endShape(CLOSE);
	
}




function splitOctaves(spectrum, slicesPerOctave) {
  var scaledSpectrum = [];
  var len = spectrum.length;

  // default to thirds
  var n = slicesPerOctave|| 3;
  var nthRootOfTwo = Math.pow(2, 1/n);

  // the last N bins get their own 
  var lowestBin = slicesPerOctave;

  var binIndex = len - 1;
  var i = binIndex;


  while (i > lowestBin) {
    var nextBinIndex = round( binIndex/nthRootOfTwo );

    if (nextBinIndex === 1) return;

    var total = 0;
    var numBins = 0;

    // add up all of the values for the frequencies
    for (i = binIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }

    // divide total sum by number of bins
    var energy = total/numBins;
    scaledSpectrum.push(energy);

    // keep the loop going
    binIndex = nextBinIndex;
  }

  // add the lowest bins at the end
  for (var j = i; j > 0; j--) {
    scaledSpectrum.push(spectrum[j]);
  }

  // reverse so that array has same order as original array (low to high frequencies)
  scaledSpectrum.reverse();

  return scaledSpectrum;
}


// average a point in an array with its neighbors
function smoothPoint(spectrum, index, numberOfNeighbors) {

  // default to 2 neighbors on either side
  var neighbors = numberOfNeighbors || 2;
  var len = spectrum.length;

  var val = 0;

  // start below the index
  var indexMinusNeighbors = index - neighbors;
  var smoothedPoints = 0;

  for (var i = indexMinusNeighbors; i < (index+neighbors) && i < len; i++) {
    // if there is a point at spectrum[i], tally it
    if (typeof(spectrum[i]) !== 'undefined') {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  val = val/smoothedPoints;

  return val;
}
