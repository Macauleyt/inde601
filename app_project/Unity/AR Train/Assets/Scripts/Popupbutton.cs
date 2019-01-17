using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Popupbutton : MonoBehaviour {

	GameObject canvasObject;

	void Start(){
		canvasObject = GameObject.FindGameObjectWithTag("canvas");
	}

	//handles back button behaviour on popup window
	public void OnBackButton(){
		canvasObject.transform.GetChild(0).gameObject.SetActive(false);
	}
}
