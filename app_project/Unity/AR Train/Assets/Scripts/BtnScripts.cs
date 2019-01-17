using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class BtnScripts : MonoBehaviour {


	public Transform mainMenu;
	public Transform aboutPageLoc;
	public Transform mainMenuLoc;
	public float transitionSpeed;
	public Button aboutBtn;
	private bool aboutShow = false;
	private bool menuShow = false;

	//functions to control main menu activity
	public void OnStartButton() {
		SceneManager.LoadScene("ARScene", LoadSceneMode.Single); //load the scene
	}

	public void OnAboutButton(){
		aboutShow = true;
	}

	public void OnBackButton(){
		menuShow = true;
	}

	public void OnFBButton(){
		Application.OpenURL("https://www.facebook.com/TrainTrackAR/");
	}

	public void OnTwitButton(){
		Application.OpenURL("https://twitter.com/TrainTrackAR");
	}

	public void OnGitButton(){
		Application.OpenURL("https://github.com/Macauleyt/inde601");
	}
	void FixedUpdate(){
		if(aboutShow){ //if about has been clicked
			//start moving upwards
			Vector3 newPos = new Vector3(mainMenu.position.x, mainMenu.position.y + (transitionSpeed), mainMenu.position.z); 
			mainMenu.position = newPos;
			if(mainMenu.position.y >= aboutPageLoc.position.y) { //if in position
				aboutShow = false; //stop moving
				aboutBtn.interactable = false; //make the about button no longer clickable
			}
		}

		if(menuShow){ //if back button is clicked
			//start moving downwards
			Vector3 newPos = new Vector3(mainMenu.position.x, mainMenu.position.y - (transitionSpeed), mainMenu.position.z);
			mainMenu.position = newPos;
			if(mainMenu.position.y <= mainMenuLoc.position.y){ //if back to where it began
				menuShow = false; //stop moving
				aboutBtn.interactable = true; //make the about button clickable again
			}
		}

	}

}

