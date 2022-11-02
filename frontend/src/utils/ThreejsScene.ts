import maplibregl, { GeoJSONFeature, Map, type CustomLayerInterface, type LngLatLike } from 'maplibre-gl'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

//@ts-ignore
// import { Sky } from 'three/addons/objects/Sky.js';
import type { Layer } from '@deck.gl/core/typed';
import { getTransitionRawChildren } from 'vue';
import type { FeatureCollection } from '@turf/turf';

export const ThreejsScene = (lng: number, lat: number, geoJson: any, glbModel: string, hasRandomSize?: boolean, hasRandomRot?: boolean) => {
  let localSceneCoordinates: [{ position: number[], rotation: number, scale: number }]
  let currentMeshes: { mesh: any, material: any } = { mesh: [], material: []}

  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, Math.PI / 2, 0];
  const modelorigin: LngLatLike = maplibregl.LngLat.convert([lng, lat])
  const modelAsMercatorCoordinate = maplibregl.MercatorCoordinate.fromLngLat(
    modelorigin,
    modelAltitude
  );

  // transformation parameters to position, rotate and scale the 3D model onto the map
  const modelTransform = {
    translateX: modelAsMercatorCoordinate.x,
    translateY: modelAsMercatorCoordinate.y,
    translateZ: modelAsMercatorCoordinate.z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    /* Since the 3D model is in real world meters, a scale transform needs to be
    * applied since the CustomLayerInterface expects units in MercatorCoordinates.
    */
    scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
  };

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer: CustomLayerInterface = {
    id: glbModel,
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map: Map, gl: any) {

      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();


      const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
      this.scene.add(hemiLight);

      // let sky = new Sky();
      // sky.scale.setScalar(450000);
      // this.scene.add(sky);


      // use the three.js GLTF loader to add the 3D model to the three.js scene
      const loader = new GLTFLoader();
      loader.crossOrigin = true;

      loader.load(
        glbModel,
        (gltf: {
          scene: {
            children: any; clone: () => any;
          };
        }) => {
          currentMeshes = { mesh: [], material: []}
          getAllMeshes(gltf.scene)

          localSceneCoordinates = generateTreeCoordinates(geoJson);
          const clusters = createGeoInstances(localSceneCoordinates);

          for (let index = 0; index < clusters.length; index++) {
            this.scene.add(clusters[index]);
          }
        }
      );

      this.map = map;

      // use the Mapbox GL JS map canvas for three.js
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });

      this.renderer.autoClear = false;
      console.count("onAdd")
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
  function getRndNumber(min: number, max: number) {
    return (Math.random() * (max - min)) + min;
  }
  const getAllMeshes = (scene: { children: any; clone: () => any; }) => {
    if (scene.children != undefined) {
      for (let index = 0; index < scene.children.length; index++) {
        const element = scene.children[index];
        if (element.geometry != undefined) {
          //console.log("geo is: " + element.geometry)
          currentMeshes.mesh.push(element.geometry)
          currentMeshes.material.push(element.material)
        }
        else {
          getAllMeshes(element)
        }
      }
    }
    else { console.log("no more Children...") }
  }
  const localCord = (worldCords: LngLatLike, height: number) => {
    const local = maplibregl.MercatorCoordinate.fromLngLat(
      worldCords,
      height
    );
    return local
  }
  function generateTreeCoordinates(_geoJson: any) {
    localSceneCoordinates = [];
    for (let index = 0; index < 100; index++) {
      getRndNumber(0, 90)
      
    }
    if (_geoJson != null) {
      for (let index = 0; index < _geoJson.features.length; index++) {
        const element = _geoJson.features[index].geometry.coordinates;
        // console.log(modelAsMercatorCoordinate.x + "-" + localCord(element).x + "," + modelAsMercatorCoordinate.y + "-" + localCord(element).y);
        // let newPos = [(modelorigin[0] - element[0]) * 100000, (modelorigin[1] - element[1]) * 100000]
        let localPos = { position: [((localCord(element, 0).x) - modelAsMercatorCoordinate.x) * 1 / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(), (modelAsMercatorCoordinate.y - localCord(element, 0).y) * 1 / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()], rotation: getRndNumber(0, 90), scale: getRndNumber(0.5, 1) }//problematic getting position for the trees
        
        localSceneCoordinates.push(localPos)
      }
    }
    else {
      let _lat = 0;
      let _long = 0;
      for (let i = 0; i < 500; i++) {
        _long = i * 10
        for (let index = 0; index < 100; index++) {
          _lat = index * 10
          localSceneCoordinates.push({position:[_lat, _long], rotation: 0, scale:1});
        }
      }

    }
    return localSceneCoordinates;
  }
  const createGeoInstances = (localSceneCoordinates: [{ position: number[], rotation: number, scale: number }]) => {
    const clusters = []
    
    for (let index = 0; index < currentMeshes.mesh.length; index++) {
      const mesh = currentMeshes.mesh[index];
      const material = currentMeshes.material[index]
      var cluster = new THREE.InstancedMesh(
        mesh,
        material,
        localSceneCoordinates.length, //instance count 
        false, //is it dynamic 
        false, //does it have color 
        true,  //uniform scale
      );
      const matrix = new THREE.Matrix4();
      for (let index = 0; index < localSceneCoordinates.length; index++) {
        if (hasRandomSize) {
          matrix.makeScale(localSceneCoordinates[index].scale, localSceneCoordinates[index].scale, localSceneCoordinates[index].scale)
          
        }
        if(hasRandomRot){
          matrix.makeRotationY(localSceneCoordinates[index].rotation,localSceneCoordinates[index].rotation,localSceneCoordinates[index].rotation)
        }
        matrix.setPosition(localSceneCoordinates[index].position[1], 0, localSceneCoordinates[index].position[0]);
        console.log(matrix)
        cluster.setMatrixAt(index, matrix)

        // old approach, without instancing
        // const sceneClone = gltf.scene.clone()
        // sceneClone.translateZ(localSceneCoordinates[index][0]);
        // sceneClone.translateX(localSceneCoordinates[index][1]);
        //this.scene.add(sceneClone);              
      }
      clusters.push(cluster)
    }
    return clusters
  }
  return (
    customLayer
  )



}


