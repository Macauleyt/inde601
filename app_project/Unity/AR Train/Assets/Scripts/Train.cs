using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using LitJson;
using BansheeGz.BGSpline.Components;
using UnityEngine.UI;

public class Train : MonoBehaviour {

	public string UID; //This trains UID
	Transform canvasObject;
	public GameObject popUpObj;
	
	
	Dictionary<string, float> stationLoc; //dictionary to hold station locations along bezier curve

	string currentStationName;
	int currentStationIndex;
	GameObject curve;
	JsonData parsedData;

	// Use this for initialization
	void Start () {
		createStationDictionary(); //begin to create dictionary
		curve = GameObject.FindGameObjectWithTag("curve"); //get reference to the curve object
		
		string dbUrl = "https://api.mlab.com/api/1/databases/traintrackar/collections/" + UID + "?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC"; //create the mLabs API url using UID.
		WWW www = new WWW(dbUrl); //create www object
		StartCoroutine(LoadFromUrl(www)); //start coroutine to get the data and parse
	}


	//dictionary to hold station positions along curve
	void createStationDictionary(){
		stationLoc = new Dictionary<string, float>();
		stationLoc.Add("PLY", 0);
		stationLoc.Add("DPT", 0.04f);
		stationLoc.Add("DOC", 0.05f);
		stationLoc.Add("KEY", 0.06f);
		stationLoc.Add("SBF", 0.07f);
		stationLoc.Add("STS", 0.08f);
		stationLoc.Add("SGM", 0.13f);
		stationLoc.Add("MEN", 0.18f);
		stationLoc.Add("LSK", 0.26f);
		stationLoc.Add("BOD", 0.37f);
		stationLoc.Add("LOS", 0.4f);
		stationLoc.Add("PAR", 0.44f);
		stationLoc.Add("SAU", 0.525f);
		stationLoc.Add("TRU", 0.71f);
		stationLoc.Add("RED", 0.8f);
		stationLoc.Add("CBN", 0.83f);
		stationLoc.Add("HYL", 0.87f);
		stationLoc.Add("SER", 0.9f);
		stationLoc.Add("PNZ", 1);

	}
	
	IEnumerator LoadFromUrl(WWW www){
		yield return www;

		//check for errors
		if(www.error == null){
			JsonData itemData = JsonMapper.ToObject(www.text); //parse the raw JSON text as an object using LitJson
			parsedData = itemData[0];
			CalculatePosition(parsedData); //pass to the calculate position function

			
		} else {

			//throw errors
			Debug.Log("WWW load failed: " + www.error);
		}
	}

	void CalculatePosition(JsonData data){

		//check if train is currently active
		int firstDep = TimeToMinutes((string) data[1]["stations"]["times"]["exp_dep"]);
		int lastArr = TimeToMinutes((string) data[data.Count - 1]["stations"]["times"]["exp_arriv"]);
		int currentTime = TimeToMinutes(System.DateTime.Now.ToString("HH:mm"));
		
		string currentStation = "PLY";
		int currentStationDep = 0;
		string nextStation = "PLY";
		int nextStationArrival = 0;

		if(currentTime >= firstDep && currentTime <= lastArr){ //if train is active
			
			//loop through times to get current location and times
			for(var i = 1; i < data.Count - 1; i++){
				int stationTime = TimeToMinutes((string) data[i]["stations"]["times"]["exp_dep"]);
				if(currentTime >= stationTime){
					currentStation = (string) data[i]["stations"]["stationCode"];
					currentStationDep = TimeToMinutes((string) data[i]["stations"]["times"]["exp_dep"]);
					nextStation = (string) data[i + 1]["stations"]["stationCode"];
					nextStationArrival = TimeToMinutes((string) data[i + 1]["stations"]["times"]["exp_arriv"]);
					currentStationName = (string) data[i]["stations"]["station"];
					currentStationIndex = i;
				}
			}

			//calculate the position
			float currentStationLoc = stationLoc[currentStation];
			float nextStationLoc = stationLoc[nextStation];

			float range = nextStationLoc - currentStationLoc;

			int differenceTimes = nextStationArrival - currentStationDep;
			float newPos = ((((currentTime - currentStationDep) / (float) differenceTimes) * range) + currentStationLoc);

			curve.GetComponent<Curve>().calculatePos(gameObject.transform, newPos);


		} else { //if not active
			Destroy(gameObject);
		}


	}

	//function to convert a time string to minutes for easier calculation
	int TimeToMinutes(string time){
		string[] strArr;
		strArr = time.Split(':');
		return (int.Parse(strArr[0]) * 60) + int.Parse(strArr[1]);
	}

	//function to convert a minute value to time string.
	string MinutesToTime(int mins){
		//get hours and minutes from passed minutes value
		int hours = Mathf.FloorToInt(mins / 60);
		int minutes = mins % 60;

		//if either hours or mins is less than 10, add a 0 to the front of the value to format correctly
		string hourString = (hours < 10) ? "0" + hours.ToString() : hours.ToString();
		string minString = (minutes < 10) ? "0" + minutes.ToString() : minutes.ToString();

		//concatenate hours and mins and then return
		string returnString = hourString + ":" + minString;
		return returnString;
	}


	void Update(){

		//detect touches on trains in the AR view
		foreach (Touch touch in Input.touches){
			Ray ray = Camera.main.ScreenPointToRay(touch.position);
			
			if (touch.phase == TouchPhase.Began)
			{
				RaycastHit hit = new RaycastHit();
				if (Physics.Raycast(ray, out hit, 1000))
				{
					hit.transform.gameObject.SendMessage("populatePopUp"); //run the populate popup function for the specific train tapped
					popUpObj.gameObject.SetActive(true); //show the popup

					
				}
			}
		}	
	}

	public void populatePopUp(){
		
		//set currently at text
		Text currently = popUpObj.transform.GetChild(1).gameObject.GetComponent<Text>();
		currently.text = "Currently at " + currentStationName;

		//set up timetable
		GameObject times = popUpObj.transform.GetChild(2).gameObject;
		int numberToCount = parsedData.Count - 1 - currentStationIndex; //number of stations to loop through
		numberToCount = (numberToCount > 5) ? 5 : numberToCount; //if more than 5, set to 5
				
		for(var i = 0; i < numberToCount; i++){
			GameObject currentRow = times.transform.GetChild(i).gameObject; //get current row
			currentRow.SetActive(true); //make sure row is visible
			JsonData currentStation = parsedData[currentStationIndex + i + 1]["stations"]; //get current station data

			//expected time
			Text expected = currentRow.transform.GetChild(0).gameObject.GetComponent<Text>();
			expected.text = (string) currentStation["times"]["exp_arriv"];

			//destination name
			Text destination = currentRow.transform.GetChild(1).gameObject.GetComponent<Text>();
			destination.text = (string) currentStation["station"];
			
			//actual time
			Text actual = currentRow.transform.GetChild(2).gameObject.GetComponent<Text>();
			actual.text = (string) currentStation["times"]["live_arriv"];

			//delay
			Text delay = currentRow.transform.GetChild(3).gameObject.GetComponent<Text>();
			int expArrivMins = TimeToMinutes((string) currentStation["times"]["exp_arriv"]);
			int liveArrivMins = TimeToMinutes((string) currentStation["times"]["live_arriv"]);
			int delayMins = liveArrivMins - expArrivMins;
			
			delay.text = MinutesToTime(delayMins);
			
									
		}

		//delete empty rows
		for(var i = 4; i >= numberToCount; i--){
			GameObject currentRow = times.transform.GetChild(i).gameObject;
			currentRow.SetActive(false);
		}


	}

	
	
}

