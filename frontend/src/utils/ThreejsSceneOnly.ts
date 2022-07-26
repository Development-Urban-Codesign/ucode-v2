import maplibregl, {
  Map,
  type CustomLayerInterface,
  type LngLatLike,
} from "maplibre-gl";
import * as THREE from "three";
import { FogExp2, Scene } from "three";
import type * as glMatrix from "gl-matrix";



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
  const sceneRotate = [Math.PI / 2, Math.PI / 2, 0];
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

  const mainScene = new ThreeJsScene();
  const mainCamera = new THREE.Camera();
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
      // use the Mapbox GL JS map canvas for three.js

      mainRenderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });

      mainRenderer.outputEncoding = THREE.sRGBEncoding;
      mainRenderer.autoClear = false;
    },

    render: function (gl, matrix) {
      mainCamera.projectionMatrix = getProjectionMatrix(
        modelAsMercatorCoordinate,
        matrix
      );
      // console.log(matrix)
      // mainCamera.updateWorldMatrix(true, true)
      // console.log(mainCamera.position)
      // mainRenderer.state.reset();
      mainRenderer.resetState();
      mainRenderer.render(mainScene, mainCamera);
      // console.count("triggerRepaint")
      //this.map.triggerRepaint();
    },
  };
  return { layer: customLayer, scene: mainScene };
};
