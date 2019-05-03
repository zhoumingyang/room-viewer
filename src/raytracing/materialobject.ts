
import * as THREE from 'three';

export class MaterialObject {
    public type: number;
    public albedoTextureID: number;
    public color: THREE.Color;
    public roughness: number;
    public metalness: number;
    opacity: number;
    refractiveIndex: number;
    constructor() {
        this.type = 1;
        this.albedoTextureID = -1;
        this.color = new THREE.Color(1.0, 1.0, 1.0);
        this.roughness = 0.0;
        this.metalness = 0.0;
        this.opacity = 1.0;
        this.refractiveIndex = 1.0;
    }
}