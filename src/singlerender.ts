import * as THREE from "three";
import { fpsDomRender } from "./ui/fps/fps";
import { ReturnButtonShow } from "./ui/returnbutton/returnbutton";
import { FirstPersonCameraControls } from "./raytracing/firstpersoncameracontrols";
import { MaterialObject } from "./raytracing/materialobject";
import { BVH_Build_Iterative } from "./raytracing/bvh_acc_structure_Iterative_builder";
import { screenTextureShader, screenOutputShader } from "./raytracing/pathtracingcommon";
import { THREEx } from "./raytracing/threex_keyboardstate";
import { geoUtil } from "./extension/BufferGeometryUtils";
import { commonRTXVertex } from "./raytracing/shader/common_PathTracing_Vertex";
import { spotLightRTXFragment } from "./raytracing/shader/BVH_Spot_Light_Source_Fragment";
require("three-obj-loader")(THREE);

const pixelRatio: number = 0.5;
const modelScale: number = 0.3;
const modelPositionOffset: THREE.Vector3 = new THREE.Vector3(0, 18, -40);
let frameTime;
let oldYawRotation: number, oldPitchRotation: number;
const camFlightSpeed: number = 60;
let focusDistance: number = 132.0;
let apertureSize: number = 0.0;
let increaseFocusDist: boolean = false;
let decreaseFocusDist: boolean = false;
let increaseAperture: boolean = false;
let decreaseAperture: boolean = false;
let cameraRecentlyMoving: boolean = false;
let sceneIsDynamic: boolean = false;

let objUrl = "https://jr-prod-pim-products.oss-cn-beijing.aliyuncs.com/i/fcb8e0dc-4266-41e6-9a79-4e8630c6b9db/model.obj";

declare global {
    interface Document {
        pointerLockElement?: any;
        mozPointerLockElement?: any;
        webkitPointerLockElement?: any;
        requestPointerLock?: any;
        exitPointerLock?: any;
    }
    interface HTMLElement {
        requestPointerLock?: any;
        mozRequestPointerLock?: any;
        exitPointerLock?: any;
    }
}

export class SingleRender {
    public renderer: THREE.WebGLRenderer;
    private _stop: any;
    private _stats: any;
    private selectedObject: any;
    private increaseFOV: boolean;
    private decreaseFOV: boolean;
    private windowIsBeingResized: boolean;
    private worldCamera: THREE.PerspectiveCamera;
    private quadCamera: THREE.OrthographicCamera;
    private fovScale: number;
    private mouseControl: boolean;
    private isPaused: boolean;
    private clock: THREE.Clock;
    public controls: FirstPersonCameraControls;
    public pathTracingUniforms: any;
    public pathTracingRenderTarget: any;
    public screenTextureRenderTarget: any;
    public pathTracingScene: THREE.Scene;
    public screenTextureScene: THREE.Scene;
    public screenOutputScene: THREE.Scene;
    private cameraControlsObject: THREE.Object3D;
    private cameraControlsYawObject: THREE.Object3D;
    private cameraControlsPitchObject: THREE.Object3D;
    private meshList: THREE.Mesh[];
    private pathTracingMaterialList: MaterialObject[];
    private triangleMaterialMarkers: number[];
    private modelMesh: THREE.Mesh;
    private uniqueMaterialTextures: THREE.Texture[];
    public triangleDataTexture: THREE.DataTexture;
    public aabbDataTexture: THREE.DataTexture;
    public pathTracingGeometry: THREE.PlaneBufferGeometry;
    private cameraIsMoving: boolean;
    private cameraJustStartedMoving: boolean;
    private keyboard: any;
    private sampleCounter: number;
    private frameCounter: number;
    private screenOutputMaterial: any;
    private objLoader: THREE.OBJLoader;
    private rmChildren: any[];
    private doPointerlockChangef: any;
    private doPointerLockf: any;
    private doPreventEventf: any;
    private doMouseMovef: any;
    private doWindowResizef: any;

    constructor(selected: any) {
        this.selectedObject = selected && selected.clone();
        objUrl = selected.modelUrl ? selected.modelUrl : objUrl;
        const mtlLoader = new THREE.TextureLoader();
        const imgUrl: string = objUrl.replace("model-norm.obj", "model.png");
        this.objLoader = new THREE.OBJLoader();
        this.rmChildren = [];
        this.initParams();
        mtlLoader.load(imgUrl, (texture: THREE.Texture) => {
            this.objLoader.load(objUrl, (object3D: any) => {
                this.selectedObject = object3D.clone();
                this.dealSelectedMesh(texture);
                this.initMouseEvent();
                this.initScene();
                this.animate();
                ReturnButtonShow.create({ clear: this.clear.bind(this) });
            });
        });

        const self = this;
        self.doPointerlockChangef = function (): void {
            if (!self._stop) {
                return;
            }
            if (window.document.pointerLockElement === document.body ||
                document.mozPointerLockElement === document.body ||
                document.webkitPointerLockElement === document.body) {
                self.isPaused = false;
                self.controls && self.controls.setPausedState(self.isPaused);
            } else {
                self.isPaused = true;
                self.controls && self.controls.setPausedState(self.isPaused);
            }
        };
        self.doPointerLockf = function (): void {
            if (!self._stop) {
                return;
            }
            document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            document.body.requestPointerLock();
        };
        self.doPreventEventf = function (event: any): void {
            if (!self._stop) {
                return;
            }
            event.preventDefault();
        };
        self.doMouseMovef = function (event: any): void {
            if (!event) {
                return;
            }
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.deltaY > 0) {
                self.increaseFOV = true;
            } else if (event.deltaY < 0) {
                self.decreaseFOV = true;
            }
        };
        self.doWindowResizef = function (event?: any): void {
            self.windowIsBeingResized = true;
            const SCREEN_WIDTH = window.innerWidth;
            const SCREEN_HEIGHT = window.innerHeight;

            self.renderer.setPixelRatio(pixelRatio);
            self.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

            let fontAspect = (SCREEN_WIDTH / 175) * (SCREEN_HEIGHT / 200);
            if (fontAspect > 25) fontAspect = 25;
            if (fontAspect < 4) fontAspect = 4;
            fontAspect *= 2;

            self.pathTracingUniforms.uResolution.value.x = self.renderer.context.drawingBufferWidth;
            self.pathTracingUniforms.uResolution.value.y = self.renderer.context.drawingBufferHeight;

            self.pathTracingRenderTarget.setSize(self.renderer.context.drawingBufferWidth, self.renderer.context.drawingBufferHeight);
            self.screenTextureRenderTarget.setSize(self.renderer.context.drawingBufferWidth, self.renderer.context.drawingBufferHeight);

            self.worldCamera.aspect = self.renderer.domElement.clientWidth / self.renderer.domElement.clientHeight;
            self.worldCamera.updateProjectionMatrix();

            self.fovScale = self.worldCamera.fov * 0.5 * (Math.PI / 180.0);
            self.pathTracingUniforms.uVLen.value = Math.tan(self.fovScale);
            self.pathTracingUniforms.uULen.value = self.pathTracingUniforms.uVLen.value * self.worldCamera.aspect;
        }
    }

    private dealSelectedMesh(texture?: THREE.Texture): void {
        if (!this.selectedObject) {
            return;
        }
        let physicalTexture: THREE.Texture = texture;
        physicalTexture.wrapS = THREE.RepeatWrapping;
        physicalTexture.wrapT = THREE.RepeatWrapping;
        const physicalMaterial: THREE.MeshPhysicalMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xffffff),
            roughness: 0.0,
            metalness: 0.0,
            opacity: 1.0
        });
        physicalMaterial.map = physicalTexture;
        if (this.selectedObject instanceof THREE.Mesh) {
            this.selectedObject.material = physicalMaterial;
            let maObject: MaterialObject = new MaterialObject();
            this.rmChildren.push(this.selectedObject);
            maObject.albedoTextureID = -1;
            maObject.color = physicalMaterial.color;
            maObject.roughness = physicalMaterial.roughness;
            maObject.metalness = physicalMaterial.metalness;
            maObject.opacity = physicalMaterial.opacity;
            maObject.refractiveIndex = 1.0;
            this.pathTracingMaterialList.push(maObject);
            this.meshList.push(this.selectedObject);
            const bufferGeometry = <THREE.BufferGeometry>this.selectedObject.geometry;
            const posArray = bufferGeometry.getAttribute('position').array;
            this.triangleMaterialMarkers.push(posArray.length / 9);
        } else {
            this.selectedObject.traverse((child: any) => {
                if (child instanceof THREE.Mesh) {
                    child.material = physicalMaterial;
                    if (child.name === 'shadow') {
                        return;
                    }
                    let maObject: MaterialObject = new MaterialObject();
                    this.rmChildren.push(child);
                    maObject.color = physicalMaterial.color;
                    maObject.roughness = physicalMaterial.roughness;
                    maObject.metalness = physicalMaterial.metalness;
                    maObject.opacity = physicalMaterial.opacity;
                    maObject.refractiveIndex = 1.0;
                    this.pathTracingMaterialList.push(maObject);
                    this.meshList.push(child);
                    const bufferGeometry = <THREE.BufferGeometry>child.geometry;
                    const posArray = bufferGeometry.getAttribute('position').array;
                    this.triangleMaterialMarkers.push(posArray.length / 9);
                }
            });
        }

        this.modelMesh = this.meshList[0].clone();
        for (let i = 1, len = this.triangleMaterialMarkers.length; i < len; i++) {
            this.triangleMaterialMarkers[i] += this.triangleMaterialMarkers[i - 1];
        }
        const geoList: any[] = [];
        for (let i = 0, len = this.meshList.length; i < len; i++) {
            geoList.push(this.meshList[i].geometry);
        }
        this.modelMesh.geometry = geoUtil.mergeBufferGeometries(geoList, false);
        if (this.modelMesh.geometry.index)
            this.modelMesh.geometry = this.modelMesh.geometry.toNonIndexed();

        this.rmChildren.push(this.modelMesh);
        for (let i = 0, len = this.meshList.length; i < len; i++) {
            const tmpMtl = <THREE.MeshPhysicalMaterial>this.meshList[i].material;
            if (tmpMtl.map != undefined)
                this.uniqueMaterialTextures.push(tmpMtl.map);
        }
        for (let i = 0; i < this.uniqueMaterialTextures.length; i++) {
            for (let j = i + 1; j < this.uniqueMaterialTextures.length; j++) {
                if (this.uniqueMaterialTextures[i].image.src == this.uniqueMaterialTextures[j].image.src) {
                    this.uniqueMaterialTextures.splice(j, 1);
                    j -= 1;
                }
            }
        }
        let len1: number = this.meshList.length;
        let len2: number = this.uniqueMaterialTextures.length;
        for (let i = 0; i < len1; i++) {
            const tmpMtl = <THREE.MeshPhysicalMaterial>this.meshList[i].material;
            if (tmpMtl.map != undefined) {
                for (let j = 0; j < len2; j++) {
                    if (tmpMtl.map.image.src == this.uniqueMaterialTextures[j].image.src) {
                        this.pathTracingMaterialList[i].albedoTextureID = j;
                    }
                }
            }
        }
    }

    private initParams(): void {
        this.increaseFOV = false;
        this.decreaseFOV = false;
        this.windowIsBeingResized = false;
        this.pathTracingUniforms = null;
        this.pathTracingRenderTarget = null;
        this.screenTextureRenderTarget = null;
        this.fovScale = 1;
        this.mouseControl = true;
        this.isPaused = true;
        this.clock = new THREE.Clock();
        this.pathTracingScene = new THREE.Scene();
        this.screenTextureScene = new THREE.Scene();
        this.screenOutputScene = new THREE.Scene();
        this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.worldCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.rmChildren.push(this.quadCamera);
        this.rmChildren.push(this.worldCamera);
        this._stats = fpsDomRender();
        this.cameraControlsObject = new THREE.Object3D();
        this.cameraControlsYawObject = new THREE.Object3D();
        this.cameraControlsPitchObject = new THREE.Object3D();

        this.pathTracingRenderTarget = new THREE.WebGLRenderTarget((window.innerWidth * pixelRatio), (window.innerHeight * pixelRatio), {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            depthBuffer: false,
            stencilBuffer: false
        });
        this.pathTracingRenderTarget.texture.generateMipmaps = false;

        this.screenTextureRenderTarget = new THREE.WebGLRenderTarget((window.innerWidth * pixelRatio), (window.innerHeight * pixelRatio), {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            depthBuffer: false,
            stencilBuffer: false
        });
        this.screenTextureRenderTarget.texture.generateMipmaps = false;

        this.meshList = [];
        this.pathTracingMaterialList = [];
        this.triangleMaterialMarkers = [];
        this.modelMesh = null;
        this.uniqueMaterialTextures = [];

        this.pathTracingGeometry = new THREE.PlaneBufferGeometry(2, 2);
        this.cameraIsMoving = false;
        this.cameraJustStartedMoving = false;
        this.keyboard = new THREEx.KeyboardState();
        this.sampleCounter = 1;
        this.frameCounter = 1;
    }

    private initMouseEvent(): void {
        window.addEventListener('resize', this.doWindowResizef, false);
        if ('ontouchstart' in window) {
            this.mouseControl = false;
        }
        if (!this.mouseControl) {
            this.isPaused = false;
            this.controls.setPausedState(this.isPaused);
        }
        if (this.mouseControl) {
            window.addEventListener('wheel', this.doWindowResizef, false);
            document.body.addEventListener("click", this.doPointerLockf, false);
            window.addEventListener("click", this.doPreventEventf, false);
            window.addEventListener("dblclick", this.doPreventEventf, false);
            document.addEventListener('pointerlockchange', this.doPointerlockChangef, false);
            document.addEventListener('mozpointerlockchange', this.doPointerlockChangef, false);
            document.addEventListener('webkitpointerlockchange', this.doPointerlockChangef, false);
        }
    }

    private initBVH(): void {
        if (!this.modelMesh) {
            return;
        }
        this.worldCamera.fov = 60;
        this.cameraControlsObject.position.set(0, 50, 30);
        this.cameraControlsPitchObject.rotation.x = -0.2;
        const bufferGeometry = <THREE.BufferGeometry>this.modelMesh.geometry;
        const posArray = bufferGeometry.getAttribute('position').array;
        const normalArray = bufferGeometry.getAttribute('normal').array;
        const uvArray = bufferGeometry.getAttribute('uv').array;
        const total_number_of_triangles: number = posArray.length / 9;
        const totalWork: Uint32Array = new Uint32Array(total_number_of_triangles);
        const triangle_array: Float32Array = new Float32Array(2048 * 2048 * 4);
        const aabb_array: Float32Array = new Float32Array(2048 * 2048 * 4);
        const triangle_b_box_min: THREE.Vector3 = new THREE.Vector3();
        const triangle_b_box_max: THREE.Vector3 = new THREE.Vector3();
        const triangle_b_box_centroid: THREE.Vector3 = new THREE.Vector3();
        const vpa = new Float32Array(posArray);
        const vna = new Float32Array(normalArray);
        const vta = new Float32Array(uvArray);
        let modelHasUVs: boolean = true;
        let materialNumber: number = 0;

        const vp0 = new THREE.Vector3();
        const vp1 = new THREE.Vector3();
        const vp2 = new THREE.Vector3();
        const vn0 = new THREE.Vector3();
        const vn1 = new THREE.Vector3();
        const vn2 = new THREE.Vector3();
        const vt0 = new THREE.Vector2();
        const vt1 = new THREE.Vector2();
        const vt2 = new THREE.Vector2();

        for (let i = 0; i < total_number_of_triangles; i++) {
            triangle_b_box_min.set(Infinity, Infinity, Infinity);
            triangle_b_box_max.set(-Infinity, -Infinity, -Infinity);
            for (let j = 0, len1 = this.pathTracingMaterialList.length; j < len1; j++) {
                if (i < this.triangleMaterialMarkers[j]) {
                    materialNumber = j;
                    break;
                }
            }
            vt0.set(vta[6 * i + 0], vta[6 * i + 1]);
            vt1.set(vta[6 * i + 2], vta[6 * i + 3]);
            vt2.set(vta[6 * i + 4], vta[6 * i + 5]);

            // record vertex normals
            vn0.set(vna[9 * i + 0], vna[9 * i + 1], vna[9 * i + 2]).normalize();
            vn1.set(vna[9 * i + 3], vna[9 * i + 4], vna[9 * i + 5]).normalize();
            vn2.set(vna[9 * i + 6], vna[9 * i + 7], vna[9 * i + 8]).normalize();

            // record vertex positions
            vp0.set(vpa[9 * i + 0], vpa[9 * i + 1], vpa[9 * i + 2]);
            vp1.set(vpa[9 * i + 3], vpa[9 * i + 4], vpa[9 * i + 5]);
            vp2.set(vpa[9 * i + 6], vpa[9 * i + 7], vpa[9 * i + 8]);

            vp0.multiplyScalar(modelScale);
            vp1.multiplyScalar(modelScale);
            vp2.multiplyScalar(modelScale);

            vp0.add(modelPositionOffset);
            vp1.add(modelPositionOffset);
            vp2.add(modelPositionOffset);

            //slot 0
            triangle_array[32 * i + 0] = vp0.x; // r or x
            triangle_array[32 * i + 1] = vp0.y; // g or y 
            triangle_array[32 * i + 2] = vp0.z; // b or z
            triangle_array[32 * i + 3] = vp1.x; // a or w

            //slot 1
            triangle_array[32 * i + 4] = vp1.y; // r or x
            triangle_array[32 * i + 5] = vp1.z; // g or y
            triangle_array[32 * i + 6] = vp2.x; // b or z
            triangle_array[32 * i + 7] = vp2.y; // a or w

            //slot 2
            triangle_array[32 * i + 8] = vp2.z; // r or x
            triangle_array[32 * i + 9] = vn0.x; // g or y
            triangle_array[32 * i + 10] = vn0.y; // b or z
            triangle_array[32 * i + 11] = vn0.z; // a or w

            //slot 3
            triangle_array[32 * i + 12] = vn1.x; // r or x
            triangle_array[32 * i + 13] = vn1.y; // g or y
            triangle_array[32 * i + 14] = vn1.z; // b or z
            triangle_array[32 * i + 15] = vn2.x; // a or w

            //slot 4
            triangle_array[32 * i + 16] = vn2.y; // r or x
            triangle_array[32 * i + 17] = vn2.z; // g or y
            triangle_array[32 * i + 18] = vt0.x; // b or z
            triangle_array[32 * i + 19] = vt0.y; // a or w

            //slot 5
            triangle_array[32 * i + 20] = vt1.x; // r or x
            triangle_array[32 * i + 21] = vt1.y; // g or y
            triangle_array[32 * i + 22] = vt2.x; // b or z
            triangle_array[32 * i + 23] = vt2.y; // a or w

            //slot 6
            triangle_array[32 * i + 24] = this.pathTracingMaterialList[materialNumber].type; // r or x 
            triangle_array[32 * i + 25] = this.pathTracingMaterialList[materialNumber].color.r; // g or y
            triangle_array[32 * i + 26] = this.pathTracingMaterialList[materialNumber].color.g; // b or z
            triangle_array[32 * i + 27] = this.pathTracingMaterialList[materialNumber].color.b; // a or w

            //slot 7
            triangle_array[32 * i + 28] = this.pathTracingMaterialList[materialNumber].albedoTextureID; // r or x
            triangle_array[32 * i + 29] = 0; // g or y
            triangle_array[32 * i + 30] = 0; // b or z
            triangle_array[32 * i + 31] = 0; // a or w

            triangle_b_box_min.copy(triangle_b_box_min.min(vp0));
            triangle_b_box_max.copy(triangle_b_box_max.max(vp0));
            triangle_b_box_min.copy(triangle_b_box_min.min(vp1));
            triangle_b_box_max.copy(triangle_b_box_max.max(vp1));
            triangle_b_box_min.copy(triangle_b_box_min.min(vp2));
            triangle_b_box_max.copy(triangle_b_box_max.max(vp2));

            triangle_b_box_centroid.set((triangle_b_box_min.x + triangle_b_box_max.x) * 0.5,
                (triangle_b_box_min.y + triangle_b_box_max.y) * 0.5,
                (triangle_b_box_min.z + triangle_b_box_max.z) * 0.5);

            aabb_array[9 * i + 0] = triangle_b_box_min.x;
            aabb_array[9 * i + 1] = triangle_b_box_min.y;
            aabb_array[9 * i + 2] = triangle_b_box_min.z;
            aabb_array[9 * i + 3] = triangle_b_box_max.x;
            aabb_array[9 * i + 4] = triangle_b_box_max.y;
            aabb_array[9 * i + 5] = triangle_b_box_max.z;
            aabb_array[9 * i + 6] = triangle_b_box_centroid.x;
            aabb_array[9 * i + 7] = triangle_b_box_centroid.y;
            aabb_array[9 * i + 8] = triangle_b_box_centroid.z;
            totalWork[i] = i;
        }

        const buildnodes: any[] = BVH_Build_Iterative(totalWork, aabb_array);

        for (let n = 0, len = buildnodes.length; n < len; n++) {
            aabb_array[8 * n + 0] = buildnodes[n].idLeftChild;
            aabb_array[8 * n + 1] = buildnodes[n].minCorner.x;
            aabb_array[8 * n + 2] = buildnodes[n].minCorner.y;
            aabb_array[8 * n + 3] = buildnodes[n].minCorner.z;
            aabb_array[8 * n + 4] = buildnodes[n].idRightChild;
            aabb_array[8 * n + 5] = buildnodes[n].maxCorner.x;
            aabb_array[8 * n + 6] = buildnodes[n].maxCorner.y;
            aabb_array[8 * n + 7] = buildnodes[n].maxCorner.z;
        }

        this.triangleDataTexture = new THREE.DataTexture(triangle_array,
            2048,
            2048,
            THREE.RGBAFormat,
            THREE.FloatType,
            THREE.Texture.DEFAULT_MAPPING,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter,
            1,
            THREE.LinearEncoding);
        this.triangleDataTexture.flipY = false;
        this.triangleDataTexture.generateMipmaps = false;
        this.triangleDataTexture.needsUpdate = true;

        this.aabbDataTexture = new THREE.DataTexture(aabb_array,
            2048,
            2048,
            THREE.RGBAFormat,
            THREE.FloatType,
            THREE.Texture.DEFAULT_MAPPING,
            THREE.ClampToEdgeWrapping,
            THREE.ClampToEdgeWrapping,
            THREE.NearestFilter,
            THREE.NearestFilter,
            1,
            THREE.LinearEncoding);
        this.aabbDataTexture.flipY = false;
        this.aabbDataTexture.generateMipmaps = false;
        this.aabbDataTexture.needsUpdate = true;
    }

    private createPathTracingMaterial(pathTracingVertexShader: any) {
        const pathTracingFragmentShader: string = spotLightRTXFragment;
        const pathTracingMaterial = new THREE.ShaderMaterial({
            uniforms: this.pathTracingUniforms,
            defines: {},
            vertexShader: pathTracingVertexShader,
            fragmentShader: pathTracingFragmentShader,
            depthTest: false,
            depthWrite: false
        });
        const pathTracingMesh = new THREE.Mesh(this.pathTracingGeometry, pathTracingMaterial);
        this.rmChildren.push(pathTracingMesh);
        this.pathTracingScene.add(pathTracingMesh);
        this.worldCamera.add(pathTracingMesh);
    }

    private initPathTracingShaders(): void {
        this.pathTracingUniforms = {
            tPreviousTexture: { type: "t", value: this.screenTextureRenderTarget.texture },
            tTriangleTexture: { type: "t", value: this.triangleDataTexture },
            tAABBTexture: { type: "t", value: this.aabbDataTexture },
            tAlbedoTextures: { type: "t", value: this.uniqueMaterialTextures },
            uCameraIsMoving: { type: "b1", value: false },
            uCameraJustStartedMoving: { type: "b1", value: false },
            uTime: { type: "f", value: 0.0 },
            uSampleCounter: { type: "f", value: 1.0 },
            uFrameCounter: { type: "f", value: 1.0 },
            uULen: { type: "f", value: 1.0 },
            uVLen: { type: "f", value: 1.0 },
            uApertureSize: { type: "f", value: 0.0 },
            uFocusDistance: { type: "f", value: 100.0 },
            uResolution: { type: "v2", value: new THREE.Vector2() },
            uRandomVector: { type: "v3", value: new THREE.Vector3() },
            uCameraMatrix: { type: "m4", value: new THREE.Matrix4() }
        };
        const pathTracingVertexShader: string = commonRTXVertex;
        this.createPathTracingMaterial(pathTracingVertexShader);
    }

    private initScene(): void {
        const canvas = document.createElement('canvas');
        canvas.setAttribute("id", "single-canvas");
        const context: WebGLRenderingContext = <WebGLRenderingContext>canvas.getContext('webgl2');
        this.renderer = new THREE.WebGLRenderer({ canvas, context });
        this.renderer.autoClear = false;
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.context.getExtension('EXT_color_buffer_float');
        document.body.appendChild(this.renderer.domElement);
        this.screenTextureScene.add(this.quadCamera);
        this.screenOutputScene.add(this.quadCamera);
        this.pathTracingScene.add(this.worldCamera);
        this.controls = new FirstPersonCameraControls(this.worldCamera);
        this.cameraControlsObject = this.controls.getObject();
        this.cameraControlsYawObject = this.controls.getYawObject();
        this.cameraControlsPitchObject = this.controls.getPitchObject();
        this.pathTracingScene.add(this.cameraControlsObject);
        this.initBVH();
        this.initPathTracingShaders();
        const screenTextureGeometry = new THREE.PlaneBufferGeometry(2, 2);
        const screenTextureMaterial = new THREE.ShaderMaterial({
            uniforms: screenTextureShader.uniforms,
            vertexShader: screenTextureShader.vertexShader,
            fragmentShader: screenTextureShader.fragmentShader,
            depthWrite: false,
            depthTest: false
        });
        screenTextureMaterial.uniforms.tPathTracedImageTexture.value = this.pathTracingRenderTarget.texture;
        const screenTextureMesh = new THREE.Mesh(screenTextureGeometry, screenTextureMaterial);
        this.rmChildren.push(screenTextureMesh);
        this.screenTextureScene.add(screenTextureMesh);

        const screenOutputGeometry = new THREE.PlaneBufferGeometry(2, 2);
        this.screenOutputMaterial = new THREE.ShaderMaterial({
            uniforms: screenOutputShader.uniforms,
            vertexShader: screenOutputShader.vertexShader,
            fragmentShader: screenOutputShader.fragmentShader,
            depthWrite: false,
            depthTest: false
        });
        this.screenOutputMaterial.uniforms.tPathTracedImageTexture.value = this.pathTracingRenderTarget.texture;
        const screenOutputMesh = new THREE.Mesh(screenOutputGeometry, this.screenOutputMaterial);
        this.rmChildren.push(screenOutputMesh);
        this.screenOutputScene.add(screenOutputMesh);
        this.doWindowResizef();
    }

    private updateVariablesAndUniforms(): void {
        if (this.cameraIsMoving) {
            this.sampleCounter = 1.0;
            this.frameCounter += 1.0;
            if (!cameraRecentlyMoving) {
                this.cameraJustStartedMoving = true;
                cameraRecentlyMoving = true;
            }
        }

        if (!this.cameraIsMoving) {
            this.sampleCounter += 1.0; // for progressive refinement of image
            if (sceneIsDynamic)
                this.sampleCounter = 1.0; // reset for continuous updating of image

            this.frameCounter += 1.0;
            if (cameraRecentlyMoving)
                this.frameCounter = 1.0;

            cameraRecentlyMoving = false;
        }

        const randomVector = new THREE.Vector3();
        this.pathTracingUniforms.uCameraIsMoving.value = this.cameraIsMoving;
        this.pathTracingUniforms.uCameraJustStartedMoving.value = this.cameraJustStartedMoving;
        this.pathTracingUniforms.uSampleCounter.value = this.sampleCounter;
        this.pathTracingUniforms.uFrameCounter.value = this.frameCounter;
        this.pathTracingUniforms.uRandomVector.value = randomVector.set(Math.random(), Math.random(), Math.random());

        // CAMERA
        this.cameraControlsObject.updateMatrixWorld(true);
        this.pathTracingUniforms.uCameraMatrix.value.copy(this.worldCamera.matrixWorld);
        this.screenOutputMaterial.uniforms.uOneOverSampleCounter.value = 1.0 / this.sampleCounter;
    }

    public animate(): void {
        this._stop = requestAnimationFrame(this.animate.bind(this));
        frameTime = this.clock && this.clock.getDelta();
        this.cameraIsMoving = false;
        this.cameraJustStartedMoving = false;
        if (this.windowIsBeingResized) {
            this.cameraIsMoving = true;
            this.windowIsBeingResized = false;
        }
        if (this.mouseControl) {
            if (oldYawRotation != this.cameraControlsYawObject.rotation.y ||
                oldPitchRotation != this.cameraControlsPitchObject.rotation.x) {
                this.cameraIsMoving = true;
            }
            oldYawRotation = this.cameraControlsYawObject.rotation.y;
            oldPitchRotation = this.cameraControlsPitchObject.rotation.x;
        }

        const cameraDirectionVector = new THREE.Vector3();
        const cameraUpVector = new THREE.Vector3();
        const cameraRightVector = new THREE.Vector3();
        const cameraWorldQuaternion = new THREE.Quaternion();
        this.controls.getDirection(cameraDirectionVector);
        cameraDirectionVector.normalize();
        this.controls.getUpVector(cameraUpVector);
        this.controls.getRightVector(cameraRightVector);
        this.worldCamera.getWorldQuaternion(cameraWorldQuaternion);

        if (this.keyboard.pressed('W') && !this.keyboard.pressed('S')) {
            this.cameraControlsObject.position.add(cameraDirectionVector.multiplyScalar(camFlightSpeed * frameTime));
            this.cameraIsMoving = true;
        }
        if (this.keyboard.pressed('S') && !this.keyboard.pressed('W')) {
            this.cameraControlsObject.position.sub(cameraDirectionVector.multiplyScalar(camFlightSpeed * frameTime));
            this.cameraIsMoving = true;
        }
        if (this.keyboard.pressed('A') && !this.keyboard.pressed('D')) {
            this.cameraControlsObject.position.sub(cameraRightVector.multiplyScalar(camFlightSpeed * frameTime));
            this.cameraIsMoving = true;
        }
        if (this.keyboard.pressed('D') && !this.keyboard.pressed('A')) {
            this.cameraControlsObject.position.add(cameraRightVector.multiplyScalar(camFlightSpeed * frameTime));
            this.cameraIsMoving = true;
        }
        if (this.keyboard.pressed('Q') && !this.keyboard.pressed('Z')) {
            this.cameraControlsObject.position.add(cameraUpVector.multiplyScalar(camFlightSpeed * frameTime));
            this.cameraIsMoving = true;
        }
        if (this.keyboard.pressed('Z') && !this.keyboard.pressed('Q')) {
            this.cameraControlsObject.position.sub(cameraUpVector.multiplyScalar(camFlightSpeed * frameTime));
            this.cameraIsMoving = true;
        }
        if (this.keyboard.pressed('up') && !this.keyboard.pressed('down')) {
            increaseFocusDist = true;
        }
        if (this.keyboard.pressed('down') && !this.keyboard.pressed('up')) {
            decreaseFocusDist = true;
        }
        if (this.keyboard.pressed('right') && !this.keyboard.pressed('left')) {
            increaseAperture = true;
        }
        if (this.keyboard.pressed('left') && !this.keyboard.pressed('right')) {
            decreaseAperture = true;
        }

        if (this.increaseFOV) {
            this.worldCamera.fov++;
            if (this.worldCamera.fov > 150)
                this.worldCamera.fov = 150;
            let fovScale = this.worldCamera.fov * 0.5 * (Math.PI / 180.0);
            this.pathTracingUniforms.uVLen.value = Math.tan(fovScale);
            this.pathTracingUniforms.uULen.value = this.pathTracingUniforms.uVLen.value * this.worldCamera.aspect;

            this.cameraIsMoving = true;
            this.increaseFOV = false;
        }
        if (this.decreaseFOV) {
            this.worldCamera.fov--;
            if (this.worldCamera.fov < 1)
                this.worldCamera.fov = 1;
            let fovScale = this.worldCamera.fov * 0.5 * (Math.PI / 180.0);
            this.pathTracingUniforms.uVLen.value = Math.tan(fovScale);
            this.pathTracingUniforms.uULen.value = this.pathTracingUniforms.uVLen.value * this.worldCamera.aspect;

            this.cameraIsMoving = true;
            this.decreaseFOV = false;
        }

        if (increaseFocusDist) {
            focusDistance += 1;
            this.pathTracingUniforms.uFocusDistance.value = focusDistance;
            this.cameraIsMoving = true;
            increaseFocusDist = false;
        }
        if (decreaseFocusDist) {
            focusDistance -= 1;
            if (focusDistance < 1)
                focusDistance = 1;
            this.pathTracingUniforms.uFocusDistance.value = focusDistance;
            this.cameraIsMoving = true;
            decreaseFocusDist = false;
        }

        if (increaseAperture) {
            apertureSize += 0.1;
            if (apertureSize > 20.0)
                apertureSize = 20.0;
            this.pathTracingUniforms.uApertureSize.value = apertureSize;
            this.cameraIsMoving = true;
            increaseAperture = false;
        }
        if (decreaseAperture) {
            apertureSize -= 0.1;
            if (apertureSize < 0.0)
                apertureSize = 0.0;
            this.pathTracingUniforms.uApertureSize.value = apertureSize;
            this.cameraIsMoving = true;
            decreaseAperture = false;
        }

        // update scene/demo-specific variables and uniforms every animation frame
        this.updateVariablesAndUniforms();

        // RENDERING in 3 steps
        // STEP 1
        // Perform PathTracing and Render(save) into pathTracingRenderTarget, a full-screen texture.
        // Read previous screenTextureRenderTarget(via texelFetch inside fragment shader) to use as a new starting point to blend with
        this.renderer.setRenderTarget(this.pathTracingRenderTarget);
        this.renderer.render(this.pathTracingScene, this.worldCamera);

        // STEP 2
        // Render(copy) the pathTracingScene output(pathTracingRenderTarget above) into screenTextureRenderTarget.
        // This will be used as a new starting point for Step 1 above (essentially creating ping-pong buffers)
        this.renderer.setRenderTarget(this.screenTextureRenderTarget);
        this.renderer.render(this.screenTextureScene, this.quadCamera);

        // STEP 3
        // Render full screen quad with generated pathTracingRenderTarget in STEP 1 above.
        // After the image is gamma-corrected, it will be shown on the screen as the final accumulated output
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.screenOutputScene, this.quadCamera);

        this._stats.update();
    }

    public clear(): void {
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
        window.cancelAnimationFrame(this._stop);
        this._stop && delete this._stop;
        document.removeEventListener('pointerlockchange', this.doPointerlockChangef, false);
        document.removeEventListener('mozpointerlockchange', this.doPointerlockChangef, false);
        document.removeEventListener('webkitpointerlockchange', this.doPointerlockChangef, false);
        this.doPointerlockChangef = undefined;
        window.removeEventListener('resize', this.doWindowResizef, false);
        this.doWindowResizef = undefined;
        window.removeEventListener('wheel', this.doMouseMovef, false);
        this.doMouseMovef = undefined;
        document.body.removeEventListener("click", this.doPointerLockf, false);
        window.removeEventListener("click", this.doPreventEventf, false);
        window.removeEventListener("dblclick", this.doPreventEventf, false);
        this.doPointerLockf = undefined;
        this.increaseFOV = false;
        this.decreaseFOV = false;
        this.windowIsBeingResized = false;
        this.pathTracingUniforms = null;
        if (this.pathTracingRenderTarget) {
            if (this.pathTracingRenderTarget.texture && this.pathTracingRenderTarget.texture.dispose) {
                this.pathTracingRenderTarget.texture.dispose();
                this.pathTracingRenderTarget.texture = undefined;
            }
            this.pathTracingRenderTarget = undefined;
        }
        if (this.screenTextureRenderTarget) {
            if (this.screenTextureRenderTarget.texture && this.screenTextureRenderTarget.texture.dispose) {
                this.screenTextureRenderTarget.texture.dispose();
                this.screenTextureRenderTarget.texture = undefined;
            }
            this.screenTextureRenderTarget = undefined;
        }
        this.clock = undefined;
        for (let i = 0, len = this.rmChildren.length; i < len; i++) {
            this.pathTracingScene.remove(this.rmChildren[i]);
            this.screenTextureScene.remove(this.rmChildren[i]);
            this.screenOutputScene.remove(this.rmChildren[i]);
            if (this.rmChildren[i]) {
                if (this.rmChildren[i].dispose) {
                    this.rmChildren[i].dispose();
                }
                if (this.rmChildren[i].geometry) {
                    this.rmChildren[i].geometry.dispose && this.rmChildren[i].geometry.dispose();
                    this.rmChildren[i].geometry = undefined;
                }
                if (this.rmChildren[i].material) {
                    this.rmChildren[i].material.dispose && this.rmChildren[i].material.dispose();
                    if (this.rmChildren[i].material.map) {
                        this.rmChildren[i].material.map.dispose && this.rmChildren[i].material.map.dispose();
                        this.rmChildren[i].material.map = undefined;
                    }
                    this.rmChildren[i].material = undefined;
                }
                this.rmChildren[i] = undefined;
            }
        }
        this.pathTracingScene = undefined;
        this.screenTextureScene = undefined;
        this.screenOutputScene = undefined;
        this.rmChildren = undefined;
        this.quadCamera = undefined;
        this.worldCamera = undefined;
        this.cameraControlsObject = undefined;
        this.cameraControlsYawObject = undefined;
        this.cameraControlsPitchObject = undefined;
        this.renderer.domElement && document.body.removeChild(this.renderer.domElement);
        this.renderer && this.renderer.dispose();
        delete this.renderer;
        this.controls.clear();
        this.controls = undefined;
        if (this.modelMesh) {
            if (this.modelMesh.geometry) {
                this.modelMesh.geometry.dispose && this.modelMesh.geometry.dispose();
                this.modelMesh.geometry = undefined;
            }
            if (this.modelMesh.material) {
                this.modelMesh.material = undefined;
            }
            this.modelMesh = undefined;
        }
        this.meshList = undefined;
        this.triangleMaterialMarkers = undefined;
        if (this.uniqueMaterialTextures) {
            this.uniqueMaterialTextures.forEach((tex) => {
                tex.dispose && tex.dispose();
                tex = undefined;
            });
            delete this.uniqueMaterialTextures;
        }
        if (this.triangleDataTexture) {
            this.triangleDataTexture.dispose && this.triangleDataTexture.dispose();
            delete this.triangleDataTexture;
        }
        if (this.aabbDataTexture) {
            this.aabbDataTexture.dispose && this.aabbDataTexture.dispose();
            delete this.aabbDataTexture;
        }
        if (this.pathTracingGeometry) {
            this.pathTracingGeometry.dispose && this.pathTracingGeometry.dispose();
            delete this.pathTracingGeometry.dispose;
        }
        this.keyboard = undefined;
        this.sampleCounter = 1;
        this.frameCounter = 1;
        this.screenOutputMaterial = undefined;
        delete this._stats;
    }
}