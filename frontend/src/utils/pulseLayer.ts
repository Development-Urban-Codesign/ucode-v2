import { ScatterplotLayer } from "@deck.gl/layers/typed";
import { MapboxLayer } from "@deck.gl/mapbox/typed";
import store from "../store/store";

export const pulseLayer = (pulseCoordinate: any) => {
  const customLayer = new MapboxLayer({
    id: "pulse-layer",
    //@ts-ignore
    type: ScatterplotLayer,
    data: pulseCoordinate,
    pickable: true,
    stroked: false,
    filled: true,
    radiusUnits: "meters",
    antialiasing: true,
    getPosition: pulseCoordinate,
    getRadius: 0,
    radiusScale: 1,
    getFillColor: () => [0, 255, 0, 255],
    getLineColor: () => [0, 0, 0],
  });

  let radius = 0;
  let opacity = 255;
  function pulseAnimation() {
    radius = radius + 0.0784;
    opacity--;

    customLayer.setProps({
      getRadius: radius,
      getFillColor: [0, 255, 0, opacity],
    } as any);

    if (radius >= 20) {
      radius = 0;
      opacity = 255;
    }

    store.state.pulse.pulseAnimationActivation =
      //@ts-ignore
      requestAnimationFrame(pulseAnimation);
  }
  pulseAnimation();

  return customLayer;
};
