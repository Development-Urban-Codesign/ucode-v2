import CameraLight from '@deck.gl/core/typed/effects/lighting/camera-light';
import type { FeatureCollection } from '@turf/turf';
import maplibregl, { GeoJSONFeature, Map, type LngLatLike } from 'maplibre-gl'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export const ThreejsScene = (lng: number, lat: number, geoJson: any, glbModel: String) => {
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

  interface Model {
    path: string;
    scale: number;
    rotate: number[];
  }

  interface Sprite {
    model: Model;
    position: LngLatLike;
    altitude: number;
  }
  //const THREE = window.THREE;
  function getSpriteMatrix(sprite: Sprite, center: maplibregl.MercatorCoordinate): THREE.Matrix4 {
    const { model, position, altitude } = sprite;
    const { scale, rotate } = model;
    const rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), rotate[0]);
    const rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), rotate[1]);
    const rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), rotate[2]);

    const coord = maplibregl.MercatorCoordinate.fromLngLat(position, altitude);
    return new THREE.Matrix4()
      .makeTranslation(coord.x - center.x, coord.y - center.y, coord.z! - center.z!)
      .scale(new THREE.Vector3(scale, -scale, scale))
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);
  }

  // configuration of the custom layer for a 3D model per the CustomLayerInterface
  const customLayer = {
    id: glbModel,
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map: Map, gl: any) {
      //@ts-ignore
      this.camera = new THREE.Camera();
      //@ts-ignore
      this.scene = new THREE.Scene();

      // create two three.js lights to illuminate the model
      const ambient = new THREE.AmbientLight(0x404040);
      //@ts-ignore
      // this.scene.add(ambient);
      const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
      //@ts-ignore
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
        glbModel,
        (gltf) => {
          console.log(gltf)
          this.scene.add(gltf.scene);
          // those should come from the server
          function generateTreeCoordinates() {
            const sceneTreeCoordinates = [];
            //let lat = 0;
            let long = 0;
            if (geoJson != null) {
              for (let index = 0; index < geoJson.features.length; index++) {
                const element = geoJson.features[index].geometry.coordinates;
                // console.log(element[0]-lng)
                // console.log( " + " )
                //console.log(element[1]-lat)
                let moveVec = ([(lng - element[0]) * -100000, (lat - element[1]) * -100000])
                console.log(lng + " - " + element[0] + " // " + lat + " - " + element[1])
                console.log(modelTransform.scale)
                // console.log(modelAsMercatorCoordinate.x + "-" + localCord(element).x + "," + modelAsMercatorCoordinate.y + "-" + localCord(element).y);
                // let newPos = [(modelorigin[0] - element[0]) * 100000, (modelorigin[1] - element[1]) * 100000]
                 let newPos2 = [((localCord(element,0).x)- modelAsMercatorCoordinate.x)*1/modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(), (modelAsMercatorCoordinate.y-localCord(element,0).y )*1/modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()]//problematic getting position for the trees
                 let newPos3 = [element[0], element[1]]//problematic getting position for the trees
                 console.log(newPos2);
                 console.log(1/modelAsMercatorCoordinate.meterInMercatorCoordinateUnits());
                sceneTreeCoordinates.push(newPos2)
              }
            }
            else {
              for (let i = 0; i < 10; i++) {
                long = i * 10
                for (let index = 0; index < 10; index++) {
                  lat = index * 10
                  sceneTreeCoordinates.push([lat, long]);
                }
              }

            }
            return sceneTreeCoordinates;
          }

          const sceneTreeCoordinates = generateTreeCoordinates();
          // create wood :)
          for (let index = 0; index < sceneTreeCoordinates.length; index++) {
            // console.log("tree" +index + " Position: " + sceneTreeCoordinates[index])
            const sceneClone = gltf.scene.clone()
            // sceneClone.applyMatrix(getSpriteMatrix(
            //   {
            //     model: {
            //       path: "Tree2.glb",
            //       scale: 1,
            //       rotate: [0, 0, 0]
            //     },
            //     position: {
            //       lng: sceneTreeCoordinates[index][0],
            //       lat: sceneTreeCoordinates[index][1]
            //     }, altitude: 0
            //   }, modelAsMercatorCoordinate))
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