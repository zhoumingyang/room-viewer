import * as THREE from "three";
import { ViewerScene } from "./viewer3d";
import { ResourceMessage, RenderMode } from "./resource";

export class Handler {
    public sceneView: any;
    constructor(sceneView: any) {
        this.sceneView = sceneView;
    }

    private existSceneView() {
        return (this.sceneView && this.sceneView instanceof ViewerScene) ? true : false;
    }

    public getRenderParams(): any {
        if (!this.existSceneView()) {
            return;
        }
        return {
            scene: this.sceneView.normalScene,
            lights: [this.sceneView.ambientLight, this.sceneView.hemiLight, this.sceneView.directionalLight],
            sceneRender: this.sceneView.normalRenderer,
            changeToPerspectiveCamera: this.changeToPerspectiveCamera.bind(this),
            changeToOrthographicCamera: this.changeToOrthographicCamera.bind(this),
            changeSceneRotation: this.changeSceneRotation.bind(this),
            reset: this.rest.bind(this),
            sliderData: {
                title: ResourceMessage['angle'],
                className: "overlookSlider",
                option: {
                    max: 18000,
                },
                value: 0,
                titleOffset: true,
                onValueChanging: (e: any) => {
                    e = e / 100;
                    this.changeSceneRotation(e);
                },
                onValueChangeEnd: (e: any) => {
                    e = e / 100;
                    this.changeSceneRotation(e);
                }
            },
            sliderFrustum: {
                title: ResourceMessage['frustum'],
                className: "frustumSlider",
                option: {
                    max: 1000,
                },
                value: 0,
                titleOffset: true,
                onValueChanging: (e: any) => {
                    this.changeFrustum(e);
                },
                onValueChangeEnd: (e: any) => {
                    this.changeFrustum(e);
                }
            }
        };
    }

    public rest(): void {
        if (!this.existSceneView()) {
            return;
        }
        this.addAllLights();
        if (this.sceneView.directionalLight) {
            this.sceneView.directionalLight.position.set(-1500, 2500, -1500);
        }
        this.changeFrustum(0);
        this.changeSceneRotation(0);
        this.changeToPerspectiveCamera();
        this.renderAll();
    }

    public changeSceneRotation(angle: number): void {
        if (!this.existSceneView()) {
            return;
        }
        if (this.sceneView.normalScene) {
            this.sceneView.normalScene.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        }
    }

    public changeFrustum(value: number): void {
        if (!this.existSceneView()) {
            return;
        }
        const tempWidth: number = window.innerWidth;
        const tempHeight: number = window.innerHeight;
        const aspect: number = tempWidth / tempHeight;
        if (this.sceneView.currentCamera &&
            this.sceneView.currentCamera instanceof THREE.OrthographicCamera) {
            const frustumSize: number = 1350 + value;
            this.sceneView.currentCamera.left = frustumSize * aspect / -2;
            this.sceneView.currentCamera.right = frustumSize * aspect / 2;
            this.sceneView.currentCamera.top = frustumSize / 2;
            this.sceneView.currentCamera.bottom = frustumSize / -2;
            this.sceneView.currentCamera.updateProjectionMatrix();
        }
    }

    public changeToPerspectiveCamera(): void {
        if (!this.existSceneView()) {
            return;
        }
        this.sceneView.currentCamera = this.sceneView.normalCamera;
        this.sceneView._render();
    }

    public changeToOrthographicCamera(): void {
        if (!this.existSceneView()) {
            return;
        }
        this.sceneView.currentCamera = this.sceneView.orthographicCamera;
        this.sceneView._render();
    }

    public _doChangeToNewScene(isLeft: boolean): void {
        if (!this.existSceneView()) {
            return;
        }

        if (this.sceneView.sceneNodes[this.sceneView.currentIndex]) {
            this._replaceScene();
        } else if (this.sceneView.cacheSceneDatas[this.sceneView.currentIndex]) {
            const currentSceneData = this.sceneView.cacheSceneDatas[this.sceneView.currentIndex];
            this.sceneView.drawScene([currentSceneData]);
        } else {
            isLeft ? ++this.sceneView.currentIndex : --this.sceneView.currentIndex;
        }
    }

    public leftArrowClick(): void {
        if (!this.existSceneView()) {
            return;
        }
        if (this.sceneView.renderMode === RenderMode.AllRender) {
            --this.sceneView.currentIndex;
            this._doChangeToNewScene(true);
        }
    }

    public rightArrowClick(): void {
        if (!this.existSceneView()) {
            return;
        }
        if (this.sceneView.renderMode === RenderMode.AllRender) {
            ++this.sceneView.currentIndex;
            this._doChangeToNewScene(false);
        }
    }

    public _replaceScene(): void {
        if (!this.existSceneView()) {
            return;
        }
        this.sceneView.normalScene.remove(this.sceneView.removeSceneNode);
        this.sceneView.currentSceneNode = this.sceneView.sceneNodes[this.sceneView.currentIndex];
        this.sceneView.rayCastObjects = this.sceneView.rayCastObjectsArray[this.sceneView.currentIndex];
        this.sceneView.normalScene.add(this.sceneView.currentSceneNode);
        this.sceneView.removeSceneNode = this.sceneView.currentSceneNode;
    }

    public getReplaceParams(): any {
        if (!this.existSceneView()) {
            return;
        }
        return {
            leftArrowClick: this.leftArrowClick.bind(this),
            rightArrowClick: this.rightArrowClick.bind(this),
        };
    }

    public getLightParams(): any {
        if (!this.existSceneView()) {
            return;
        }
        let datas: Array<any> = [
            {
                title: "x",
                className: "positionxSlider",
                option: {
                    max: 2000,
                },
                value: this.sceneView.directionalLight.position.x,
                titleOffset: true,
                onValueChanging: (e: any) => {
                    this.sceneView.directionalLight.position.set(e, this.sceneView.directionalLight.position.y, this.sceneView.directionalLight.position.z);
                },
                onValueChangeEnd: (e: any) => {
                    this.sceneView.directionalLight.position.set(e, this.sceneView.directionalLight.position.y, this.sceneView.directionalLight.position.z);
                }
            },
            {
                title: "y",
                className: "positionySlider",
                option: {
                    max: 3000,
                },
                value: this.sceneView.directionalLight.position.y,
                titleOffset: true,
                onValueChanging: (e: any) => {
                    this.sceneView.directionalLight.position.set(this.sceneView.directionalLight.position.x, e, this.sceneView.directionalLight.position.z);
                },
                onValueChangeEnd: (e: any) => {
                    this.sceneView.directionalLight.position.set(this.sceneView.directionalLight.position.x, e, this.sceneView.directionalLight.position.z);
                }
            },
            {
                title: "z",
                className: "positionzSlider",
                option: {
                    max: 2000,
                },
                value: this.sceneView.directionalLight.position.z,
                titleOffset: true,
                onValueChanging: (e: any) => {
                    this.sceneView.directionalLight.position.set(this.sceneView.directionalLight.position.x, this.sceneView.directionalLight.position.y, e);
                },
                onValueChangeEnd: (e: any) => {
                    this.sceneView.directionalLight.position.set(this.sceneView.directionalLight.position.x, this.sceneView.directionalLight.position.y, e);
                }
            }
        ];

        return {
            datas,
            removeAllLights: this.removeAllLights.bind(this),
            addAllLights: this.addAllLights.bind(this),
        };
    }

    public removeAllLights(): void {
        if (!this.existSceneView()) {
            return;
        }
        this.sceneView.lights.forEach((light: any) => {
            this.sceneView.normalScene.remove(light);
        });
    }

    public addAllLights(): void {
        if (!this.existSceneView()) {
            return;
        }
        this.removeAllLights();
        this.sceneView.lights.forEach((light: any) => {
            this.sceneView.normalScene.add(light);
        });
    }

    public selectedSingleRender(): void {
        if (!this.existSceneView()) {
            return;
        }

        if (this.sceneView.currentIntersected) {
            this.sceneView.renderMode = RenderMode.SingleRender;
            this.sceneView._clearSelectedMesh();
            this.sceneView.normalScene.remove(this.sceneView.removeSceneNode);
            this.sceneView.cahceAny.position = this.sceneView.currentIntersected.position.clone();
            this.sceneView.cahceAny.scale = this.sceneView.currentIntersected.scale.clone();
            this.sceneView.cahceAny.quaternion = this.sceneView.currentIntersected.quaternion.clone();
            this.sceneView.currentIntersected.position.set(0, 0, 0);
            this.sceneView.currentIntersected.setRotationFromQuaternion(new THREE.Quaternion());
            this.sceneView.currentIntersected.updateWorldMatrix();
            this.sceneView.singleRenderNode.add(this.sceneView.currentIntersected);
            this.sceneView.currentIntersected.material.needsUpdate = true;
            this.sceneView.currentIntersected.material.defines = undefined;
        }
    }

    public renderAll(): void {
        if (!this.existSceneView()) {
            return;
        }

        this.sceneView._clearSelectedMesh();
        this.sceneView.singleRenderNode.remove(this.sceneView.currentIntersected);
        let insMesh;
        if (this.sceneView.currentIntersected) {
            this.sceneView.currentIntersected.material.defines = this.sceneView.currentIntersected.material.defines || {};
            this.sceneView.currentIntersected.material.defines['INSTANCED'] = "";
            this.sceneView.currentIntersected.material.needsUpdate = true;
            if (this.sceneView.cahceAny && this.sceneView.cahceAny.position && this.sceneView.cahceAny.quaternion) {
                this.sceneView.currentIntersected.position.set(this.sceneView.cahceAny.position.x, this.sceneView.cahceAny.position.y, this.sceneView.cahceAny.position.z);
                this.sceneView.currentIntersected.setRotationFromQuaternion(this.sceneView.cahceAny.quaternion);
                this.sceneView.currentIntersected.updateWorldMatrix();
            }
            insMesh = this.sceneView.rayCastMapInsMesh.get(this.sceneView.currentIntersected.uuid);
        }
        if (insMesh) {
            insMesh.material.needsUpdate = true;
        }
        this.sceneView.normalScene.add(this.sceneView.currentSceneNode);
        this.sceneView.renderMode = RenderMode.AllRender;
        this.sceneView.cahceAny = new Object();
    }

    public selectedFlipx(): void {
        if (!this.existSceneView()) {
            return;
        }

        if (this.sceneView.currentIntersected &&
            this.sceneView.rayCastMapInstanceId &&
            this.sceneView.rayCastMapInsMesh) {
            const insMesh = this.sceneView.rayCastMapInsMesh.get(this.sceneView.currentIntersected.uuid);
            const tmpId: number = this.sceneView.rayCastMapInstanceId.get(this.sceneView.currentIntersected.uuid);
            if (insMesh && tmpId !== undefined) {
                const instanceScales = insMesh.geometry.getAttribute('instanceScale').array;
                const id = tmpId * 3;
                instanceScales[id] = -instanceScales[id];
                insMesh.geometry.addAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScales, 3));
                insMesh.material.needsUpdate = true;
            }
            this.sceneView.currentIntersected.scale.x = -this.sceneView.currentIntersected.scale.x;
            this.sceneView._clearSelectedMesh();
            if (this.sceneView.renderMode === RenderMode.AllRender) {
                this.sceneView._createSelectedMesh();
            }
        }
    }

    public selectedFlipz(): void {
        if (!this.existSceneView()) {
            return;
        }

        if (this.sceneView.currentIntersected) {
            const insMesh = this.sceneView.rayCastMapInsMesh.get(this.sceneView.currentIntersected.uuid);
            const tmpId = this.sceneView.rayCastMapInstanceId.get(this.sceneView.currentIntersected.uuid);
            if (insMesh && tmpId !== undefined) {
                const instanceScales = insMesh.geometry.getAttribute('instanceScale').array;
                const id = tmpId * 3;
                instanceScales[id + 2] = -instanceScales[id + 2];
                insMesh.geometry.addAttribute('instanceScale', new THREE.InstancedBufferAttribute(instanceScales, 3));
                insMesh.material.needsUpdate = true;
            }
            this.sceneView.currentIntersected.scale.z = -this.sceneView.currentIntersected.scale.z;
            this.sceneView._clearSelectedMesh();
            if (this.sceneView.renderMode === RenderMode.AllRender) {
                this.sceneView._createSelectedMesh();
            }
        }
    }

    public stopAnimation(): void {
        window.cancelAnimationFrame(this.sceneView._stop);
    }
}