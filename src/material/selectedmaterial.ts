import * as THREE from "three";
import { selectedVertex, selectedFragment } from "../shader/selectedeffect";

export class SeletectedMaterial extends THREE.ShaderMaterial {
    constructor(params: any) {
        super();
        this.vertexShader = selectedVertex;
        this.fragmentShader = selectedFragment;
        this.uniforms = {
            pointColor: { value: (params && params.color) ? params.color : new THREE.Color(0x4b96ff) },
            opacity: { value: (params && params.opacity) ? params.opacity : 0.65 }
        };
    }
}