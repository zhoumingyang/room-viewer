import * as THREE from "three";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { TransInfo, ResUrl, JsonDetail, EulerRotateInfo, UrlInfo, WindowSize } from "./interface";
import { Mesh, Obj } from "./sceneinterface";
import { FurnitureInfo } from "./ui/selectedfurnitureform/furnitureinfo";
require("./material/instancephongmaterial");

const _toNumberArray = function (strArray: Array<string>): Array<number> {
    return strArray.map((num: string): number => {
        return Number(num);
    });
};

const _getInitMaterial = function (texture?: THREE.Texture,
    normalTexture?: THREE.Texture, options?: any): any {
    const material: any = new THREE.MeshPhongMaterial({
        color: "#ffffff",
        specular: 16777215,
        shininess: 5,
        map: texture || undefined,
        normalMap: normalTexture || undefined,
        side: THREE.FrontSide
    });
    material.needsUpdate = true;
    if (options && options.instance) {
        material.defines = material.defines || {};
        material.defines['INSTANCED'] = "";
    }
    return material;
};

const _getInitTransInfo = function (): TransInfo {
    const unitPos: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    const unitRot: THREE.Quaternion = new THREE.Quaternion();
    const unitScale: THREE.Vector3 = new THREE.Vector3(1, 1, 1);
    const transinfo: TransInfo = {
        pos: [unitPos.x, unitPos.y, unitPos.z],
        rot: [unitRot.x, unitRot.y, unitRot.z, unitRot.w],
        scale: [unitScale.x, unitScale.y, unitScale.z]
    }
    return transinfo;
};

export const Util = {
    initConstants: function (): ResUrl {
        const objUrl: string = 'https://jr-prod-pim-products.oss-cn-beijing.aliyuncs.com/i/';
        const mtlUrl: string = 'https://jr-prod-pim-products.oss-cn-beijing.aliyuncs.com/i/';
        const objName: string = 'model-norm.obj';
        const mtlName: string = 'model.png';
        const resInfo: ResUrl = {
            mtlUrl: mtlUrl,
            objUrl: objUrl,
            objName: objName,
            mtlName: mtlName,
        };
        return resInfo;
    },

    getInitMaterial: function (texture?: THREE.Texture, normalTexture?: THREE.Texture, options?: any)
        : THREE.MeshPhongMaterial {
        return _getInitMaterial(texture, normalTexture, options);
    },

    getInitTransInfo: function (): TransInfo {
        return _getInitTransInfo();
    },

    getObjUrl: function (seekId: string, urlheader: string, name: string): string {
        if (!seekId) {
            return;
        }
        return urlheader + seekId + name;
    },

    findObjectInArray: function (ref: string, arr: Array<any>): any {
        if (!ref || !arr || !arr.length) {
            return;
        }
        let obj;
        for (let a of arr) {
            if (a.uid === ref) {
                return a;
            }
        }
        return obj;
    },

    getModelTransInfo: function (obj: any): TransInfo {
        const { pos, rot, scale } = obj;
        return {
            pos,
            rot,
            scale
        }
    },

    toNumberArray: function (strArray: Array<string>): Array<number> {
        return _toNumberArray(strArray);
    },

    constructBufferGeometry: function (meshObj: any): THREE.BufferGeometry {
        if (!meshObj) {
            return;
        }
        const faces: Array<number> = meshObj.faces;
        const normal: Array<number> = _toNumberArray(meshObj.normal);
        const uv: Array<number> = _toNumberArray(meshObj.uv);
        const xyz: Array<number> = _toNumberArray(meshObj.xyz);

        const bufferGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.Float32BufferAttribute(xyz, 3));
        bufferGeometry.addAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
        bufferGeometry.addAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uv), 2));
        bufferGeometry.setIndex(new THREE.Uint32BufferAttribute(faces, 1));
        return bufferGeometry;
    },

    constructMesh: function (bufferGeometry: THREE.BufferGeometry,
        material: THREE.MeshPhongMaterial, transInfo?: TransInfo): THREE.Mesh {
        if (!bufferGeometry) {
            return;
        }
        if (!transInfo) {
            transInfo = _getInitTransInfo();
        }
        if (!material) {
            material = _getInitMaterial();
        }
        const mesh = new THREE.Mesh(bufferGeometry, material);
        mesh.position.set(Number(transInfo.pos[0]), Number(transInfo.pos[1]), Number(transInfo.pos[2]));
        const quaternion = new THREE.Quaternion(Number(transInfo.rot[0]), Number(transInfo.rot[1]),
            Number(transInfo.rot[2]), Number(transInfo.rot[3]));
        mesh.setRotationFromQuaternion(quaternion);
        mesh.scale.set(Number(transInfo.scale[0] * 100), Number(transInfo.scale[1] * 100), Number(transInfo.scale[2] * 100));
        mesh.receiveShadow = true;
        return mesh;
    },

    parseFpJSONInfo: function (jsonInfo: any): JsonDetail {
        if (!jsonInfo || !jsonInfo.item) {
            return;
        }
        let contenttype: string;
        for (let attr of jsonInfo.item.attributes) {
            if (attr.name === 'ContentType') {
                contenttype = attr.values ? attr.values[0].value : '';
                break;
            }
        }
        return {
            jid: jsonInfo.item.id,
            name: jsonInfo.item.name,
            contentType: contenttype,
            rotation: jsonInfo.axisRotate ? jsonInfo.axisRotate : undefined,
            pos: jsonInfo.pos ? jsonInfo.pos : undefined,
            room: jsonInfo.room ? jsonInfo.room : 'none',
        };
    },

    setContentInfoShow: function (showInfo: JsonDetail, opacity: string) {
        if (!showInfo) {
            ReactDOM.render(<FurnitureInfo />, document.getElementsByClassName('furniture-info-container')[0]);
            return;
        }
        const tmpElement = <FurnitureInfo
            jid={showInfo.jid}
            name={showInfo.name}
            type={showInfo.contentType}
            room={showInfo.room}
        />
        ReactDOM.render(tmpElement, document.getElementsByClassName('furniture-info-container')[0]);
    },

    FpmwApi: function (jid: string): string {
        return 'https://jr-fpmw.homestyler.com/api/rest/v2.0/product/' + jid + '?t=ezhome&l=zh_CN&branch=';
    },

    getCatelogTreeApi: function (paramObj: any): string {
        const ver: string = 'v3.0';
        const method: string = paramObj.categoryId ? 'subCategory' : 'category';
        const url: string = 'https://jr-fpmw.homestyler.com' + '/api/rest/' + ver + '/' + method;
        const params: any = {
            t: 'ezhome',
            l: 'language',
            app: 'fpweb',
            treeId: 'front-category-root',
        };
        Object.assign(params, paramObj);
        const addParam = (url: string, parameter: string, value: string): string => {
            var result = url;
            if (url.includes('?')) {
                result += '&';
            } else {
                result += '?';
            }
            result += parameter + '=' + value;
            return result;
        };
        const addParams = (url: string, params: any): string => {
            let result: string = url;
            Object.entries(params).forEach(function (entry: any) {
                result = addParam(result, entry[0], entry[1]);
            });
            return result;
        };
        const re: string = addParams(url, params);
        return re;
    },

    getAxisRotateFromQuaternion: function (quat: Array<number>): EulerRotateInfo {
        if (!quat || !quat.length) {
            return;
        }
        const quaternion: THREE.Quaternion = new THREE.Quaternion(quat[0], quat[1], quat[2], quat[3]);
        const Euler: THREE.Euler = new THREE.Euler().setFromQuaternion(quaternion, 'YZX');
        const angle: number = -THREE.Math.radToDeg(Euler.y);
        return {
            axis: new THREE.Vector3(0, 1, 0),
            angle
        };
    },

    getRandomInt: function (max: number): number {
        return Math.floor(Math.random() * Math.floor(max));
    },

    getContentUrl: function (guid?: string, filename?: string, urlInfo?: UrlInfo): string {
        const config: any = {
            cnamePattern: (!urlInfo || !urlInfo.type || urlInfo.type === 'assets')
                ? 'https://s4#index#.homestyler.com/i/'
                : 'https://s4#index#.homestyler.com/i/',
            count: 10,
        };
        if (guid) {
            const CNameIndex: number = Number.parseInt(`0x${guid.substr(0, 8)}`, 16) % config.count;
            let url: string = `${config.cnamePattern}${guid}/${filename}`;
            url = url.replace('#index#', CNameIndex.toString());
            return url;
        }
        return '';
    },

    replaceHost: function (url: string, host?: string): string {
        const type: string = '?x-oss-process=style/iso-render-small';
        if (url.length <= 0 || url.includes(type) || url.includes('/dist/img') || url.includes('data:image/')) {
            return url;
        }
        const urlBody: string[] = url.split('/');
        const iPos: number = urlBody.indexOf('i');
        let head: string = 'a';
        let detail: string[] = [];
        if (iPos > 0) {
            detail = urlBody.slice(iPos);
        }
        if (url.includes('s3.cn-north-1.amazonaws.com.cn/juran-prod-contents')) {
            head = 'c';
            detail = urlBody.slice(-2);
        }
        // return `https://${head}${Util.getRandomInt(10)}.${host}${detail.join('/')}${type}`;
        return url + type;
    },

    findJidInUrl: function (url: string): UrlInfo {
        if (!url || !url.length) {
            return;
        }
        const urlBody = url.split('/');
        if (url.includes('juran-prod-assets.s3.cn-north-1.amazonaws.com.cn') && url.includes('/i/') && !url.includes('/resized/')) {
            return { jid: urlBody.indexOf('i') !== -1 ? urlBody[urlBody.indexOf('i') + 1] : '', type: 'assets', name: urlBody[urlBody.length - 1] };
        }
        else if (url.includes('juran-prod-contents.s3.cn-north-1.amazonaws.com.cn') && url.includes('material')) {
            return { jid: urlBody[urlBody.length - 1].split('_')[0], type: 'contents', name: urlBody[urlBody.length - 1] };
        }
        return;
    },

    getWindowSize: function (): WindowSize {
        return { width: window.innerWidth, height: window.innerHeight };
    },

    setNewSceneObj: function (obj: any, furnitures: Array<any>): Obj {
        let tmpObj: Obj = {} as any;
        tmpObj.id = obj.instanceid;
        tmpObj.pos = obj.pos;
        tmpObj.rot = obj.rot;
        tmpObj.scale = obj.scale;
        const furniture = Util.findObjectInArray(obj.ref, furnitures);
        tmpObj.modelName = furniture.title;
        tmpObj.modelPath = `https://s40.homestyler.com/i/${furniture.jid}/model.obj`;
        tmpObj.imgPath = `https://s40.homestyler.com/i/${furniture.jid}/model.png?x-oss-process=style/iso-render-small`;
        tmpObj.color = [255, 255, 255];
        return tmpObj;
    },

    setNewSceneMesh: function (obj: any, allMeshes: Array<any>, materials: Array<any>): Mesh {
        let tmpMesh: Mesh = {} as any;
        const meshObj = Util.findObjectInArray(obj.ref, allMeshes);
        const materialObj = Util.findObjectInArray(meshObj.material, materials);
        tmpMesh.pos = obj.pos;
        tmpMesh.rot = obj.rot;
        tmpMesh.scale = obj.scale;
        tmpMesh.id = meshObj.constructid;
        tmpMesh.meshName = meshObj.type;
        tmpMesh.normals = meshObj.normal;
        tmpMesh.uvs = meshObj.uv;
        tmpMesh.points = meshObj.xyz;
        tmpMesh.indices = meshObj.faces;
        tmpMesh.imgPath = materialObj.texture;
        tmpMesh.normalImgPath = materialObj.normaltexture;
        tmpMesh.color = materialObj.color;
        tmpMesh.doubleSide = true;
        return tmpMesh;
    },

    parseSceneRoomMsg: function (designData: any): any {
        if (!designData || !designData.scene) {
            return;
        }
        if (!designData.scene.room && !designData.scene.furniture) {
            return;
        }

        interface KeyValue {
            skey?: string;
            value?: any;
        }
        const rooms: Array<any> = designData.scene.room;
        const roomNumber: number = rooms.length;
        let totalArea: number = 0;
        let roomArea: Array<KeyValue> = [];
        rooms.forEach((room: any) => {
            totalArea += room.size;
            roomArea.push({ skey: room.type, value: room.size });
        });

        const furnitures: Array<any> = designData.furniture;
        let doorNumber: number = 0;
        let windowNumber: number = 0;
        let furnitureNumber: number = 0;
        furnitures.forEach((fur: any) => {
            if (fur.title.includes('door') && !fur.title.includes('cabinet')) {
                doorNumber++;
            } else if (fur.title.includes('window')) {
                windowNumber++;
            } else {
                furnitureNumber++;
            }
        });
        return {
            roomNumber: {
                skey: 'roomNumber',
                value: roomNumber,
            },
            totalArea: {
                skey: 'totalArea',
                value: totalArea,
            },
            doorNumber: {
                skey: 'doorNumber',
                value: doorNumber,
            },
            windowNumber: {
                skey: 'windowNumber',
                value: windowNumber,
            },
            roomArea: roomArea,
            furnitureNumber: {
                skey: 'furnitureNumber',
                value: furnitureNumber,
            }
        };
    },

    mergerObject3DMeshToBufferGeometry: (object3D: THREE.Object3D): THREE.BufferGeometry => {
        let positionArray: Array<number> = [];
        let normalArray: Array<number> = [];
        let uvArray: Array<number> = [];
        let sumPosCursor: number = 0;
        let sumNormCursor: number = 0;
        let sumUvCursor: number = 0;
        object3D.traverse((mesh: THREE.Mesh) => {
            if (mesh.name && mesh.name.includes('shadow')) {
                return;
            }
            if (mesh.geometry && mesh.geometry instanceof THREE.BufferGeometry) {
                let position = mesh.geometry.getAttribute('position').array;
                let normal = mesh.geometry.getAttribute('normal').array;
                let uv = mesh.geometry.getAttribute('uv').array;
                for (let i = 0; i < position.length; i++) {
                    positionArray[i + sumPosCursor] = position[i];
                }
                sumPosCursor += normal.length;

                for (let j = 0; j < normal.length; j++) {
                    normalArray[j + sumNormCursor] = normal[j];
                }
                sumNormCursor += normal.length;

                for (let k = 0; k < uv.length; k++) {
                    uvArray[k + sumUvCursor] = uv[k];
                }
                sumUvCursor += uv.length;
            }
        });
        const mergeBufferGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        mergeBufferGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(positionArray), 3));
        mergeBufferGeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(normalArray), 3));
        mergeBufferGeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvArray), 2));
        return mergeBufferGeometry;
    },

    createMergeBufferGeometryFromGraphicDatas: (datas: any) => {
        let xyz: Array<any> = [];
        let normal: Array<any> = [];
        let uv: Array<any> = [];
        let len: number = datas.length;
        for (let i: number = 0; i < len; i++) {
            if (datas[i] && datas[i].faces && datas[i].faces.length) {
                datas[i].faces.forEach((idx: number) => {
                    let pidx = idx * 3;
                    let vidx = idx * 2;
                    xyz.push(datas[i].xyz[pidx], datas[i].xyz[pidx + 1], datas[i].xyz[pidx + 2]);
                    normal.push(datas[i].normal[pidx], datas[i].normal[pidx + 1], datas[i].normal[pidx + 2]);
                    uv.push(datas[i].uv[vidx], datas[i].uv[vidx + 1]);
                });
            } else {
                xyz = xyz.concat(datas[i].xyz);
                normal = normal.concat(datas[i].normal);
                uv = uv.concat(datas[i].uv);
            }
        }
        const bufferGeometry: THREE.BufferGeometry = new THREE.BufferGeometry();
        bufferGeometry.addAttribute('position', new THREE.Float32BufferAttribute(xyz, 3));
        bufferGeometry.addAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
        bufferGeometry.addAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(uv), 2));
        return bufferGeometry;
    },

    createInstanceMeshFromGraphicDatas: (tmpBuffer: THREE.BufferGeometry, datas: any): THREE.Mesh => {
        if(!tmpBuffer || !datas || !datas.length) {
            return;
        }
        let curMesh: THREE.Mesh;
        const curMtl = datas[0].modelMaterials.get(s)[0];
        const INSTANCES = datas.length;
        const instancedGeometry = new THREE.InstancedBufferGeometry();
        instancedGeometry.copy(tmpBuffer);
        const instanceOffset = new Float32Array(INSTANCES * 3);
        const innstanceQuat = new Float32Array(INSTANCES * 4);
        const instanceScale = new Float32Array(INSTANCES * 3);
        for (let i = 0; i < INSTANCES; i++) {
            let index = 3 * i;
            let tmpIndex = 4 * i;
            const tmpTransInfo = datas[i].transInfos.get(s)[0];

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
        }
        instancedGeometry.addAttribute('instanceOffset', new THREE.InstancedBufferAttribute(instanceOffset, 3));
        instancedGeometry.addAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScale, 3));
        instancedGeometry.addAttribute('innstanceQuat', new THREE.InstancedBufferAttribute(innstanceQuat, 4));
        curMesh = new THREE.Mesh(instancedGeometry, curMtl);
        return curMesh;
    },

    object3DDispose: (obj: any) => {
        if (!obj) {
            return;
        }
        obj.traverse((o: any) => {
            if (o.geometry && o.geometry.dispose) {
                o.geometry.dispose();
            }
            if (o.material && o.material.dispose) {
                o.material.dispose();
                o.material.map && o.material.map.dispose();
                o.material.normalMap && o.material.normalMap.dispose();
            }
        });
        if (obj.geometry && obj.geometry.dispose) {
            obj.geometry.dispose();
        }
        if (obj.material && obj.material.dispose) {
            obj.material.dispose();
            obj.material.map && obj.material.map.dispose();
            obj.material.normalMap && obj.material.normalMap.dispose();
        }
    },

    cacheDataClear: (param: any) => {
        if (param.meshMapShowInfo) {
            param.meshMapShowInfo.forEach((info: any) => {
                info = undefined;
            });
            param.meshMapShowInfo.clear();
            delete param.meshMapShowInfo;
        }

        if (param.mtlMeshMap) {
            param.mtlMeshMap.forEach((info: any) => {
                info = undefined;
            });
            param.mtlMeshMap.clear();
            delete param.mtlMeshMap;
        }

        if (param.urlOBJModelMap) {
            param.urlOBJModelMap.forEach((info: any) => {
                info = undefined;
            });
            param.urlOBJModelMap.clear();
            delete param.urlOBJModelMap;
        }

        if (param.cacheSceneDatas) {
            param.cacheSceneDatas.forEach((sceneData: any) => {
                sceneData = undefined;
            });
            delete param.cacheSceneDatas;
        }

        if (param.rayCastMapInstanceId) {
            param.rayCastMapInstanceId.forEach((info: any) => {
                info = undefined;
            });
            param.rayCastMapInstanceId.clear();
            param.rayCastMapInstanceId = undefined;
        }

        if (param.rayCastMapInsMesh) {
            param.rayCastMapInsMesh.forEach((info: any) => {
                info = undefined;
            });
            param.rayCastMapInsMesh.clear();
            param.rayCastMapInsMesh = undefined;
        }
    }
};