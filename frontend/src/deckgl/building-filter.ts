import { LayerExtension } from "@deck.gl/core/typed";

//Layer expander, used to rewrite and expand Shader
export class BuildingFilter extends LayerExtension {
  getShaders() {
    return {
      inject: {
        //Inject vertex shader declaration
        "vs:#decl": `
                    varying vec2 vPosition;
                `,
        //Inject vertex shader, assign value to varying variable
        "vs:#main-end": `
                    vPosition = vertexPositions;
                `,
        //Inject the fragment shader declaration
        "fs:#decl": `
                    varying vec2 vPosition;
                `,
        //Override the color drawing function
        "fs:DECKGL_FILTER_COLOR": `
                    color = vec4(color.xyz, color.w * pow(vPosition.y,2.0));
                `,
      },
    };
  }
}
