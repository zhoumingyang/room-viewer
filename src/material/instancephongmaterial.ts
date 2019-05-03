import * as THREE from "three";
import { instanceVertex, instanceFragment } from "../shader/instancephong";

THREE.ShaderLib.phong = {
    uniforms: THREE.ShaderLib.phong.uniforms,
    vertexShader: instanceVertex,
    fragmentShader: THREE.ShaderLib.phong.fragmentShader
}

module.exports = THREE.ShaderLib.phong;