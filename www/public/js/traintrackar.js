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
  }
);

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
        maxWidth:4982,
        maxHeight:2588
    })
    .clamp({
        direction: 'all'
    })
    .snapZoom({
    
    
    })
    ;

let tempPath = [{"x":4341.8,"y":1052.1},{"x":4341.8,"y":1052.1},{"x":4007.2000000000003,"y":1033},{"x":3865.6000000000004,"y":910.9000000000001},{"x":3724.0000000000005,"y":788.8000000000001},{"x":3544.5,"y":790.6},{"x":3544.5,"y":790.6},{"x":3544.5,"y":790.6},{"x":3223.6,"y":777.1},{"x":3009.8,"y":1059},{"x":2927,"y":1189.8},{"x":2873.6,"y":1346.8},{"x":2301.5,"y":1450.5},{"x":2171.8,"y":1525.9},{"x":1943.2,"y":1664.1},{"x":1882.9,"y":1730.5},{"x":1822.6,"y":1796.9},{"x":1660.2,"y":1884.5},{"x":1452.1,"y":1847.3}];


loader
    .add("mapBG", 'assets/main-map-2.png')
    .add('trainRed', 'assets/trainRed.png')
    .add('trainGreen', 'assets/trainGreen.png')
    .add('trainBlue', 'assets/trainBlue.png')
    .add('trainYellow', 'assets/trainYellow.png')
    .load(loadJSONData);

window.addEventListener("resize", function() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
    viewport.resize(window.innerWidth, window.innerHeight, 7680, 4320);
});

function loadJSONData(){
    
    let map = new Sprite(loader.resources.mapBG.texture);
    viewport.addChild(map);
    
    //get train UIDS
    $.getJSON('https://api.mlab.com/api/1/databases/traintrackar/collections/TrainUID?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC', (data) => {
        for(var i = 0; i < data.length; i++){
            let trainUID = data[i].UID;
            trainUIDs.push(trainUID); //add to UID array
        }
        
        let temp = 0;
        
        for(var j = 0; j < trainUIDs.length; j++){
            let currentUID = trainUIDs[j];
            
            let url = "https://api.mlab.com/api/1/databases/traintrackar/collections/" + currentUID + "?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC"; //create API url with train UID
            
            let trainStations = [];
            
            
            $.getJSON(url, (trainData) => {
                
                let trainObjSize = Object.keys(trainData[0]).length - 1; //get length of object returned
                for(var s = 0; s < trainObjSize; s++){
                    let trainStation = trainData[0][s].stations;
                    trainStations.push(trainStation); //add station data to array
                    
                }
                
                trainDataObj[currentUID] = trainStations
                
                let currentTrainData = trainDataObj[currentUID];
                
                let firstDep = getTimeInMinutes(currentTrainData[0].times.exp_dep);
                let lastArriv = getTimeInMinutes(currentTrainData[currentTrainData.length - 1].times.exp_arriv);
                let currentTime = getTimeInMinutes();

    
    
                if(currentTime >= firstDep && currentTime <= lastArriv){
                    trains.push(new Train(map, currentUID));
                    calculateTrainPos(trains[temp]);
                    temp ++;
                }

            
            });
            


            
            
        }
    });
    
    setup();
}


function setup(){
    viewport.fitWorld();
    update();
    
    
    
}



function update(){
    requestAnimationFrame(update);
    
}

function Train(parent, UID){
    
    //pick a random colour
    this.colour = Math.floor(Math.random() * 4);
    this.colourString = "train" + trainColours[this.colour];
    this.sprite = new Sprite(loader.resources[this.colourString].texture); //create sprite using random colour value
    
    this.sprite.scale.set(1.2);
    this.sprite.anchor.set(0.5);
    this.sprite.x = 4476;
    this.sprite.y = 390;
    this.sprite.interactive = true;
    this.sprite.buttonMode = true;
    
    this.UID = UID;
    this.tween = TweenMax.to(this.sprite, 1000, {bezier: {autoRotate: ["x","y","rotation", 0, true], values:tempPath, type:"cubic"}, ease:Linear.easeNone});
    this.tl = new TimelineMax({delay:1});
    this.tl.add(this.tween, 0);
    this.sprite.on('pointerdown', () => {
        trainPopup(this);
    });
    //this.tl.pause();
    parent.addChild(this.sprite);
    
    
}

function getTimeInMinutes(time){
    var result;
    if(time){
        res = time.split(":");
        result = parseInt(res[0]) * 60 + parseInt(res[1]);
    } else {
        var today = new Date();
        result = today.getHours() * 60 + today.getMinutes();
    }
    return result;
    
}

function minutesToTime(minutes){
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    
    hours = (hours < 10) ? "0" + hours: hours;
    mins = (mins < 10) ? "0" + mins: mins;
    return hours + ":" + mins;
}

function checkIfLive(times){
    let result;
    if(times.live_dep !== null){
        result = true;
    }
    else result = false;
    return result;
}

function calculateTrainPos(train){
    currentTrainData = trainDataObj[train.UID];
    let currentTime = getTimeInMinutes();

    
    
    
        
        
        let currentStation = "PLY";
        let currentStationIndex = 0;
        let nextStation = "PLY";
        let nextStationArrival;
        let currentStationDep;
        for(var o = 0; o < currentTrainData.length -1; o++){
            var depString;
            var arrString;
            if(checkIfLive(currentTrainData[o].times)) {
                depString = "live_dep";
                arrString = "live_arriv";
            } else {
                depString = "exp_dep";
                arrString = "exp_arriv";
            }
            let stationTimeMins = getTimeInMinutes(currentTrainData[o].times[depString]);
            if(currentTime >= stationTimeMins){

                currentStation = currentTrainData[o].stationCode;
                console.log(currentTrainData[o].stationCode);
                currentStationIndex = o;
                currentStationDep = getTimeInMinutes(currentTrainData[o].times[depString])
                nextStation = currentTrainData[o+1].stationCode;
                nextStationArrival = getTimeInMinutes(currentTrainData[o+1].times[arrString]);
            }
            

        }

        //calculate position using ratio
        train.currentStation = currentStationIndex;
        let currentStationLoc = trainPoints[currentStation];
        let nextStationLoc = trainPoints[nextStation];
        let rangePos = nextStationLoc - currentStationLoc;

        let  differenceTimes = nextStationArrival - currentStationDep;

        

        let newPos =  (((currentTime - currentStationDep) / differenceTimes) * rangePos) + currentStationLoc;


        //console.log(newPos);
        
        //calculate speed
        let timeUntilArrival = (nextStationArrival - currentTime) * 60;
        let distanceUntilArrival = nextStationLoc - newPos;
        let newDuration = timeUntilArrival / distanceUntilArrival;
        train.tween.duration(newDuration);
        console.log(newDuration);
        


        train.tl.progress(newPos);

    
    
}

function trainPopup(train){
    var infoBox = document.getElementById("info-box");
    if(infoBox.style.display === "none" || !infoBox.style.display){
        
        //the train image in the popup
        infoBox.children[0].src = "assets/" + train.colourString + ".png";
        
        //setup the title values 
        let currentTrainTimes = trainDataObj[train.UID];
        let startStation = currentTrainTimes[0].station;
        let lastStation = currentTrainTimes[currentTrainTimes.length - 1].station;
        infoBox.children[1].innerHTML = startStation + " to " + lastStation;
        
        //setup subtitle
        infoBox.children[2].innerHTML = "Currently at " + currentTrainTimes[train.currentStation].station;
        
        //setup the train times
        let timeTable = infoBox.children[3].children[0].children;
        let stationOffset = train.currentStation;
        for(let i = 1; i < timeTable.length; i++){
            let currentRow = timeTable[i].children;
            let currentStationData = currentTrainTimes[stationOffset + i];
            
            if(currentStationData){
                
                //make sure row is visible
                timeTable[i].style.display = "table-row";

                //expected time
                currentRow[0].innerHTML = currentStationData.times.exp_arriv;

                //station name
                currentRow[1].innerHTML = currentStationData.station;

                //live time
                if(currentStationData.times.live_arriv){
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


