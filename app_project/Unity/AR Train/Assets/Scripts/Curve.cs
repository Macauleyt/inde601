using UnityEngine;
using BansheeGz.BGSpline.Components;

[RequireComponent(typeof(BGCcMath))]
public class Curve : MonoBehaviour
{

    //function to calculate position using value from 0-1 
    public void calculatePos(Transform objectToMove, float ratio){
        Vector3 tangent;
        objectToMove.position = GetComponent<BGCcMath>().CalcPositionAndTangentByDistanceRatio(ratio, out tangent);
        objectToMove.rotation = Quaternion.LookRotation(tangent);

    }

} 

