import * as THREE from "three";

export class FirstPersonCameraControls {
    private yawObject: THREE.Object3D;
    private pitchObject: THREE.Object3D;
    private isPaused: boolean;
    private movementX: number;
    private movementY: number;
    private doMouseMove: any;
    constructor(camera?: THREE.Camera) {
        camera && camera.rotation.set(0.0, 0.0, 0.0);
        const pitchObject: THREE.Object3D = new THREE.Object3D();
        camera && pitchObject.add(camera);
        const yawObject: THREE.Object3D = new THREE.Object3D();
        yawObject.add(pitchObject);

        this.yawObject = yawObject;
        this.pitchObject = pitchObject;
        this.isPaused = true;

        this.movementX = 0.0;
        this.movementY = 0.0;
        const self = this;
        this.doMouseMove = function (event: any): void {
            if (self.isPaused) {
                return;
            }
            self.movementX = event.movementX || event.mozMovementX || 0;
            self.movementY = event.movementY || event.mozMovementY || 0;
            self.yawObject.rotation.y -= self.movementX * 0.002;
            self.pitchObject.rotation.x -= self.movementY * 0.002;
            self.pitchObject.rotation.x = Math.max(- Math.PI / 2, Math.min(Math.PI / 2, self.pitchObject.rotation.x));
        }
        document.addEventListener('mousemove', self.doMouseMove, false);
    }

    public getPausedState(): boolean {
        return this.isPaused;
    }

    public setPausedState(isPaused: boolean) {
        this.isPaused = isPaused;
    }

    public getObject(): THREE.Object3D {
        return this.yawObject;
    }

    public getYawObject(): THREE.Object3D {
        return this.yawObject;
    }

    public getPitchObject(): THREE.Object3D {
        return this.pitchObject;
    }

    public getDirection(v?: any): THREE.Vector3 {
        const te = this.pitchObject.matrixWorld.elements;
        if (!v || !v.set) {
            v = new THREE.Vector3();
        }
        v.set(te[8], te[9], te[10]).negate();
        return v;
    }

    public getUpVector(v?: any): THREE.Vector3 {
        const te = this.pitchObject.matrixWorld.elements;
        if (!v || !v.set) {
            v = new THREE.Vector3();
        }
        v.set(te[4], te[5], te[6]);
        return v;
    }

    public getRightVector(v?: any): THREE.Vector3 {
        const te = this.pitchObject.matrixWorld.elements;
        if (!v || !v.set) {
            v = new THREE.Vector3();
        }
        v.set(te[0], te[1], te[2]);
        return v;
    }

    public clear(): void {
        this.yawObject = undefined;
        this.pitchObject = undefined;
        this.isPaused = true;
        this.movementX = 0.0;
        this.movementY = 0.0;
        document.removeEventListener('mousemove', this.doMouseMove, false);
        this.doMouseMove = undefined;
    }
}