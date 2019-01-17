using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using LitJson;
using UnityEditor;

public class GetUIDs : MonoBehaviour {
	
	string URL; //to hold the url
	public GameObject trainPrefab; //the train prefab to spawn
	public GameObject popUpPrefab;
	GameObject popUpObj;
	public Transform spawnLoc; //where to initially spawn the train


	// Use this for initialization
	void Start () {
		Transform canvas = GameObject.FindGameObjectWithTag("canvas").transform; ///get the canvas' transform
		popUpObj = Instantiate(popUpPrefab, canvas); //create popup object as a child of the canvas
		popUpObj.SetActive(false);
		URL = "https://api.mlab.com/api/1/databases/traintrackar/collections/TrainUID?apiKey=QcMYUxzSPh1UFvwhGMNJHciyVqHemZmC"; //set the mLabs API url
		WWW www = new WWW(URL); //create a WWW object using the url
		StartCoroutine(LoadFromUrl(www)); //start the coroutine to spawn the train
	}

	IEnumerator LoadFromUrl(WWW www){
		yield return www;

		//check for errors
		if(www.error == null){
			JsonData itemData = JsonMapper.ToObject(www.text);
			Debug.Log(itemData.Count);
			for(var i = 0; i < itemData.Count; i++){

				//for each UID, spawn a train
				GameObject train = Instantiate(trainPrefab, spawnLoc);
				

				//pass the UID and PopUp to the train
				train.GetComponent<Train>().UID = (string) itemData[i]["UID"];
				train.GetComponent<Train>().popUpObj = popUpObj;
			}


			
		} else {
			//throw error
			Debug.Log("WWW load failed: " + www.error);
		}
	}
	
}
