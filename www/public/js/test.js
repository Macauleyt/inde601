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

var trainDataOBj;

//train station points along path
var trainPoints = {
    PLY: 0.5343,
    DPT: 0.55,
    DOC: 0.58,
    KEY: 0.6,
    SBF: 0.61,
    STS: 0.62,
    SGM: 0.63,
    MEN: 0.64,
    LSK: 0.65432,
    BOD: 0.69,
    LOS: 0.72,
    PAR: 0.74146,
    SAU: 0.8,
    TRU: 0.86642,
    RED: 0.88,
    CBN: 0.9,
    HYL: 0.94,
    SER: 0.96,
    PNZ: 1
}

// create viewport
var viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 7680,
    worldHeight: 4320,
    interaction: app.renderer.interaction // the interaction module is important for wheel() to work properly when renderer.view is placed or scaled
});

//add the viewport to the stage
app.stage.addChild(viewport);

//activate plugins
viewport
    .drag()
    .pinch()
    .wheel()
    .clampZoom({
        minWidth: 3000,
        minHeight: 1000,
        maxWidth:7680,
        maxHeight:4320
    })
    .clamp({
        direction: 'all'
    });

let tempPath = [{"x":4476,"y":390},{"x":4476,"y":390},{"x":4445.6,"y":731.8},{"x":4675.3,"y":972.4},{"x":4816,"y":1146.6},{"x":4825.4,"y":1133.1},{"x":4833.1,"y":1175},{"x":4840.799999999999,"y":1216.9},{"x":4819.7,"y":1495.5},{"x":5177,"y":1483.6},{"x":5363.7,"y":1485},{"x":5389.6,"y":1589.5},{"x":5398.1,"y":1659.8999999999999},{"x":5406.6,"y":1730.2999999999997},{"x":5458.799999999999,"y":1931.1},{"x":5533.9,"y":1977},{"x":5604.2,"y":2017.5},{"x":5685.1,"y":2023.6},{"x":5564.4,"y":2191.6},{"x":5442,"y":2234.3},{"x":5327,"y":2296.3},{"x":5170.6,"y":2489.2999999999997},{"x":5014.2,"y":2682.2999999999993},{"x":4821.8,"y":2635.6},{"x":4715,"y":2679},{"x":4608.2,"y":2722.4},{"x":4390.6,"y":2847.5},{"x":4375.4,"y":2872},{"x":4302.200000000001,"y":2862.5},{"x":3986,"y":2823.3},{"x":3888.2000000000003,"y":2723.5},{"x":3790.4,"y":2623.7},{"x":3541.7000000000003,"y":2606.2},{"x":3508.9000000000005,"y":2612},{"x":3476.2000000000003,"y":2617.8},{"x":3244.3,"y":2644.9},{"x":3042.7000000000003,"y":2860.9},{"x":3005.1000000000004,"y":2938.8},{"x":2981,"y":3164.9},{"x":2335.1000000000004,"y":3270.3},{"x":2223.6000000000004,"y":3335},{"x":1910.9000000000003,"y":3543.7000000000003},{"x":1834.7000000000003,"y":3611.7000000000003},{"x":1758.5000000000002,"y":3679.7000000000003},{"x":1489,"y":3677.8},{"x":1489,"y":3677.8}];


loader
    .add("mapBG", 'assets/main-map.png')
    .add('trainRed', 'assets/trainred.png')
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
        
        for(var j = 0; j < trainUIDs.length; j++){
            let currentUID = trainUIDs[j];
            
            let url = "https://api.mlab.com/api/1/databases/traintrackar/collections/" + currentUID + "?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC"; //create API url with train UID
            
            let trainStations = [];
            
            let temp = 0;
            $.getJSON(url, (trainData) => {
                
                let trainObjSize = Object.keys(trainData[0]).length - 1; //get length of object returned
                for(var s = 0; s < trainObjSize; s++){
                    let trainStation = trainData[0][s].stations;
                    trainStations.push(trainStation); //add station data to array
                    
                }
                
                trainDataOBj = {
                    [currentUID] : trainStations
                }
                trains.push(new Train(map, currentUID));
                calculateTrainPos(trains[temp]);
                temp ++;
            
            });
            


            for(var u = 0; u < trains.length; u++){

            }
            
        }
    });
    
    setup();
}


function setup(){
    viewport.fitWorld();
    update();
    
    
    
}

function buildTimeline(tween) {
  
  
}

function update(){
    requestAnimationFrame(update);
    
}

function Train(parent, UID){
    this.sprite = new Sprite(loader.resources.trainRed.texture);
    this.sprite.scale.set(1.2);
    this.sprite.anchor.set(0.5);
    this.sprite.x = 4476;
    this.sprite.y = 390;
    this.UID = UID;
    var tween = TweenMax.to(this.sprite, 1000, {bezier: {autoRotate: ["x","y","rotation", 0, true], values:tempPath, type:"cubic"}, ease:Linear.easeNone});
    this.tl = new TimelineMax({delay:1});
    this.tl.add(tween, 0);
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

function calculateTrainPos(train){
    currentTrainData = trainDataOBj[train.UID];
    let currentTime = getTimeInMinutes();
    let currentStation = "PLY";
    let nextStation = "PLY";
    let nextStationArrival;
    let currentStationDep;
    for(var o = 0; o < currentTrainData.length -1; o++){
        let stationTimeMins = getTimeInMinutes(currentTrainData[o].times.exp_dep);
        if(currentTime >= stationTimeMins){
            
            currentStation = currentTrainData[o].stationCode;
            currentStationDep = getTimeInMinutes(currentTrainData[o].times.exp_dep)
            nextStation = currentTrainData[o+1].stationCode;
            nextStationArrival = getTimeInMinutes(currentTrainData[o+1].times.exp_arriv);
        }
        
    }
    
    let currentStationLoc = trainPoints[currentStation];
    let nextStationLoc = trainPoints[nextStation];
    let rangePos = nextStationLoc - currentStationLoc;
    
    let  differenceTimes = nextStationArrival - currentStationDep;
    
    let newPos =  (((currentTime - currentStationDep) / differenceTimes) * rangePos) + currentStationLoc;
    
    
    console.log(newPos);
    
    
    
    train.tl.progress(newPos);
    
    
}


