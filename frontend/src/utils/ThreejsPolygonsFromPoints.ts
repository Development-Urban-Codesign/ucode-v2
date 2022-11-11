import type { BoundingBox } from '@/store/modules/aoi'
import maplibregl, { Map, type CustomLayerInterface, type LngLatLike } from 'maplibre-gl'
import * as THREE from 'three'


//@ts-ignore
// import { Sky } from 'three/addons/objects/Sky.js';

export const ThreejsPolygon = (bbox: BoundingBox, geoJson: FeatureCollection) => {
  let localSceneCoordinates: [{ position: number[], rotation: number, scale: number }]

  const modelAltitude = 0;
  const modelRotate = [0, 0, 0];
  const lng: number = bbox.xmin
  const lat: number = bbox.ymin
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
    id: "ThreeJsPolygon_" + Date.now(),
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map: Map, gl: any) {

      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();


      const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);

      this.scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xFFFDDA, .8);
      dirLight.color.setHSL(0.1, 1, 0.95);
      dirLight.position.set(- 2, 3, 1);
      dirLight.position.multiplyScalar(300);
      this.scene.add(dirLight);

      // geoJson.features.forEach(console.log(worldPointInRelativeCoord(geoJson.features.geometry.coordinates)))
      const vertAr: THREE.Vector2[] = []
      //   -1.0, -1.0,  1.0,
      //    1.0, -1.0,  1.0,
      //    1.0,  1.0,  1.0,

      //    1.0,  1.0,  1.0,
      //   -1.0,  1.0,  1.0,
      //   -1.0, -1.0,  1.0
      // ] );
      for (let index = 0; index < geoJson.features.length; index++) {
        let pos: THREE.Vector3 = worldPointInRelativeCoord(geoJson.features[index].geometry.coordinates)
        
        vertAr.push(new THREE.Vector2(pos.x, pos.z))
      }
      console.log(vertAr)
      const shape = new THREE.Shape(vertAr);
      //shape.moveTo(0,0)
      // for (let verts in vertAr) {
      //   shape.bezierCurveTo(verts)
        
      // }
      const geometry = new THREE.ShapeGeometry(shape);

      // const extrudeSettings = { depth: 0, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
      // const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

      // const vertices = new Float32Array(vertAr);
      // console.log(vertices)
      // var indices = THREE.Earcut.triangulate(vertAr, [], 3);
      // geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertAr, 3));
      // geometry.setIndex(indices);
      const material = new THREE.MeshBasicMaterial({ color: 0x2C343D, side: THREE.DoubleSide });//A4766D E9E9DD E8D3B0 8697AF 4A5666 2C343D
      const mesh = new THREE.Mesh(geometry, material);
      
      this.scene.add(mesh)

       

      this.map = map;

      // use the Mapbox GL JS map canvas for three.js
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true
      });
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.autoClear = false;
      //console.count("onAdd")
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
  const localCord = (worldCords: LngLatLike, height: number) => {
    const local = maplibregl.MercatorCoordinate.fromLngLat(
      worldCords,
      height
    );
    return local
  }
  function worldPointInRelativeCoord(LngLatPoint: LngLatLike) {
    const relativePosition: THREE.Vector3 = new THREE.Vector3(
      ((localCord(LngLatPoint, 0).x) - modelAsMercatorCoordinate.x) * 1 / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
      0,
      (modelAsMercatorCoordinate.y - localCord(LngLatPoint, 0).y) * 1 / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    );
    return relativePosition
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

        let localPos = { position: [((localCord(element, 0).x) - modelAsMercatorCoordinate.x) * 1 / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(), 0, (modelAsMercatorCoordinate.y - localCord(element, 0).y) * 1 / modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()], rotation: rot, scale: scl }//problematic getting position for the trees

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
    customLayer
  )



}


