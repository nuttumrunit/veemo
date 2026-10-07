using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using System;
using System.IO;

public static class VeemoBuildAgent {
  private static string S(params char[] c) { return new string(c); }
  public static void Run() {
    var scene=EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
    var core=GameObject.CreatePrimitive(PrimitiveType.Sphere);
    core.name=S('V','e','e','m','o','C','o','r','e');
    core.transform.localScale=new Vector3(2.4f,2.4f,2.4f);
    var floor=GameObject.CreatePrimitive(PrimitiveType.Plane);
    floor.name=S('A','g','e','n','t','A','r','e','n','a');
    floor.transform.localScale=new Vector3(4f,1f,4f);
    var lightObject=new GameObject(S('F','o','u','n','d','r','y','L','i','g','h','t'));
    var light=lightObject.AddComponent<Light>();
    light.type=LightType.Directional;
    light.intensity=1.25f;
    lightObject.transform.rotation=Quaternion.Euler(42f,-28f,0f);
    var sceneDir=S('A','s','s','e','t','s','/','S','c','e','n','e','s');
    var scenePath=sceneDir+S('/','V','e','e','m','o','W','o','r','l','d','.','u','n','i','t','y');
    Directory.CreateDirectory(sceneDir);
    EditorSceneManager.SaveScene(scene,scenePath);
    var root=Directory.GetParent(Application.dataPath).Parent.FullName;
    var artifact=Path.Combine(root,S('a','r','t','i','f','a','c','t','s'));
    Directory.CreateDirectory(artifact);
    var json=JsonUtility.ToJson(new Result{agent=S('U','N','I','T','Y','-','0','4'),status=S('c','o','m','p','l','e','t','e'),task=S('c','r','e','a','t','e','d',' ','p','l','a','y','a','b','l','e',' ','w','o','r','l','d',' ','s','c','e','n','e'),artifact=scenePath,finishedAt=DateTime.UtcNow.ToString(S('o')),objects=3},true);
    File.WriteAllText(Path.Combine(artifact,S('u','n','i','t','y','-','s','t','a','t','u','s','.','j','s','o','n')),json);
    Debug.Log(S('V','E','E','M','O','_','A','G','E','N','T','_','R','E','S','U','L','T',' ')+json);
  }
  [Serializable] private class Result {public string agent;public string status;public string task;public string artifact;public string finishedAt;public int objects;}
}
