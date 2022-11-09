import maplibregl, { GeoJSONFeature, Map, type CustomLayerInterface, type LngLatLike } from 'maplibre-gl'
import * as THREE from 'three'
import { reactive } from 'vue';

//@ts-ignore
// import { Sky } from 'three/addons/objects/Sky.js';

export const ThreejsSceneOnly = (lng: number, lat: number) => {
  const threeScene = reactive<THREE.Scene>({})
  const sceneAltitude = 0;
  const sceneRotate = [Math.PI / 2, Math.PI / 2, 0];
  const modelorigin: LngLatLike = maplibregl.LngLat.convert([lng, lat])
  const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
    modelorigin,
    sceneAltitude
  );

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
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
  };
  
  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer: CustomLayerInterface = {
    id: "ThreeJsScene",
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map: Map, gl: any) {
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();
      threeScene.value = this.scene

      
      const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);

      this.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xFFFDDA, .8);
      dirLight.color.setHSL(0.1, 1, 0.95);
      dirLight.position.set(- 2, 3, 1);
      dirLight.position.multiplyScalar(300);
      this.scene.add(dirLight);

      this.map = map;

      // use the Mapbox GL JS map canvas for three.js
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });
      
      this.renderer.outputEncoding = THREE.sRGBEncoding;


      this.renderer.autoClear = false;
    },
    

    render: function (gl, matrix) {
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

      this.camera.projectionMatrix = m.multiply(l);
      
      //this.renderer.state.reset();
      this.renderer.resetState();
      this.renderer.render(this.scene, this.camera);
      // console.count("triggerRepaint")
      //this.map.triggerRepaint();
    }
  };
  return (
    {"layer": customLayer, "scene":threeScene}
  )
}


