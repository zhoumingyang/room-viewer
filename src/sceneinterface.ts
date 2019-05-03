
export interface Obj {
    id: string;
    pos?: Array<number>;
    rot?: Array<number>;
    scale?: Array<number>;
    modelName: string;
    modelPath: string;
    imgPath?: string;
    color?: Array<number>;
}

export interface Mesh {
    id: string;
    pos?: Array<number>;
    rot?: Array<number>;
    scale?: Array<number>;
    meshName: string;
    normals: Array<number>;
    uvs: Array<number>;
    points: Array<number>;
    indices: Array<number>;
    imgPath?: string;
    normalImgPath?: string;
    color?: Array<number>;
    doubleSide: boolean;
}

export interface Scene {
    sceneName: string;
    sceneId: string;
    objs?: Array<Obj>;
    meshes?: Array<any>;
}