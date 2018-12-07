//Aliases
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;

//Create a Pixi Application
let app = new Application({ 
    width: 256, 
    height: 256,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);

var superData

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);


loader
    .add('uidData', 'https://api.mlab.com/api/1/databases/traintrackar/collections?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC')
    .load(setup);

function setup(){
    for(var i = 0; i < loader.resources.uidData.data.length; i++){
        loader.resources.uidData.data[i]
    }
}