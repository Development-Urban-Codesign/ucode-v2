import maplibregl, {
  Map,
  type CustomLayerInterface,
  type LngLatLike,
} from "maplibre-gl";
import * as THREE from "three";
import { Scene } from "three";
import type * as glMatrix from "gl-matrix";
//import { relativeCoordInWorldPoint } from "./ThreejsGeometryCreation";


let ThreeScenes: ThreeJsScene[] = []
export class ThreeJsScene extends Scene {
  constructor() {
    super();
    this.setup();
  }

  setup() {

    // this.fog = new FogExp2(0xffffff,.1)
  }
}


export function getProjectionMatrix(
  modelAsMercatorCoordinate: maplibregl.MercatorCoordinate,
  matrix: glMatrix.mat4
): THREE.Matrix4 {
  //  const sceneRotate = [0, 0, 0];
  const sceneRotate = [0, 0, 0];
  // transformation parameters to position, rotate and scale the 3D scene onto the map
  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: sceneRotate[0],
    rotateY: sceneRotate[1],
    rotateZ: sceneRotate[2],
    /* Since the 3D model is in real world meters, a scale transform needs to be
     * applied since the CustomLayerInterface expects units in MercatorCoordinates.
     */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
  };

  const rotationX = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(1, 0, 0),
    modelTransform.rotateX
  );
  const rotationY = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 1, 0),
    modelTransform.rotateY
  );
  const rotationZ = new THREE.Matrix4().makeRotationAxis(
    new THREE.Vector3(0, 0, 1),
    modelTransform.rotateZ
  );

  const m = new THREE.Matrix4().fromArray(matrix);
  const l = new THREE.Matrix4()
    .makeTranslation(
      modelTransform.translateX,
      modelTransform.translateY,
      modelTransform.translateZ
    )
    .scale(
      new THREE.Vector3(
        modelTransform.scale,
        -modelTransform.scale,
        modelTransform.scale
      )
    )
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);

  return m.multiply(l);
}

export const ThreejsSceneOnly = (lng: number, lat: number, layerName: string) => {
  const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);

  const dirLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
  // dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(-2, 3, 1);
  dirLight.position.multiplyScalar(1);
  let camInverseProjection: THREE.Matrix4
  let cameraPosition: THREE.Vector3
  let cameraTransform: any
  let raycaster: any
  let mainMap: any
  const mainScene = new ThreeJsScene();
  const mainCamera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
  const helper = new THREE.CameraHelper(mainCamera);
  mainScene.add(helper);

  let mainRenderer = new THREE.WebGLRenderer();
  mainScene.add(hemiLight);
  mainScene.add(dirLight);
  const sceneAltitude = 0;
  const modelorigin: LngLatLike = maplibregl.LngLat.convert([lng, lat]);
  const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
    modelorigin,
    sceneAltitude
  );

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer: CustomLayerInterface = {
    id: layerName,
    type: "custom",
    renderingMode: "3d",
    onAdd: function (map: Map, gl: any) {

      mainMap = map

      const { x, y, z } = modelAsMercatorCoordinate;
      const s = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();
      const scale = new THREE.Matrix4().makeScale(s, s, -s);
      const rotation = new THREE.Matrix4().multiplyMatrices(
        new THREE.Matrix4().makeRotationX(-0.5 * Math.PI),
        new THREE.Matrix4().makeRotationY(Math.PI / 2));

      cameraTransform = new THREE.Matrix4().multiplyMatrices(scale, rotation).setPosition(x, y, z);


      mainRenderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });

      mainRenderer.outputEncoding = THREE.sRGBEncoding;
      mainRenderer.autoClear = false;

      raycaster = new THREE.Raycaster();
      raycaster.near = -1;
      raycaster.far = 1e6;
      raycaster.layers.set(1);


    },

    render: function (gl, matrix) {
      mainCamera.projectionMatrix = new THREE.Matrix4().fromArray(matrix).multiply(cameraTransform);
      // console.log("matrix")
      // console.log(matrix)
      mainRenderer.resetState();
      mainRenderer.render(mainScene, mainCamera);
      // console.count("triggerRepaint")
      //this.map.triggerRepaint();
      camInverseProjection = mainCamera.projectionMatrix.invert();
      cameraPosition = new THREE.Vector3().applyMatrix4(camInverseProjection);
      if(layerName == 'ownComments'){
        mainScene.children.forEach((child) =>{
          child.lookAt(cameraPosition)
          // console.log(cameraPosition)
        })
      }
    },
    //@ts-ignore
    raycast(point: any) {
      var mouse = new THREE.Vector2();
      // debugger
      // // scale mouse pixel position to a percentage of the screen's width and height
      mouse.x = (point.x / mainMap.transform.width) * 2 - 1;
      mouse.y = 1 - (point.y / mainMap.transform.height) * 2;
      
      const mousePosition = new THREE.Vector3(mouse.x, mouse.y, 1).applyMatrix4(camInverseProjection);
      const viewDirection = mousePosition.clone().sub(cameraPosition).normalize();

      raycaster.set(cameraPosition, viewDirection);

      // calculate objects intersecting the picking ray
      // var intersects = raycaster.intersectObjects(mainScene.children, true);
      // console.log("Layers: " + ThreeScenes.length )
      for (const scene of ThreeScenes) {
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          // console.log(mainScene.children)
          const obj = mainScene.children[mainScene.children.length-1]
          obj.position.x = intersects[0].point.x
          obj.position.z = intersects[0].point.z
          obj.position.y = intersects[0].point.y
          mainMap.triggerRepaint()
          break;
        }
       
      };
      
    },


  };
  ThreeScenes.push(mainScene)
  return { layer: customLayer, scene: mainScene };
};
