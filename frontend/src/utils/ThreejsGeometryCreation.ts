import type { BoundingBox } from "@/store/modules/aoi";
import type { Feature, FeatureCollection, Polygon, Position } from "@turf/turf";
import maplibregl, { MercatorCoordinate, type LngLatLike } from "maplibre-gl";
import type { BufferGeometry, Group } from "three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type TransformationWrapper = {
  position: number[];
  rotation: number;
  scale: number;
};

type Mesh = {
  geometry: BufferGeometry;
  material: [];
};
export interface THREEPolygonSettings{
  scene: THREE.Scene, bbox: BoundingBox, geoJson: FeatureCollection, color: string, zIndex: number, extrude: number
}
export function addPolygonsFromCoordsAr(settings: THREEPolygonSettings): void {
  
  const material = new THREE.MeshStandardMaterial({ color: settings.color, side: THREE.DoubleSide })//THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
  settings.geoJson.features.forEach((feature: Feature, index: number) => {
    console.log(index + ": " + feature.geometry)
    const vertAr: THREE.Vector2[] = []
    feature.geometry.coordinates[0].forEach((coord: Position, index: number) => {
      console.log(index + ": " + coord)
      let pos: THREE.Vector3 = worldPointInRelativeCoord(new maplibregl.LngLat(coord[0], coord[1]), settings.bbox)
      // console.log(pos)
      vertAr.push(new THREE.Vector2(pos.z, pos.x))

    })

    const shape = new THREE.Shape(vertAr);
    let geometry: BufferGeometry
    if (settings.extrude == 0) {
      geometry = new THREE.ShapeGeometry(shape, 0);
      // .rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2)
    }
    else {
      const extrudeSettings = {
        steps: 1,
        depth: settings.extrude,
        bevelEnabled: false,
        bevelThickness: settings.extrude,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 1
      };
      geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
      // geometry.translate(0, 0,100)
      
    }
    //const material = new THREE.MeshBasicMaterial({ color: 0x2C343D, side: THREE.DoubleSide });//A4766D E9E9DD E8D3B0 8697AF 4A5666 2C343D
    geometry.rotateX(-Math.PI / 2)
    // geometry.computeVertexNormals()
    const mesh = new THREE.Mesh(geometry, material);
    mesh.translateY(settings.extrude/2)
    // mesh.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2)
    settings.scene.add(mesh)
  })
  // for (let index = 0; index < geoJson.features.length; index++) {
  //   let pos: THREE.Vector3 = worldPointInRelativeCoord(geoJson.features[index].geometry.coordinates, bbox)
  //   //console.log(pos)
  //   vertAr.push(new THREE.Vector2(pos.z, pos.x))
  // }
  // //console.log(vertAr)
  // const shape = new THREE.Shape(vertAr);
  // const geometry = new THREE.ShapeGeometry(shape);
  // geometry.rotateX(Math.PI / 2)// .rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2)
  // const material = new THREE.MeshBasicMaterial({ color: 0x2C343D, side: THREE.DoubleSide });//A4766D E9E9DD E8D3B0 8697AF 4A5666 2C343D
  // const mesh = new THREE.Mesh(geometry, material);
  // // mesh.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2)
  // scene.add(mesh)
}

export function addGeoOnPointsToThreejsScene(
  scene: THREE.Scene,
  geoJson: any,
  glbModel: string,
  bbox: BoundingBox,
  hasRandomSize?: number[],
  hasRandomRot?: boolean
): void {
  //console.log(scene);

  // use the three.js GLTF loader to add the 3D model to the three.js scene
  const loader = new GLTFLoader();
  loader.crossOrigin = "true";

  loader.load(
    glbModel,
    (gltf) => {
      const currentMeshes = getAllMeshes(gltf.scene);
      const treeCoordinates = generateTreeCoordinates(
        geoJson,
        bbox,
        hasRandomSize
      );
      const clusters = createGeoInstances(
        treeCoordinates,
        currentMeshes,
        hasRandomSize,
        hasRandomRot
      );
      clusters.forEach((cluster) => scene.add(cluster));
    }
  );
}
function worldPointInRelativeCoord(LngLatPoint: LngLatLike, bbox: BoundingBox) {
  let wrapperCords = localCordsFromWorldCords(maplibregl.LngLat.convert([bbox.xmin, bbox.ymin]), 0);
  let objectCords = localCordsFromWorldCords(LngLatPoint, 0);

  const relativePosition: THREE.Vector3 = new THREE.Vector3(
    ((wrapperCords.x-objectCords.x) * 1) / wrapperCords.meterInMercatorCoordinateUnits(),
    0,
    ((wrapperCords.y - objectCords.y) * 1) / wrapperCords.meterInMercatorCoordinateUnits(),
  );
  return relativePosition
}

function getAllMeshes(scene: Group): Mesh[] {
  const extractMesh = (scene: Group, meshes: Mesh[] = []): Mesh[] => {
    if (scene.children == undefined) {
      console.log("no more Children...");
      return meshes;
    }
    scene.children.forEach((sceneChild: any) => {
      if (sceneChild.geometry != undefined) {
        //console.log("geo is: " + element.geometry)
        meshes.push({
          geometry: sceneChild.geometry,
          material: sceneChild.material,
        });
      } else {
        extractMesh(sceneChild, meshes);
      }
    });
    return meshes;
  };
  return extractMesh(scene);
}

function createGeoInstances(
  localSceneCoordinates: TransformationWrapper[],
  currentMeshes: Mesh[],
  hasRandomSize?: number[],
  hasRandomRot = false
): THREE.InstancedMesh[] {
  return currentMeshes.map((mesh) => {
    return createMeshInstance(
      mesh.geometry,
      mesh.material,
      localSceneCoordinates,
      hasRandomSize,
      hasRandomRot
    );
  });
}

function createMeshInstance(
  mesh: BufferGeometry,
  material: [],
  localSceneCoordinates: TransformationWrapper[],
  hasRandomSize: number[] | undefined,
  hasRandomRot: boolean
) {
  const cluster = new THREE.InstancedMesh(
    mesh,
    material,
    localSceneCoordinates.length
  );

  localSceneCoordinates.forEach((localSceneCoordinate, index) => {
    let scale = new THREE.Vector3(1, 1, 1);
    let rotation = new THREE.Quaternion();
    let position = new THREE.Vector3(
      localSceneCoordinate.position[2],
      localSceneCoordinate.position[1],
      localSceneCoordinate.position[0]
    );

    if (hasRandomSize !== undefined) {
      scale = new THREE.Vector3(
        localSceneCoordinate.scale,
        localSceneCoordinate.scale,
        localSceneCoordinate.scale
      );
    }
    if (hasRandomRot) {
      let rot = localSceneCoordinate.rotation;
      let eulerRot = new THREE.Euler(0, rot, 0, "XYZ");
      rotation = rotation.setFromEuler(eulerRot);
    }

    const matrix = new THREE.Matrix4();
    matrix.compose(position, rotation, scale);
    cluster.setMatrixAt(index, matrix);
  });

  return cluster;
}

function generateTreeCoordinates(
  _geoJson: any,
  bbox: BoundingBox,
  hasRandomSize?: number[]
): TransformationWrapper[] {
  const localSceneCoordinates: TransformationWrapper[] = [];
  // for (let index = 0; index < 100; index++) {
  //   console.log(getRndNumber(0, 90))

  // }
  if (_geoJson != null) {
    for (let index = 0; index < _geoJson.features.length; index++) {
      const element = _geoJson.features[index].geometry.coordinates;

      let rot = getRndNumber(0, Math.PI / 2);
      let scl = getRndNumber(
        hasRandomSize ? hasRandomSize[0] : 1,
        hasRandomSize ? hasRandomSize[1] : 1
      );
      let cords = localCordsFromWorldCords(
        maplibregl.LngLat.convert([bbox.xmin, bbox.ymin]),
        0
      );
      let localPos = {
        position: [
          ((localCordsFromWorldCords(element, 0).x - cords.x) * 1) /
          cords.meterInMercatorCoordinateUnits(),
          0,
          ((cords.y - localCordsFromWorldCords(element, 0).y) * 1) /
          cords.meterInMercatorCoordinateUnits(),
        ],
        rotation: rot,
        scale: scl,
      }; //problematic getting position for the trees

      localSceneCoordinates.push(localPos);
    }
  } else {
    let _lat = 0;
    let _long = 0;
    for (let i = 0; i < 500; i++) {
      _long = i * 10;
      for (let index = 0; index < 100; index++) {
        _lat = index * 10;
        localSceneCoordinates.push({
          position: [_lat, _long],
          rotation: 0,
          scale: 1,
        });
      }
    }
  }
  return localSceneCoordinates;
}

function getRndNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function localCordsFromWorldCords(
  worldCords: LngLatLike,
  height = 0
): MercatorCoordinate {
  return maplibregl.MercatorCoordinate.fromLngLat(worldCords, height);
}
