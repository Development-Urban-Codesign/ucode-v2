import {AmbientLight, PointLight, DirectionalLight, LightingEffect, _SunLight as SunLight} from '@deck.gl/core';

const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.2
});

const pointLight = new PointLight({
    color: [255, 255, 255],
    intensity: 2.0,
    // use coordinate system as the same as view state
    //position: [ng, lat, altitude]
});

const directionalLight = new DirectionalLight({
    color: [255, 255,255],
    intensity: 1,
    direction: [-1, -1, -2],  
    
});

const sunlight = new SunLight({
    timestamp: 1554927200000, 
    color: [255, 0, 0],
    intensity: 1
});

export const deckLightingEffect = new LightingEffect({ambientLight, directionalLight});