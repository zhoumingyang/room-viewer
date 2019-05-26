import * as THREE from "three";
require('three/examples/js/loaders/LoaderSupport');
require('three/examples/js/loaders/OBJLoader2');
require("three-obj-loader")(THREE);
const OrbitControls = require('three-orbit-controls')(THREE);
import { TextureInfo, TransInfo, ResUrl, JsonDetail, EulerRotateInfo, UrlInfo } from "./interface";
import { Util } from "./util";
import { SeletectedMaterial } from "./material/selectedmaterial";
require("./material/instancephongmaterial");
import { LeftMenuShow } from "./ui/leftmenu/leftmenu";
import { RenderMode } from "./resource";

const baseColor: number = 0xffffff;
const intersectColor: number = 0x4b96ff;
const ossHost: string = "homestyler.com/";

export class ViewerScene {
    public diffuseTextureCache: Map<string, THREE.Texture>;
    public normalTextureCache: Map<string, THREE.Texture>;
    public meshMapShowInfo: Map<any, any>;
    private _stats: any;
    public mtlLoader: THREE.TextureLoader;
    public rmChildren: Array<any>;
    public normalCamera: THREE.PerspectiveCamera;
    public orthographicCamera: THREE.OrthographicCamera;
    public currentCamera: any;
    public _stop: any;
    public raycaster: THREE.Raycaster;
    public _mouse: THREE.Vector2;
    public intersected: THREE.Object3D;
    public currentIntersected: any;
    public normalScene: THREE.Scene;
    public normalRenderer: THREE.WebGLRenderer;
    public normalControls: THREE.OrbitControls;
    public rayCastObjects: Array<any>;
    public ambientLight: THREE.AmbientLight;
    public hemiLight: THREE.HemisphereLight;
    public directionalLight: THREE.DirectionalLight;
    public lights: Array<any>;
    public mtlMeshMap: Map<string, Array<any>>;
    public urlOBJModelMap: Map<string, Array<any>>;
    public currentSceneNode: THREE.Object3D;
    public removeSceneNode: THREE.Object3D;
    public sceneNodes: THREE.Object3D[];
    public currentIndex: number;
    public cacheSceneDatas: any[];
    public rayCastObjectsArray: any[];
    public rayCastMapInstanceId: Map<string, number>;
    public rayCastMapInsMesh: Map<string, any>;
    public cahceAny: any;
    public singleRenderNode: THREE.Object3D;
    public renderMode: RenderMode;
    public handler: any;

    constructor(stats: any) {
        this.diffuseTextureCache = new Map();
        this.normalTextureCache = new Map();
        this.meshMapShowInfo = new Map();
        this.mtlLoader = new THREE.TextureLoader();
        this.rmChildren = [];
        this.normalCamera = undefined;
        this._stop = null;
        this.raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        this.intersected = new THREE.Object3D;
        this.currentIntersected = undefined;
        this.rayCastObjects = [];
        this._stats = stats;
        this.lights = [];
        this.mtlMeshMap = new Map();
        this.urlOBJModelMap = new Map();
        this.currentSceneNode = new THREE.Object3D();
        this.currentIndex = 0;
        this.sceneNodes = [];
        this.removeSceneNode = new THREE.Object3D();
        this.cacheSceneDatas = [];
        this.rayCastObjectsArray = [];
        this.rayCastMapInstanceId = new Map();
        this.rayCastMapInsMesh = new Map();
        this.cahceAny = new Object();
        this.singleRenderNode = new THREE.Object3D();
        this.renderMode = RenderMode.AllRender;
        this._renderInitial();
    }

    public registerHander(handler: any): void {
        this.handler = handler;
    }

    private _renderInitial(): void {
        const localWindow: any = window;
        const doc = document;
        const docBd = doc.body;
        this.normalCamera = this._cameraInitial(200, 1650, 400);
        this.currentCamera = this.normalCamera;
        this.normalScene = new THREE.Scene();
        this.normalScene.add(this.intersected);
        this.normalScene.add(this.singleRenderNode);
        this.normalScene.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);
        this.normalRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        const tmpNormalRenderer = this.normalRenderer
        tmpNormalRenderer.setClearColor(new THREE.Color(0x000000));
        tmpNormalRenderer.setPixelRatio(localWindow.devicePixelRatio);
        tmpNormalRenderer.setSize(localWindow.innerWidth, localWindow.innerHeight);
        const domElement = tmpNormalRenderer.domElement;
        domElement.setAttribute("id", "room-canvas");
        docBd.appendChild(domElement);
        this._lightInitial(this.normalScene);
        this._controlInitial();
    }

    private _cameraInitial(camerx: number, camery: number, camerz: number): THREE.PerspectiveCamera {
        const localWindow: any = window;
        const camera = new THREE.PerspectiveCamera(60.0, localWindow.innerWidth / localWindow.innerHeight, 1, 10000);
        const cameraUp = camera.up;
        const cameraPos = camera.position;
        cameraUp.set(0, 1, 0);
        cameraPos.set(camerx, camery, camerz);
        const aspect: number = localWindow.innerWidth / localWindow.innerHeight;
        const frustumSize: number = 1350;
        const halfFrustumSize = frustumSize / 2;
        this.orthographicCamera = new THREE.OrthographicCamera(-halfFrustumSize * aspect,
            halfFrustumSize * aspect,
            halfFrustumSize,
            -halfFrustumSize,
            1, 10000);
        const orgCameraPos = this.orthographicCamera.position;
        orgCameraPos.set(0, 2400, 0);
        this.orthographicCamera.lookAt(0, 0, 0);
        return camera;
    }

    private _lightInitial(curScene: THREE.Scene): void {
        this.ambientLight = new THREE.AmbientLight(0x666666);
        curScene.add(this.ambientLight);
        this.rmChildren && this.rmChildren.push(this.ambientLight);

        this.hemiLight = new THREE.HemisphereLight(baseColor, baseColor, 0.30);
        const tmpHemiLight = this.hemiLight;
        const hemiLightPos = tmpHemiLight.position;
        hemiLightPos.set(0, 4800, 0);
        curScene.add(tmpHemiLight);
        this.rmChildren && this.rmChildren.push(tmpHemiLight);
        this.lights.push(tmpHemiLight);

        this.directionalLight = new THREE.DirectionalLight(0xdfebff, 0.37);
        const tmpDirLight = this.directionalLight;
        const dirLightPos = tmpDirLight.position;
        dirLightPos.set(-1500, 2500, -1500);
        curScene.add(tmpDirLight);
        this.rmChildren && this.rmChildren.push(tmpDirLight);
        this.lights.push(tmpDirLight);
    }

    private _controlInitial(): void {
        this.normalControls = new OrbitControls(this.currentCamera, this.normalRenderer.domElement);
        const tmpControls = this.normalControls;
        tmpControls.addEventListener('change', this._render.bind(this));
        tmpControls.minDistance = 0;
        tmpControls.maxDistance = 5000;
    }

    private _clearCacheData(): void {
        this.rayCastObjects = undefined;
        Util.cacheDataClear({
            meshMapShowInfo: this.meshMapShowInfo,
            mtlMeshMap: this.mtlMeshMap,
            urlOBJModelMap: this.urlOBJModelMap,
            rayCastMapInstanceId: this.rayCastMapInstanceId,
            rayCastMapInsMesh: this.rayCastMapInsMesh
        });
        this.meshMapShowInfo = new Map();
        this.rayCastObjects = [];
        this.mtlMeshMap = new Map();
        this.urlOBJModelMap = new Map();
        this._clearSelectedMesh();

        if (this.singleRenderNode && this.currentIntersected) {
            this.singleRenderNode.remove(this.currentIntersected);
        }
        this.currentIntersected = null;
        this.cahceAny = new Object();
        this.renderMode = RenderMode.AllRender;

        this.diffuseTextureCache.forEach((tex: THREE.Texture) => {
            tex.dispose && tex.dispose();
            tex = undefined;
        });
        this.diffuseTextureCache.clear();
        delete this.diffuseTextureCache;
        this.normalTextureCache.forEach((ntex: THREE.Texture) => {
            ntex.dispose && ntex.dispose();
            ntex = undefined;
        });
        this.normalTextureCache.clear();
        delete this.normalTextureCache;
        this.diffuseTextureCache = new Map();
        this.normalTextureCache = new Map();
    }

    public drawScene(datas: Array<any>): void {
        const localWindow: any = window;
        if (this.removeSceneNode) {
            this.normalScene.remove(this.removeSceneNode);
        }
        const tmpSceneNode: THREE.Object3D = new THREE.Object3D();
        const tmpRayCastObjects: any[] = [];
        if (datas && datas.length === 1) {
            this._clearCacheData();
            this._createScene(datas[0], tmpSceneNode, tmpRayCastObjects);
        }
        this.sceneNodes.push(tmpSceneNode);
        this.rayCastObjectsArray.push(tmpRayCastObjects);
        this.currentSceneNode = this.sceneNodes[this.currentIndex];
        this.rayCastObjects = this.rayCastObjectsArray[this.currentIndex];
        this.normalScene.add(this.currentSceneNode);
        this.removeSceneNode = this.currentSceneNode;
        localWindow.addEventListener('resize', function () {
            this._onWindowResize()
        }.bind(this), false);
        const tmpNormalRenderer = this.normalRenderer;
        const domElement = tmpNormalRenderer.domElement;
        domElement.addEventListener('click', this._onDocumentNormalMouseClick.bind(this), false);
        this._tick();
    }

    public setCacheSceneData(sceneData: any): void {
        this.cacheSceneDatas.push(sceneData);
    }

    private _tick(): void {
        this._stop = requestAnimationFrame(this._tick.bind(this));
        this._stats.begin();
        this._render();
        this._stats.end();
    }

    private _render(): void {
        this.normalRenderer && this.normalRenderer.render(this.normalScene, this.currentCamera);
    }

    private _onWindowResize(): void {
        const localWindow = window;
        const tempWidth: number = localWindow.innerWidth;
        const tempHeight: number = localWindow.innerHeight;
        const aspect: number = tempWidth / tempHeight;
        const currentCamera = this.currentCamera;
        if (currentCamera instanceof THREE.PerspectiveCamera) {
            currentCamera.aspect = aspect;
        } else if (currentCamera instanceof THREE.OrthographicCamera) {
            const frustumSize: number = 1350;
            this.handler && this.handler.changeFrustum(frustumSize);
        }
        currentCamera.updateProjectionMatrix();
        this.normalRenderer && this.normalRenderer.setSize(tempWidth, tempHeight);
        this._render();
    }

    private _dealComponentObject3d(object3D: THREE.Object3D, transInfos: Map<any, any>,
        materials: Map<any, any>, rayCastObjects: any[], showInfo?: any): THREE.Object3D {
        const newObject3D: THREE.Object3D = new THREE.Object3D();
        object3D.traverse((mesh: any): void => {
            if (mesh instanceof THREE.Mesh) {
                if (mesh.name === 'shadow') {
                    mesh.visible = false;
                } else {
                    if (transInfos.has(mesh.name) && materials.has(mesh.name)) {
                        const transArray = transInfos.get(mesh.name);
                        const mtlArray = materials.get(mesh.name);
                        if (transArray.length !== mtlArray.length) {
                            return;
                        }
                        transArray.forEach((trans: any, index: number) => {
                            const cloneMesh = mesh.clone();
                            let clmMaterial = cloneMesh.material;
                            const clmPos = cloneMesh.position;
                            clmMaterial = mtlArray[index];
                            const posx = trans.pos[0], posy = trans.pos[1], posz = trans.pos[2];
                            const rotx = trans.rot[0], roty = trans.rot[1], rotz = trans.rot[2], rotw = trans.rot[3];
                            const sclx = trans.scale[0], scly = trans.scale[1], sclz = trans.scale[2];
                            clmPos.set(Number(posx * 100), Number(posy * 100), Number(posz * 100));
                            const quaternion: THREE.Quaternion = new THREE.Quaternion(Number(rotx), Number(roty), Number(rotz), Number(rotw));
                            cloneMesh.setRotationFromQuaternion(quaternion);
                            cloneMesh.scale.set(Number(sclx), Number(scly), Number(sclz));
                            this.meshMapShowInfo && this.meshMapShowInfo.set(cloneMesh.uuid, showInfo);
                            const cloneGeo = cloneMesh.geometry;
                            cloneGeo.computeBoundingBox();
                            newObject3D.add(cloneMesh);
                        });
                    }
                }
            }
        });
        rayCastObjects.push(newObject3D);
        return newObject3D;
    }

    private _dealNormalObject3d(object3D: THREE.Object3D, transInfos: Map<any, any>,
        materials: Map<any, any>, rayCastObjects: any[], showInfo?: any): THREE.Object3D {
        if (!object3D) {
            return;
        }
        const s: string = 'default';
        if (!transInfos.has(s)) {
            return;
        }
        const transInfoValues = transInfos.get(s);
        const materialValues = materials.get(s);
        const curTransInfoValue = transInfoValues[0];
        const curMaterialValue = materialValues[0];
        const dpos = curTransInfoValue.pos;
        const drot = curTransInfoValue.rot;
        const dscl = curTransInfoValue.scale;
        let newObject3D: THREE.Object3D = new THREE.Object3D();
        const quaternion: THREE.Quaternion = new THREE.Quaternion(Number(drot[0]), Number(drot[1]), Number(drot[2]), Number(drot[3]));
        let newGeometry = new THREE.BufferGeometry();
        newGeometry = Util.mergerObject3DMeshToBufferGeometry(object3D);
        const tmpMaterial = curMaterialValue;
        tmpMaterial.defines = undefined;
        newGeometry.computeBoundingBox();
        const newMesh = new THREE.Mesh(newGeometry, curMaterialValue);
        newObject3D.add(newMesh);
        this.meshMapShowInfo && this.meshMapShowInfo.set(newMesh.uuid, showInfo);
        newObject3D.position.set(Number(dpos * 100), Number(dpos * 100), Number(dpos * 100));
        newObject3D.setRotationFromQuaternion(quaternion);
        newObject3D.scale.set(Number(dscl), Number(dscl), Number(dscl));
        rayCastObjects.push(newObject3D);
        object3D = undefined;
        return newObject3D;
    }

    private _setObject3D(object3D: THREE.Object3D, transInfos: Map<any, any>,
        materials: Map<any, any>, showInfo: any,
        curScene: THREE.Object3D, rayCastOjbects: any[]): any {
        if (!object3D) {
            return;
        }
        const s: string = 'default';
        let newObject3D: THREE.Object3D = (transInfos.has(s) || materials.has(s))
            ? this._dealNormalObject3d(object3D, transInfos, materials, rayCastOjbects, showInfo)
            : this._dealComponentObject3d(object3D, transInfos, materials, rayCastOjbects, showInfo);
        curScene && curScene.add(newObject3D);
        if (this.rmChildren) {
            this.rmChildren.push(newObject3D);
            this.rmChildren.push(object3D);
        }
        return newObject3D;
    }

    public clearScene(): void {
        this.diffuseTextureCache.forEach((tex: THREE.Texture) => {
            tex.dispose && tex.dispose();
            tex = undefined;
        });
        this.diffuseTextureCache.clear();
        delete this.diffuseTextureCache;
        this.normalTextureCache.forEach((ntex: THREE.Texture) => {
            ntex.dispose && ntex.dispose();
            ntex = undefined;
        });
        this.normalTextureCache.clear();
        delete this.normalTextureCache;

        this.rayCastObjects.forEach((obj: any) => {
            Util.object3DDispose(obj);
        });
        delete this.rayCastObjects;

        this.rayCastObjectsArray.forEach((rayCastObjects: any) => {
            rayCastObjects.forEach((obj: any) => {
                Util.object3DDispose(obj);
            });
            rayCastObjects = undefined;
        });
        this.rayCastObjectsArray = undefined;

        for (let i = 0, len = this.rmChildren.length; i < len; i++) {
            this.normalScene.remove(this.rmChildren[i]);
            this.sceneNodes.forEach((sceneNode: any) => {
                sceneNode.remove(this.rmChildren[i]);
            });
            this.currentSceneNode.remove(this.rmChildren[i]);
            Util.object3DDispose(this.rmChildren[i]);
            this.rmChildren[i] = undefined;
        }
        this.normalScene.remove(this.removeSceneNode);
        this._clearSelectedMesh();
        delete this.rmChildren;
        this.sceneNodes.forEach((tmpNode: any) => {
            tmpNode = undefined;
        });
        delete this.sceneNodes;

        Util.cacheDataClear({
            meshMapShowInfo: this.meshMapShowInfo,
            mtlMeshMap: this.mtlMeshMap,
            urlOBJModelMap: this.urlOBJModelMap,
            cacheSceneDatas: this.cacheSceneDatas,
            rayCastMapInstanceId: this.rayCastMapInstanceId,
            rayCastMapInsMesh: this.rayCastMapInsMesh
        });

        if (this.singleRenderNode && this.currentIntersected) {
            this.singleRenderNode.remove(this.currentIntersected);
            Util.object3DDispose(this.currentIntersected);
            this.singleRenderNode = undefined;
        }
        this.currentIntersected = null;
        this.cahceAny = new Object();
        this.renderMode = RenderMode.AllRender;

        const tmpNormalRenderer = this.normalRenderer;
        const domElement = tmpNormalRenderer.domElement;
        const doc = document;
        const docBd = document.body;
        domElement && docBd.removeChild(domElement);
        domElement && domElement.removeEventListener('click', this._onDocumentNormalMouseClick.bind(this), false);
        tmpNormalRenderer && tmpNormalRenderer.dispose();
        delete this.normalRenderer;
        delete this.normalScene;
        delete this.mtlLoader;
        delete this.meshMapShowInfo;
        delete this.raycaster;
        delete this._mouse;
        this.intersected && delete this.intersected;
        delete this._stats;
        delete this.handler;
        if (this.normalControls) {
            this.normalControls.removeEventListener('change', this._render.bind(this));
            delete this.normalControls;
        }
        const localWindow = window;
        localWindow.cancelAnimationFrame(this._stop);
        this._stop && delete this._stop;
        localWindow.removeEventListener('resize', function () {
            this._onWindowResize();
        }.bind(this), false);
    }

    private _getTextures(materialObj: any, options?: any): TextureInfo {
        let texture, normaltexture;
        if (materialObj && materialObj.texture) {
            if (this.diffuseTextureCache.has(materialObj.texture)) {
                texture = this.diffuseTextureCache.get(materialObj.texture);
            } else {
                texture = this.mtlLoader.load(materialObj.texture, function (texture) { });
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                if (options) {
                    texture.repeat.x = 1 / options.tile_x || 1;
                    texture.repeat.y = 1 / options.tile_y || 1;
                    texture.offset.x = options.offset_x || 0;
                    texture.offset.y = options.offset_y || 0;
                }
                !options && this.diffuseTextureCache.set(materialObj.texture, texture);
            }
        }
        if (materialObj && materialObj.normaltexture) {
            if (this.normalTextureCache && this.normalTextureCache.has(materialObj.normaltexture)) {
                normaltexture = this.normalTextureCache.get(materialObj.normaltexture);
            } else {
                normaltexture = this.mtlLoader.load(materialObj.normalTexture, function (normaltexture) { });
                normaltexture.wrapS = normaltexture.wrapT = THREE.RepeatWrapping;
                this.normalTextureCache && this.normalTextureCache.set(materialObj.normalTexture, normaltexture);
            }
        }
        return { texture, normaltexture };
    }

    public _clearSelectedMesh(): void {
        if (this.currentIntersected && this.currentIntersected.selectedMesh) {
            this.intersected.remove(this.currentIntersected.selectedMesh);
            this.currentIntersected.selectedMesh = undefined;
        }
    }

    public _createSelectedMesh(): void {
        if (!this.currentIntersected) {
            return;
        }
        this._clearSelectedMesh();
        const selectedMaterial: SeletectedMaterial = new SeletectedMaterial({ color: new THREE.Color(intersectColor), opacity: 0.65 });
        const selectedMesh = this.currentIntersected.clone();
        selectedMesh.material = selectedMaterial;
        this.intersected.add(selectedMesh);
        this.currentIntersected.selectedMesh = selectedMesh;
    }

    private _intersectCheck(curCamera: THREE.PerspectiveCamera, pagePosition: THREE.Vector2): void {
        this.raycaster.setFromCamera(this._mouse, curCamera);
        if (this.renderMode === RenderMode.SingleRender) {
            document.body.style.cursor = 'auto';
            const temp = this.raycaster.intersectObjects([this.currentIntersected], true);
            if (temp && temp.length) {
                LeftMenuShow.create(pagePosition, {
                    renderAll: this.handler.renderAll.bind(this.handler),
                    selectedFlipx: this.handler.selectedFlipx.bind(this.handler),
                    selectedFlipz: this.handler.selectedFlipz.bind(this.handler),
                    renderMode: "renderSingle",
                    selected3DObject: this.currentIntersected,
                    stopAnimation: this.handler.stopAnimation.bind(this.handler)
                });
            } else {
                LeftMenuShow.destory();
            }
            return;
        }
        const intersections: THREE.Intersection[] = this.raycaster.intersectObjects(this.rayCastObjects, true);
        if (intersections && intersections.length > 0) {
            if (this.currentIntersected != intersections[0].object) {
                if (this.currentIntersected) { this._clearSelectedMesh(); };
                this.currentIntersected = intersections[0].object;
                this._createSelectedMesh();
                let showInfo: JsonDetail = this.meshMapShowInfo ? this.meshMapShowInfo.get(this.currentIntersected.uuid) : undefined;
                Util.setContentInfoShow(showInfo, '0.6');
            }
            document.body.style.cursor = 'pointer';
            LeftMenuShow.create(pagePosition, {
                selectedSingleRender: this.handler.selectedSingleRender.bind(this.handler),
                selectedFlipx: this.handler.selectedFlipx.bind(this.handler),
                selectedFlipz: this.handler.selectedFlipz.bind(this.handler),
                renderMode: "renderAll",
                selected3DObject: this.currentIntersected,
                stopAnimation: this.handler.stopAnimation.bind(this.handler)
            });
        }
        else if (this.currentIntersected) {
            this._clearSelectedMesh();
            this.currentIntersected = null;
            Util.setContentInfoShow(undefined, '0');
            document.body.style.cursor = 'auto';
            LeftMenuShow.destory();
        }
    }

    private _onDocumentNormalMouseClick(event: any): void {
        event.preventDefault();
        const { width, height } = Util.getWindowSize();
        this._mouse.x = (event.clientX / width) * 2 - 1;
        this._mouse.y = - (event.clientY / height) * 2 + 1;
        this._intersectCheck(this.currentCamera, new THREE.Vector2(event.pageX, event.pageY));
    }

    private _dealComponentObject(object: any, materials: Array<any>, transInfos: Map<string, Array<TransInfo>>,
        modelTranInfo: TransInfo, modelMaterials: Map<string, Array<THREE.MeshPhongMaterial>>): void {
        if (!object || !object.components) {
            return;
        }
        const modelPos: THREE.Vector3 = new THREE.Vector3(modelTranInfo.pos[0], modelTranInfo.pos[1], modelTranInfo.pos[2]);
        const modelQuat: THREE.Quaternion = new THREE.Quaternion(modelTranInfo.rot[0], modelTranInfo.rot[1], modelTranInfo.rot[2], modelTranInfo.rot[3]);
        const modelScale: THREE.Vector3 = new THREE.Vector3(modelTranInfo.scale[0], modelTranInfo.scale[1], modelTranInfo.scale[2]);
        object.components.forEach((cpnt: any) => {
            const modelMat4: THREE.Matrix4 = new THREE.Matrix4().compose(modelPos, modelQuat, modelScale);
            const materialObj: any = Util.findObjectInArray(cpnt.material, materials);
            const jidInfo: UrlInfo = materialObj.texture ? Util.findJidInUrl(materialObj.texture) : undefined;
            let newUrl: string = jidInfo ? Util.getContentUrl(jidInfo.jid, jidInfo.name, jidInfo) : materialObj.texture;
            const options: any = cpnt.uv_override ? cpnt.uv_override : undefined;
            const { texture, normaltexture } = this._getTextures({ texture: newUrl }, options);
            const material: any = Util.getInitMaterial(texture, normaltexture);
            let tm: TransInfo = Util.getModelTransInfo(cpnt);
            const tp: THREE.Vector3 = new THREE.Vector3(tm.pos[0], tm.pos[1], tm.pos[2]);
            const tq: THREE.Quaternion = new THREE.Quaternion(tm.rot[0], tm.rot[1], tm.rot[2], tm.rot[3]);
            const ts: THREE.Vector3 = new THREE.Vector3(tm.scale[0], tm.scale[1], tm.scale[2]);
            const localMat4: THREE.Matrix4 = new THREE.Matrix4().compose(tp, tq, ts);
            const globalMat4: THREE.Matrix4 = modelMat4.multiply(localMat4);
            let gp: THREE.Vector3 = new THREE.Vector3();
            let gq: THREE.Quaternion = new THREE.Quaternion();
            let gs: THREE.Vector3 = new THREE.Vector3();
            globalMat4.decompose(gp, gq, gs);
            if (transInfos.has(cpnt.meshName) && modelMaterials.has(cpnt.meshName)) {
                const transArray = transInfos.get(cpnt.meshName);
                const mtlArray = modelMaterials.get(cpnt.meshName);
                transArray.push({ pos: Object.values(gp), rot: Object.values(gq), scale: Object.values(gs) });
                mtlArray.push(material);
            } else {
                transInfos.set(cpnt.meshName, [{ pos: Object.values(gp), rot: Object.values(gq), scale: Object.values(gs) }]);
                modelMaterials.set(cpnt.meshName, [material]);
            }
        });
    }

    private _furnitureInstanceDraw(rootNode: any, value: Array<any>,
        curScene: THREE.Object3D, rayCastObjects: any[], showInfo?: JsonDetail): void {
        const tmpBuffer: THREE.BufferGeometry = Util.mergerObject3DMeshToBufferGeometry(rootNode);
        let curMesh: THREE.Mesh;
        const s: string = 'default';
        const curMtl = value[0].modelMaterials.get(s)[0];
        const INSTANCES = value.length;
        const instancedGeometry = new THREE.InstancedBufferGeometry();
        instancedGeometry.copy(tmpBuffer);
        const instanceOffset = new Float32Array(INSTANCES * 3);
        const innstanceQuat = new Float32Array(INSTANCES * 4);
        const instanceScale = new Float32Array(INSTANCES * 3);
        let rayCastMesh: any;
        const tmpuuid: string[] = [];
        for (let i = 0; i < INSTANCES; i++) {
            let index = 3 * i;
            let tmpIndex = 4 * i;
            const tmpTransInfo = value[i].transInfos.get(s)[0];
            const tPos = tmpTransInfo.pos;
            const tRot = tmpTransInfo.rot;
            const tScl = tmpTransInfo.scale;

            instanceOffset[index] = tmpTransInfo.pos[0] * 100;
            instanceOffset[index + 1] = tmpTransInfo.pos[1] * 100;
            instanceOffset[index + 2] = tmpTransInfo.pos[2] * 100;

            instanceScale[index] = tmpTransInfo.scale[0];
            instanceScale[index + 1] = tmpTransInfo.scale[1];
            instanceScale[index + 2] = tmpTransInfo.scale[2];

            innstanceQuat[tmpIndex] = tmpTransInfo.rot[0];
            innstanceQuat[tmpIndex + 1] = tmpTransInfo.rot[1];
            innstanceQuat[tmpIndex + 2] = tmpTransInfo.rot[2];
            innstanceQuat[tmpIndex + 3] = tmpTransInfo.rot[3];

            rayCastMesh = new THREE.Mesh(tmpBuffer, curMtl);
            rayCastMesh.position.set(tPos[0] * 100, tPos[1] * 100, tPos[2] * 100);
            const quaternion: THREE.Quaternion = new THREE.Quaternion(Number(tRot[0]), Number(tRot[1]),
                Number(tRot[2]), Number(tRot[3]));
            rayCastMesh.setRotationFromQuaternion(quaternion);
            rayCastMesh.scale.set(Number(tScl[0]), Number(tScl[1]), Number(tScl[2]));
            rayCastMesh.updateMatrix();
            rayCastMesh.updateWorldMatrix(false, false);
            rayCastMesh.modelUrl = rootNode.modelUrl;
            rayCastObjects.push(rayCastMesh);
            this.meshMapShowInfo && this.meshMapShowInfo.set(rayCastMesh.uuid, showInfo);
            this.rayCastMapInstanceId && this.rayCastMapInstanceId.set(rayCastMesh.uuid, i);
            tmpuuid.push(rayCastMesh.uuid);
        }
        instancedGeometry.addAttribute('instanceOffset', new THREE.InstancedBufferAttribute(instanceOffset, 3));
        instancedGeometry.addAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScale, 3));
        instancedGeometry.addAttribute('instanceQuat', new THREE.InstancedBufferAttribute(innstanceQuat, 4));
        curMesh = new THREE.Mesh(instancedGeometry, curMtl);
        if (this.rayCastMapInsMesh) {
            tmpuuid.forEach((key: string) => {
                this.rayCastMapInsMesh.set(key, curMesh);
            });
        }
        curScene && curScene.add(curMesh);
        this.rmChildren && this.rmChildren.push(curMesh);
    }

    private _createScene(data: any, curScene: THREE.Object3D, rayCastOjbects: any[]): void {
        const constant: ResUrl = Util.initConstants();
        const localWindow = window;
        const dataScene = data.scene;
        const dataSceneRoom = dataScene.room;
        const roomLength = dataSceneRoom.length;
        if (!data || !dataScene || !dataSceneRoom || !roomLength) {
            localWindow.cancelAnimationFrame(this._stop);
            return;
        }
        const furnitures = data.furniture || [];
        const meshes = data.mesh || [];
        const materials = data.material;
        const mtlKeyMap: Map<string, any> = new Map();
        materials.forEach((mtl: any) => {
            mtlKeyMap.set(mtl.uid, mtl);
        });
        const urlApiMap: Map<string, any> = new Map();
        dataSceneRoom.forEach((ths: any) => {
            const thsChildren = ths.children;
            if (!thsChildren || !thsChildren.length) {
                return;
            }
            thsChildren.forEach((obj: any) => {
                const transInfo: TransInfo = Util.getModelTransInfo(obj);
                const objRef = obj.ref;
                const objComponents = obj.components;
                if (objRef.includes('model')) {
                    const axisRotate: EulerRotateInfo = Util.getAxisRotateFromQuaternion(transInfo.rot);
                    const furniture: any = Util.findObjectInArray(objRef, furnitures);
                    if (!furniture) { return; }
                    const modelUrl: string = Util.getContentUrl(furniture.jid, constant.objName);
                    let transInfos: Map<string, Array<TransInfo>> = new Map();
                    let modelMaterials: Map<string, Array<THREE.MeshPhongMaterial>> = new Map();
                    let mtlJid;
                    if (objComponents && objComponents.length) {
                        this._dealComponentObject(obj, materials, transInfos, transInfo, modelMaterials);
                    } else {
                        let materialUrl: string;
                        if (obj.material) {
                            const materialObj = Util.findObjectInArray(obj.material, materials);
                            const jidInfo = materialObj.texture ? Util.findJidInUrl(materialObj.texture) : undefined;
                            materialUrl = jidInfo ? Util.getContentUrl(jidInfo.jid, jidInfo.name, jidInfo) : materialObj.texture;
                            mtlJid = jidInfo ? jidInfo.jid : undefined;
                        } else {
                            materialUrl = Util.replaceHost(Util.getContentUrl(furniture.jid, constant.mtlName).slice(0), ossHost);
                            mtlJid = furniture.jid;
                        }
                        transInfos.set('default', [transInfo]);
                        const { texture, normaltexture } = this._getTextures({ texture: materialUrl });
                        const material = Util.getInitMaterial(texture, normaltexture, { instance: true });
                        modelMaterials.set('default', [material]);
                    }
                    const api: string = Util.FpmwApi(furniture.jid);
                    this.urlOBJModelMap.has(modelUrl) ?
                        this.urlOBJModelMap.get(modelUrl).push({ mtlJid, modelMaterials, transInfos }) :
                        this.urlOBJModelMap.set(modelUrl, [{ mtlJid, modelMaterials, transInfos }]);
                    urlApiMap.set(modelUrl, { api, axisRotate, transInfo, type: ths.type });
                } else {
                    const meshObj = Util.findObjectInArray(objRef, meshes);
                    const meshObjType = meshObj.type;
                    if (!meshObj || !meshObjType
                        || (meshObjType && meshObjType.includes('CustomizedCeiling'))
                        || (meshObjType && meshObjType.includes('WallOuter'))
                        || (meshObjType && meshObjType.includes('Ceiling'))) {
                        return;
                    }
                    const materialObj = Util.findObjectInArray(meshObj.material, materials);
                    this.mtlMeshMap.has(materialObj.uid) ? this.mtlMeshMap.get(materialObj.uid).push(meshObj) :
                        this.mtlMeshMap.set(materialObj.uid, [meshObj]);
                }
            });
        });

        const setRenderObject = (rootNode: any, val: any, showInfo: any) => {
            let { transInfos, modelMaterials } = val;
            if (!modelMaterials) {
                modelMaterials = new Map();
                modelMaterials.set('default', Util.getInitMaterial());
            }
            if (!transInfos) {
                transInfos = new Map();
                transInfos.set('default', Util.getInitTransInfo());
            }
            this._setObject3D(rootNode, transInfos, modelMaterials, showInfo, curScene, rayCastOjbects);
        };

        this.urlOBJModelMap.forEach((value: Array<any>, key: string) => {
            const objLoader = new THREE.OBJLoader2();
            const workSupport = objLoader.workerSupport;
            workSupport.setTerminateRequested(true);
            const currentInfo = urlApiMap.get(key);
            if (!currentInfo) {
                return;
            }
            const curAxisRotate = currentInfo.axisRotate;
            const curTransInfo = currentInfo.transInfo;
            const curType = currentInfo.type;
            fetch(currentInfo.api).then((res): any => {
                return res.json()
            }).then((tmpJsonInfo: any): void => {
                const tmpValue = value;
                let jsonInfo: any = Object.assign({}, tmpJsonInfo);
                jsonInfo.axisRotate = curAxisRotate;
                jsonInfo.pos = curTransInfo.pos;
                jsonInfo.room = curType;
                let showInfo: JsonDetail = Util.parseFpJSONInfo(jsonInfo);
                objLoader.load(key, (obj: any) => {
                    let tmpObj = obj;
                    if (tmpObj.detail && tmpObj.detail.loaderRootNode) {
                        const rootNode: any = tmpObj.detail.loaderRootNode.clone();
                        rootNode.modelUrl = key;
                        if (tmpValue[0].mtlJid) {
                            this._furnitureInstanceDraw(rootNode, tmpValue, curScene, rayCastOjbects, showInfo);
                        } else {
                            tmpValue.forEach((val) => {
                                setRenderObject(rootNode, val, showInfo);
                            });
                        }
                    }
                }, null, null, null, true);
            }).catch((e: any) => {
                const tmpValue = value;
                objLoader.load(key, (obj: any) => {
                    let tmpObj = obj;
                    const tmpDetail = tmpObj.detail;
                    const loaderRootNode = tmpDetail.loaderRootNode;
                    if (tmpDetail && loaderRootNode) {
                        const rootNode = loaderRootNode.clone();
                        tmpValue.forEach((val) => {
                            setRenderObject(rootNode, val, undefined);
                        });
                    }
                }, null, null, null, true);
            });
        });

        this.mtlMeshMap.forEach((value: Array<any>, key: string) => {
            const materialObj = mtlKeyMap.get(key);
            if (!materialObj) {
                return;
            }
            const jidInfo = materialObj.texture ? Util.findJidInUrl(materialObj.texture) : undefined;
            let newUrl = jidInfo ? Util.getContentUrl(jidInfo.jid, jidInfo.name, jidInfo) : materialObj.texture;
            materialObj.texture = newUrl ? newUrl : materialObj.texture;
            const { texture, normaltexture } = this._getTextures(materialObj);
            const material: THREE.MeshPhongMaterial = Util.getInitMaterial(texture, normaltexture);
            if (!material.map) { material.map = texture; }
            if (!material.normalMap) { material.normalMap = normaltexture; }
            material.needsUpdate = true;
            const bufferGeometry: THREE.BufferGeometry = Util.createMergeBufferGeometryFromGraphicDatas(value);
            const mesh = Util.constructMesh(bufferGeometry, material);
            curScene && curScene.add(mesh);
            this.rmChildren && this.rmChildren.push(mesh);
        });
    }
}