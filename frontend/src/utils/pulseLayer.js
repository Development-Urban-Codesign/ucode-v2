
import { MapboxLayer } from "@deck.gl/mapbox";
import { ScatterplotLayer } from '@deck.gl/layers';
import store from "../store/store";

export const pulseLayer = (pulseCoordinate)=> {
    const customLayer =  new MapboxLayer({
        id: 'pulse-layer',
        type: ScatterplotLayer,
        data : pulseCoordinate,
        pickable: true,
        stroked: false,
        filled: true,
        radiusUnits : 'meters',
        antialiasing: true,
        getPosition: pulseCoordinate,
        getRadius: 0,
        radiusScale: 1,
        getFillColor: d => [0, 255, 0, 255],
        getLineColor: d => [0, 0, 0],
    })
    
    let radius = 0
    let opacity = 255
    function pulseAnimation(){
      radius = radius + 0.0784
      opacity--
      customLayer.setProps({getRadius: radius, getFillColor: [0, 255, 0, opacity]})
      if (radius>=20){
        radius = 0
        opacity = 255
      }
     
      store.state.pulse.pulseAnimationActivation = requestAnimationFrame(pulseAnimation)
    }
    pulseAnimation()
    

  return (
    customLayer
  )
 
 

}