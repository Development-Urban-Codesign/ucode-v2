import maplibregl, { BindElementBuffer, CollisionCircleArray } from 'maplibre-gl'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
export const TreeModel = (lng, lat, treeJson, id) => {
  const modelAltitude = 0;
  const modelRotate = [Math.PI / 2, 0, 0];
  const modelorigin = [lng, lat]
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

  //const THREE = window.THREE;

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer = {
    id: id,
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map, gl) {
      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();

      // create two three.js lights to illuminate the model
      const ambient = new THREE.AmbientLight(0x404040);
      this.scene.add(ambient);
      const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
      this.scene.add(hemiLight);

      // use the three.js GLTF loader to add the 3D model to the three.js scene
      const loader = new GLTFLoader();
      loader.crossOrigin = true;
      const localCord = (worldCords, height) => {
        const local = maplibregl.MercatorCoordinate.fromLngLat(
          worldCords,
          height
        );
        return local
      }
      loader.load(
        "Tree2.glb",
        (gltf) => {
          console.log(gltf)
          this.scene.add(gltf.scene);
          // those should come from the server
          function generateTreeCoordinates() {
            const sceneTreeCoordinates = [];
            let lat = 0;
            let long = 0;
            for (let index = 0; index < treeJson.features.length; index++) {
              const element = treeJson.features[index].geometry.coordinates;
               console.log(modelAsMercatorCoordinate.x +"-"+ localCord(element).x+","+modelAsMercatorCoordinate.y +"-"+ localCord(element).y);
              let newPos = [(modelorigin[0] - element[0])*100000,(modelorigin[1] - element[1])*100000]
              let newPos2 = [(modelAsMercatorCoordinate.x - localCord(element).x)*10000000, (modelAsMercatorCoordinate.y - localCord(element).y)*10000000]//problematic getting position for the trees
              console.log(newPos2);
              sceneTreeCoordinates.push(newPos2)
            }

            // for (let i = 0; i < 100; i++) {
            //   long = i * 10
            //   for (let index = 0; index < 100; index++) {
            //     lat = index * 10
            //     sceneTreeCoordinates.push([lat, long]);
            //   }
            // }
            return sceneTreeCoordinates;
          }

          const sceneTreeCoordinates = generateTreeCoordinates();
          // create wood :)
          for (let index = 0; index < sceneTreeCoordinates.length; index++) {
            // console.log("tree" +index + " Position: " + sceneTreeCoordinates[index])
            const sceneClone = gltf.scene.clone()
            sceneClone.translateZ(sceneTreeCoordinates[index][0]);
            sceneClone.translateX(sceneTreeCoordinates[index][1]);
            this.scene.add(sceneClone);
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

  return (
    customLayer
  )



}