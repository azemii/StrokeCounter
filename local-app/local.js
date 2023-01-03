const input = document.querySelector("#file");
// Storage variables for the data.
let timesArray = [];
let accelerationArray = [];
let rollArray = [];
let yawArray = [];
let distanceArray = [];

input.addEventListener("change", async (e) => {
	clearAllArrays();
	const file = e.target.files[0];
	const data = await parseCSV(file);
	for (let i = 0; i < data.length; i++) {
		if (i > 3) {
			const element = data[i];
			timesArray.push(element[0].split(";")[0]);
			distanceArray.push(element[0].split(";")[4]) ;
			accelerationArray.push(element[0].split(";")[7]);
			rollArray.push(element[0].split(";")[12]);
			yawArray.push(element[0].split(";")[10]);
		}
	}
	detectRowingStrokes();
});


async function parseCSV(file) {
	const fileContents = await file.text();
	const rows = fileContents.split("\n");
	const data = rows.map((row) => row.split(","));
	return data;
}

function detectRowingStrokes() {
	let tempStroke = [];
	let yawMovement = [];
	let strokeCounter = 0;
	let firstStroke = "";
	for (let i = 0; i < rollArray.length; i++) {
		// A stroke is detected when the roll angle is between 0 and 3 degrees
		if (Math.abs(rollArray[i]) > 3) {
			tempStroke.push(rollArray[i]);
			yawMovement.push(yawArray[i] - yawArray[0]);
		}
		// If the 3 degree threshold is passed, and we then drop below 1 degree, we have a stroke.
		else if (tempStroke.length > 0 && Math.abs(rollArray[i]) < 1) {
			// If the yaw is negative, we have a left stroke, otherwise a right stroke, only done for the first stroke.
			if (strokeCounter < 1) {
				if (Math.abs(Math.min(...yawMovement)) > Math.abs(Math.max(...yawMovement))) {
					firstStroke = "left";
				} else {
					firstStroke = "right";
				}
			}
			// Reset the temporary arrays and increase the stroke counter.
			yawMovement = [];
			tempStroke = [];
			strokeCounter++;
		}
	}
	console.log("Strokes: " + strokeCounter);
	displayResults(firstStroke, strokeCounter);
}

function clearAllArrays() {
	timesArray = [];
	accelerationArray = [];
	rollArray = [];
	yawArray = [];
	distanceArray = [];
}

function displayResults(firstStroke, strokeCounter) {
	let elapsedTime = timesArray[timesArray.length - 1 - 5]; // Seconds
	let averageStrokeRate = Math.round(strokeCounter / (elapsedTime/60));
	let totalDistance = distanceArray[distanceArray.length - 1 - 5] - distanceArray[0]; // Meters

	let results = document.querySelector(".results")
	results.style.display = "block"
	
	document.querySelector(".strokes").innerHTML = strokeCounter;
	document.querySelector(".start").innerHTML = firstStroke;
	document.querySelector(".average").innerHTML = averageStrokeRate;
	document.querySelector(".distance").innerHTML = totalDistance.toFixed(1);
	document.querySelector(".time").innerHTML = elapsedTime;


}