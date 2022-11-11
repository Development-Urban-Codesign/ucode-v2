import type { BoundingBox } from "@/store/modules/aoi"
import maplibregl, { MercatorCoordinate, type LngLatLike } from 'maplibre-gl'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'


export const AddGeoOnPointsToThreejsScene = (scene: THREE.Scene, geoJson: any, glbModel: string, bbox:BoundingBox, hasRandomSize?: number[], hasRandomRot?: boolean) => {
  let localSceneCoordinates: [{ position: number[], rotation: number, scale: number }]
  let currentMeshes: { mesh: any, material: any } = { mesh: [], material: [] }
  

  const sceneUpdate = () => {
    console.log(scene)
    
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
        currentMeshes = { mesh: [], material: [] }
        getAllMeshes(gltf.scene)
        localSceneCoordinates = generateTreeCoordinates(geoJson);
        const clusters = createGeoInstances(localSceneCoordinates);

        for (let index = 0; index < clusters.length; index++) {
          scene.add(clusters[index]);

        }
      }
    )
  };

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

  function generateTreeCoordinates(_geoJson: any) {
    localSceneCoordinates = [];
    // for (let index = 0; index < 100; index++) {
    //   console.log(getRndNumber(0, 90))

    // }
    if (_geoJson != null) {
      for (let index = 0; index < _geoJson.features.length; index++) {
        const element = _geoJson.features[index].geometry.coordinates;

        let rot = getRndNumber(0, Math.PI / 2)
        let scl = getRndNumber(hasRandomSize ? hasRandomSize[0] : 1, hasRandomSize ? hasRandomSize[1] : 1)
        let cords= localCordsFromWorldCords(maplibregl.LngLat.convert([bbox.xmin, bbox.ymin]),0)
        let localPos = { position: [((localCordsFromWorldCords(element, 0).x) - cords.x) * 1 / cords.meterInMercatorCoordinateUnits(), 0, (cords.y - localCordsFromWorldCords(element, 0).y) * 1 / cords.meterInMercatorCoordinateUnits()], rotation: rot, scale: scl }//problematic getting position for the trees

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
          localSceneCoordinates.push({ position: [_lat, _long], rotation: 0, scale: 1 });
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

      for (let index = 0; index < localSceneCoordinates.length; index++) {
        const matrix = new THREE.Matrix4();
        let scale = new THREE.Vector3(1, 1, 1);
        let rotation = new THREE.Quaternion();
        let position = new THREE.Vector3(localSceneCoordinates[index].position[2], localSceneCoordinates[index].position[1], localSceneCoordinates[index].position[0]);

        if (hasRandomSize !== undefined) {
          scale = new THREE.Vector3(localSceneCoordinates[index].scale, localSceneCoordinates[index].scale, localSceneCoordinates[index].scale)

        }
        if (hasRandomRot) {
          let rot = localSceneCoordinates[index].rotation
          let eulerRot = new THREE.Euler(0, rot, 0, 'XYZ');
          rotation = rotation.setFromEuler(eulerRot)

        }

        matrix.compose(position, rotation, scale)
        cluster.setMatrixAt(index, matrix)

      }
      clusters.push(cluster)
    }
    return clusters
  }
  return (
    sceneUpdate()
  )
}


function getRndNumber(min: number, max: number):number {
    return Math.random() * (max - min) + min;
}

export function localCordsFromWorldCords(worldCords: LngLatLike, height=0):MercatorCoordinate {
    return maplibregl.MercatorCoordinate.fromLngLat(worldCords, height);
}