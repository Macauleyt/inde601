//setup consts
const express = require("express");
const bodyParser = require(`body-parser`);
const app = express();
const port = process.env.PORT || 3000;
const request = require("request");
var path = require("path");

//mongo API setup
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://trainadmin:test123@ds251332.mlab.com:51332/traintrackar";
var mLab = require("mongolab-data-api")("QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC");

var session = require("express-session");
var sess;

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(express.static("www/public"));
app.use(
    session({
        secret: "traintrackarSecret"
    })
);

app.listen(port, () => {
    console.log(`App is listening to ${port}`);
});

/* ----- SERVER GET SETUP -----*/
app.get("/home", (req, res) => {
    res.sendFile(__dirname + "/www/index.html");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/www/public/pages/splash.html");
});

app.get("/test", (req, res) => {
    res.sendFile(__dirname + "/www/test.html");
});


app.get("/about", (req, res) => {
    res.sendFile(__dirname + "/www/public/pages/about.html");
});

app.get("/contact", (req, res) => {
    res.sendFile(__dirname + "/www/public/pages/contact.html");
});



function updateTrainData() {
    //request data from transport API
    request(
        "https://transportapi.com/v3/uk/train/station/PLY/live.json?app_id=2564b3aa&app_key=aca773df543a23bf176c9bba29674a06&calling_at=DPT&darwin=false&destination=PNZ&from_offset=PT12:00:00&origin=PLY&to_offset=PT04:00:00&train_status=passenger", {
            json: true
        },
        (err, res, mainBody) => {
            if (err) {
                return console.log(err);
            }
            //connect to mongoDB
            MongoClient.connect(
                url,
                function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("traintrackar");
                    var trainUIDCol = dbo.collection("TrainUID");

                    //on each refresh of data, first find all train UIDs that previously exist using the trainUID collection
                    trainUIDCol.find({}).toArray(function (err, result) {
                        if (err) throw err;

                        //for each UID, delete the associated collection
                        for (var i = 0; i < result.length; i++) {
                            console.log(result[i].UID);
                            dbo.collection(result[i].UID).drop(function (err, delOK) {
                                if (err) throw err;
                                if (delOK) console.log("train collection deleted");
                            });
                        }

                        //delete all old UIDs from TrainUID collection
                        trainUIDCol.deleteMany({}, (err, res) => {
                            if (err) throw err;
                        });


                    });
                    for (var t = 0; t < mainBody.departures.all.length; t++) {
                        //request the train times
                        request(
                            mainBody.departures.all[t].service_timetable.id, {
                                json: true
                            },
                            (err, res, body) => {
                                if (err) {
                                    return console.log(err);
                                }
                                //create object to hold train times
                                var traintimearray = {};

                                //for each stop, save the data to variables
                                for (var i = 0; i < body.stops.length; i++) {
                                    var station = body.stops[i].station_name;
                                    var expdept = body.stops[i].expected_departure_time;
                                    var livedept = body.stops[i].aimed_departure_time;
                                    var exparr = body.stops[i].expected_arrival_time;
                                    var livearr = body.stops[i].aimed_arrival_time;
                                    var status = body.stops[i].status;
                                    var plat = body.stops[i].platform;
                                    var stationCode = body.stops[i].station_code;

                                    //create new object in array with data
                                    traintimearray[i] = {
                                        stations: {
                                            station: station,
                                            stationCode: stationCode,
                                            times: {
                                                exp_dep: expdept,
                                                live_dep: livedept,
                                                exp_arriv: exparr,
                                                live_arriv: livearr
                                            }
                                        },
                                        status: status,
                                        platform: plat
                                    };
                                }

                                //connect to mongoDB
                                MongoClient.connect(
                                    url,
                                    function (err, db) {
                                        if (err) throw err;
                                        var dbo = db.db("traintrackar");
                                        var trainUIDCol = dbo.collection("TrainUID");

                                        //create new object holding the new UID
                                        var trainUIDObj = {
                                            UID: body.train_uid
                                        };

                                        //insert UID object into the trainUID collection
                                        trainUIDCol.insertOne(trainUIDObj, (err, res) => {
                                            if (err) throw err;
                                            console.log("TrainUID data replaced");
                                        });

                                        dbo
                                            .collection(body.train_uid)
                                            .insertOne(traintimearray, (err, res) => {
                                                //add document to collection using the passed in collection name
                                                if (err) throw err;
                                                console.log(body.train_uid + "train collection updated");
                                                db.close;
                                            });

                                        //console.log(result);


                                    });

                            }
                        );
                    }
                }
            );

        });
}
updateTrainData();
setInterval(updateTrainData, 600000);