//Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Viewport = PIXI.extras.Viewport;

//Create a Pixi Application
let app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: false,
    resolution: 1
});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//array to hold trains
var trains = [];
var trainUIDs = [];

var trainDataObj = {};

//train station points along path
var trainPoints = {
    PLY: 0,
    DPT: 0.04,
    DOC: 0.05,
    KEY: 0.06,
    SBF: 0.07,
    STS: 0.08,
    SGM: 0.13,
    MEN: 0.18,
    LSK: 0.26,
    BOD: 0.37,
    LOS: 0.4,
    PAR: 0.44,
    SAU: 0.525,
    TRU: 0.71,
    RED: 0.8,
    CBN: 0.83,
    HYL: 0.87,
    SER: 0.9,
    PNZ: 1
}

//array for holding train colours.
var trainColours = [
    'Red',
    'Green',
    'Blue',
    'Yellow',
];

// create viewport
var viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 4982,
    worldHeight: 2588,
    interaction: app.renderer.interaction, // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled

});

//add the viewport to the stage
app.stage.addChild(viewport);

//activate plugins
viewport
    .drag()
    .pinch()
    .wheel()
    .clampZoom({
        minWidth: 2000,
        minHeight: 1000,
        maxWidth: 4982,
        maxHeight: 2588
    })
    .clamp({
        direction: 'all'
    })
    .snapZoom({


    });

//the bezier path data
let tempPath = [{
    "x": 4341.8,
    "y": 1052.1
}, {
    "x": 4341.8,
    "y": 1052.1
}, {
    "x": 4007.2000000000003,
    "y": 1033
}, {
    "x": 3865.6000000000004,
    "y": 910.9000000000001
}, {
    "x": 3724.0000000000005,
    "y": 788.8000000000001
}, {
    "x": 3544.5,
    "y": 790.6
}, {
    "x": 3544.5,
    "y": 790.6
}, {
    "x": 3544.5,
    "y": 790.6
}, {
    "x": 3223.6,
    "y": 777.1
}, {
    "x": 3009.8,
    "y": 1059
}, {
    "x": 2927,
    "y": 1189.8
}, {
    "x": 2873.6,
    "y": 1346.8
}, {
    "x": 2301.5,
    "y": 1450.5
}, {
    "x": 2171.8,
    "y": 1525.9
}, {
    "x": 1943.2,
    "y": 1664.1
}, {
    "x": 1882.9,
    "y": 1730.5
}, {
    "x": 1822.6,
    "y": 1796.9
}, {
    "x": 1660.2,
    "y": 1884.5
}, {
    "x": 1452.1,
    "y": 1847.3
}];

//load the files
loader
    .add("mapBG", 'assets/main-map-2.png')
    .add('trainRed', 'assets/trainRed.png')
    .add('trainGreen', 'assets/trainGreen.png')
    .add('trainBlue', 'assets/trainBlue.png')
    .add('trainYellow', 'assets/trainYellow.png')
    .load(loadJSONData);

//resize the app when screen is resized
window.addEventListener("resize", function () {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    viewport.resize(window.innerWidth, window.innerHeight, 7680, 4320);
});



function loadJSONData() {
    let map = new Sprite(loader.resources.mapBG.texture);
    viewport.addChild(map);

    //get train UIDS
    $.getJSON('https://api.mlab.com/api/1/databases/traintrackar/collections/TrainUID?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC', (data) => {
        for (var i = 0; i < data.length; i++) {
            let trainUID = data[i].UID;
            trainUIDs.push(trainUID); //add to UID array
        }

        let temp = 0;

        for (var j = 0; j < trainUIDs.length; j++) {
            let currentUID = trainUIDs[j];

            let url = "https://api.mlab.com/api/1/databases/traintrackar/collections/" + currentUID + "?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC"; //create API url with train UID

            let trainStations = []; //create empty stations array


            $.getJSON(url, (trainData) => { //use url to get json data for each train

                let trainObjSize = Object.keys(trainData[0]).length - 1; //get length of object returned
                for (var s = 0; s < trainObjSize; s++) {
                    let trainStation = trainData[0][s].stations;
                    trainStations.push(trainStation); //add station data to array

                }

                //save train station data to associated train UID in traindataObj
                trainDataObj[currentUID] = trainStations

                let currentTrainData = trainDataObj[currentUID]; //get current station data


                //setup variables to check if train is currently on map
                let firstDep = getTimeInMinutes(currentTrainData[0].times.exp_dep);
                let lastArriv = getTimeInMinutes(currentTrainData[currentTrainData.length - 1].times.exp_arriv);
                let currentTime = getTimeInMinutes();


                //if the train is on the map, create new train and calculate pos
                if (currentTime >= firstDep && currentTime <= lastArriv) {
                    trains.push(new Train(map, currentUID));
                    calculateTrainPos(trains[temp]);
                    temp++;
                }


            });





        }
    });

    setup();
}


function setup() {
    viewport.fitWorld();

}


//train object, takes a parent to allow it to add itself to the stage, and a UID.
function Train(parent, UID) {

    //pick a random colour
    this.colour = Math.floor(Math.random() * 4);
    this.colourString = "train" + trainColours[this.colour];
    this.sprite = new Sprite(loader.resources[this.colourString].texture); //create sprite using random colour value

    //scale and set sprites initial location
    this.sprite.scale.set(1.2);
    this.sprite.anchor.set(0.5);
    this.sprite.x = 4476;
    this.sprite.y = 390;

    //make interactive
    this.sprite.interactive = true;
    //change cursor to hand when hovering
    this.sprite.buttonMode = true;

    //set UID
    this.UID = UID;


    //Create GSAP tween, used to make sprite follow path. Duration is initially set to 1000 seconds, however it is changed when the speed is calculated.
    this.tween = TweenMax.to(this.sprite, 1000, {
        bezier: {
            autoRotate: ["x", "y", "rotation", 0, true],
            values: tempPath,
            type: "cubic"
        },
        ease: Linear.easeNone
    });

    //add tween to a new timeline to control position along using valu from 0-1
    this.tl = new TimelineMax({
        delay: 1
    });
    this.tl.add(this.tween, 0);

    //when sprite is clicked, run popup function
    this.sprite.on('pointerdown', () => {
        trainPopup(this);
    });

    //add to stage
    parent.addChild(this.sprite);


}


//function to get either current time in minutes, or a given time string formatted to "HH:mm"
function getTimeInMinutes(time) {
    var result;

    //if time is passed
    if (time) {
        //split string into an array
        res = time.split(":");
        //convert to minutes
        result = parseInt(res[0]) * 60 + parseInt(res[1]);
    } else {
        //create new date object
        var today = new Date();
        //conver to minutes using getHours and getMinutes
        result = today.getHours() * 60 + today.getMinutes();
    }
    //return the result
    return result;

}


//function to convert a minute value to time string.
function minutesToTime(minutes) {
    //get hours and minutes value from passed number
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;

    //if either hours or mins is less than 10, add a 0 to the front of the value to format correctly
    hours = (hours < 10) ? "0" + hours : hours;
    mins = (mins < 10) ? "0" + mins : mins;

    //concatenate hours and mins and then return
    return hours + ":" + mins;
}

//when given times array, checks if live times exist and returns true/false
function checkIfLive(times) {
    let result;
    if (times.live_dep !== null) {
        result = true;
    } else result = false;
    return result;
}


//calculates trains position
function calculateTrainPos(train) {

    //get current train using passed in train UID
    currentTrainData = trainDataObj[train.UID];

    //save current time for use later
    let currentTime = getTimeInMinutes();


    //setup temp variables
    let currentStation = "PLY";
    let currentStationIndex = 0;
    let nextStation = "PLY";
    let nextStationArrival;
    let currentStationDep;

    //loop throuh train times array
    for (var o = 0; o < currentTrainData.length - 1; o++) {

        var depString;
        var arrString;
        //check whether to use live times
        if (checkIfLive(currentTrainData[o].times)) {
            depString = "live_dep";
            arrString = "live_arriv";
        } else {
            depString = "exp_dep";
            arrString = "exp_arriv";
        }

        let stationTimeMins = getTimeInMinutes(currentTrainData[o].times[depString]); //get current station departure in minutes

        //if the current time is greater than the current station departure, then train is at, or gone past this station.
        if (currentTime >= stationTimeMins) {

            //save all the values to variables set up earlier
            currentStation = currentTrainData[o].stationCode;
            currentStationIndex = o;
            currentStationDep = getTimeInMinutes(currentTrainData[o].times[depString]);
            nextStation = currentTrainData[o + 1].stationCode;
            nextStationArrival = getTimeInMinutes(currentTrainData[o + 1].times[arrString]);
        }


    }

    //calculate position using ratio
    //using NewValue = (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin
    //We have the time it left the last station, the current time and the time it is supposed to arrive at the next station.
    //We also have the location of the last station, and the location of the next station, so using this formula we can calculate the trains current location

    //first set up variables
    train.currentStation = currentStationIndex;
    let currentStationLoc = trainPoints[currentStation];
    let nextStationLoc = trainPoints[nextStation];
    let rangePos = nextStationLoc - currentStationLoc;
    let differenceTimes = nextStationArrival - currentStationDep;

    //calculate new interpolated position
    let newPos = (((currentTime - currentStationDep) / differenceTimes) * rangePos) + currentStationLoc;


    //calculate speed using similar formula.
    //setting speed is done by setting the duration of the sprite along the timeline, how long it takes to get from the start (0), to the end (1).
    //By calculating the time we need to take until we get to the next station, and the distance the sprite needs to move to in this time, we can then divide the time by the distance to get an overall value for the duration. 
    //e.g if the train takes 5 minutes to get to the next station, and needs to move 0.1 along the line, then first get time in seconds, which is 300, then divide by 0.1, giving 3000. If the duration the train takes to move along the whole line is 3000, then to move 1/10 (0.1), it will take 300 seconds. Perfect!

    //calculate values
    let timeUntilArrival = (nextStationArrival - currentTime) * 60;
    let distanceUntilArrival = nextStationLoc - newPos;
    let newDuration = timeUntilArrival / distanceUntilArrival;

    //set the duration of the tween
    train.tween.duration(newDuration);

    //finally set the progress of the tween to match the position calculated earlier.
    train.tl.progress(newPos);



}


//function to setup correct values and display the popup box 
function trainPopup(train) {

    //get the popup box element
    var infoBox = document.getElementById("info-box");
    if (infoBox.style.display === "none" || !infoBox.style.display) {

        //setup the title values 
        let currentTrainTimes = trainDataObj[train.UID];
        let startStation = currentTrainTimes[0].station;
        let lastStation = currentTrainTimes[currentTrainTimes.length - 1].station;
        infoBox.children[0].innerHTML = startStation + " to " + lastStation;

        //setup subtitle
        infoBox.children[1].innerHTML = "Currently at " + currentTrainTimes[train.currentStation].station;

        //setup the train times
        let timeTable = infoBox.children[2].children[0].children;
        let stationOffset = train.currentStation;
        for (let i = 1; i < timeTable.length; i++) {
            let currentRow = timeTable[i].children;
            let currentStationData = currentTrainTimes[stationOffset + i];

            if (currentStationData) {

                //make sure row is visible
                timeTable[i].style.display = "table-row";

                //expected time
                currentRow[0].innerHTML = currentStationData.times.exp_arriv;

                //station name
                currentRow[1].innerHTML = currentStationData.station;

                //live time
                if (currentStationData.times.live_arriv) {
                    currentRow[2].innerHTML = currentStationData.times.live_arriv;
                } else {
                    currentRow[2].innerHTML = currentStationData.times.exp_arriv;
                }

                //delay
                let liveMinutes = getTimeInMinutes(currentRow[2].innerHTML);
                let expMinutes = getTimeInMinutes(currentRow[0].innerHTML);
                let delay = liveMinutes - expMinutes;
                currentRow[3].innerHTML = minutesToTime(delay);
            } else {

                //hide the row
                timeTable[i].style.display = "none";

            }

        }

        //delete rows if there is no station data




        infoBox.style.display = "block";
    } else {
        infoBox.style.display = "none";

    }

}