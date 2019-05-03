import * as THREE from "three";

export interface TextureInfo {
    texture?: THREE.Texture;
    normaltexture?: THREE.Texture;
    [propName: string]: any;
}

export interface TransInfo {
    pos?: Array<number>;
    rot?: Array<number>;
    scale?: Array<number>;
    [propName: string]: any;
}

export interface ResUrl {
    mtlUrl?: string;
    objUrl?: string;
    objName?: string;
    mtlName?: string;
    [propName: string]: any;
}

export interface JsonDetail {
    jid?: string;
    name?: string;
    contentType?: string;
    rotation?: any;
    pos?: Array<number>;
    categoryid?: string;
    offsetY?: number;
    room?: string;
    [propName: string]: any;
}

export interface EulerRotateInfo {
    axis?: THREE.Vector3;
    angle?: number;
    [propName: string]: any;
}

export interface UrlInfo {
    jid?: string;
    name?: string;
    type?: string;
    [propName: string]: any;
}

export interface WindowSize {
    width?: number;
    height?: number;
    [propName: string]: any;
}