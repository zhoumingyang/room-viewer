import * as THREE from "three";

let stackptr: number = 0;
let buildnodes: any[] = [];
let leftWorkLists: any[] = [];
let rightWorkLists: any[] = [];
let parentList: any[] = [];
let bestSplit: number = null;
let bestAxis: any = null;
let rightBranchCounter: any = 0;
let leftBranchCounter: any = 0;
let leftWorkCounter: number = 0;
let rightWorkCounter: number = 0;
let nullCodePathReached: boolean = false;
let currentMinCorner: THREE.Vector3 = new THREE.Vector3();
let currentMaxCorner: THREE.Vector3 = new THREE.Vector3();
let testMinCorner: THREE.Vector3 = new THREE.Vector3();
let testMaxCorner: THREE.Vector3 = new THREE.Vector3();
let testCentroid: THREE.Vector3 = new THREE.Vector3();
let currentCentroid: THREE.Vector3 = new THREE.Vector3();
let centroidAverage: THREE.Vector3 = new THREE.Vector3();
let LBottomCorner: THREE.Vector3 = new THREE.Vector3();
let LTopCorner: THREE.Vector3 = new THREE.Vector3();
let RBottomCorner: THREE.Vector3 = new THREE.Vector3();
let RTopCorner: THREE.Vector3 = new THREE.Vector3();
let k, value, side1, side2, side3, minCost, testSplit: number;
let axis, countLeft, countRight;
let lside1, lside2, lside3, rside1, rside2, rside3;
let surfaceLeft, surfaceRight, totalCost;
let currentList;

export class BVH_FlatNode {
    public idSelf: number;
    public idLeftChild: number;
    public idRightChild: number;
    public idParent: number;
    public minCorner: THREE.Vector3;
    public maxCorner: THREE.Vector3;
    constructor() {
        this.idSelf = 0;
        this.idLeftChild = 0;
        this.idRightChild = 0;
        this.idParent = 0;
        this.minCorner = new THREE.Vector3();
        this.maxCorner = new THREE.Vector3();
    }
}

export function BVH_Create_Node(workList: any[] | Uint32Array, aabb_array: any[] | Float32Array, idParent: number, isLeftBranch: boolean) {
    currentMinCorner.set(Infinity, Infinity, Infinity);
    currentMaxCorner.set(-Infinity, -Infinity, -Infinity);
    if (workList.length < 1) {
        return;
    }
    if (workList.length === 1) {
        k = workList[0];
        let flatLeafNode = new BVH_FlatNode();
        flatLeafNode.idSelf = buildnodes.length;
        flatLeafNode.idLeftChild = -k - 1; // a negative value signifies leaf node - used as triangle id
        flatLeafNode.idRightChild = -1;
        flatLeafNode.idParent = idParent;
        flatLeafNode.minCorner.set(aabb_array[9 * k + 0], aabb_array[9 * k + 1], aabb_array[9 * k + 2]);
        flatLeafNode.maxCorner.set(aabb_array[9 * k + 3], aabb_array[9 * k + 4], aabb_array[9 * k + 5]);
        buildnodes.push(flatLeafNode);
        if (!isLeftBranch)
            buildnodes[idParent].idRightChild = flatLeafNode.idSelf;
        return;
    }

    if (workList.length === 2) {
        for (let i = 0, len = workList.length; i < len; i++) {
            k = workList[i];
            testMinCorner.set(aabb_array[9 * k + 0], aabb_array[9 * k + 1], aabb_array[9 * k + 2]);
            testMaxCorner.set(aabb_array[9 * k + 3], aabb_array[9 * k + 4], aabb_array[9 * k + 5]);
            currentMinCorner.min(testMinCorner);
            currentMaxCorner.max(testMaxCorner);
        }

        let flatnode0 = new BVH_FlatNode();
        flatnode0.idSelf = buildnodes.length;
        flatnode0.idLeftChild = buildnodes.length + 1;
        flatnode0.idRightChild = buildnodes.length + 2;
        flatnode0.idParent = idParent;
        flatnode0.minCorner.copy(currentMinCorner);
        flatnode0.maxCorner.copy(currentMaxCorner);
        buildnodes.push(flatnode0);
        if (!isLeftBranch)
            buildnodes[idParent].idRightChild = flatnode0.idSelf;
        k = workList[0];

        let flatnode1 = new BVH_FlatNode();
        flatnode1.idSelf = buildnodes.length;
        flatnode1.idLeftChild = -k - 1;
        flatnode1.idRightChild = -1;
        flatnode1.idParent = flatnode0.idSelf;
        flatnode1.minCorner.set(aabb_array[9 * k + 0], aabb_array[9 * k + 1], aabb_array[9 * k + 2]);
        flatnode1.maxCorner.set(aabb_array[9 * k + 3], aabb_array[9 * k + 4], aabb_array[9 * k + 5]);
        buildnodes.push(flatnode1);
        k = workList[1];

        let flatnode2 = new BVH_FlatNode();
        flatnode2.idSelf = buildnodes.length;
        flatnode2.idLeftChild = -k - 1;
        flatnode2.idRightChild = -1;
        flatnode2.idParent = flatnode0.idSelf;
        flatnode2.minCorner.set(aabb_array[9 * k + 0], aabb_array[9 * k + 1], aabb_array[9 * k + 2]);
        flatnode2.maxCorner.set(aabb_array[9 * k + 3], aabb_array[9 * k + 4], aabb_array[9 * k + 5]);
        buildnodes.push(flatnode2);
        return;
    }

    if (workList.length > 2) {
        centroidAverage.set(0, 0, 0);

        for (let i = 0, len = workList.length; i < len; i++) {
            k = workList[i];
            testMinCorner.set(aabb_array[9 * k + 0], aabb_array[9 * k + 1], aabb_array[9 * k + 2]);
            testMaxCorner.set(aabb_array[9 * k + 3], aabb_array[9 * k + 4], aabb_array[9 * k + 5]);
            currentCentroid.set(aabb_array[9 * k + 6], aabb_array[9 * k + 7], aabb_array[9 * k + 8]);
            currentMinCorner.min(testMinCorner);
            currentMaxCorner.max(testMaxCorner);
            centroidAverage.add(currentCentroid);
        }
        centroidAverage.divideScalar(workList.length);

        let flatnode = new BVH_FlatNode();
        flatnode.idSelf = buildnodes.length;
        flatnode.idLeftChild = buildnodes.length + 1; // traverse down the left branches first
        flatnode.idRightChild = 0;
        flatnode.idParent = idParent;
        flatnode.minCorner.copy(currentMinCorner);
        flatnode.maxCorner.copy(currentMaxCorner);
        buildnodes.push(flatnode);

        if (!isLeftBranch)
            buildnodes[idParent].idRightChild = flatnode.idSelf;


        side1 = currentMaxCorner.x - currentMinCorner.x; // length bbox along X-axis
        side2 = currentMaxCorner.y - currentMinCorner.y; // length bbox along Y-axis
        side3 = currentMaxCorner.z - currentMinCorner.z; // length bbox along Z-axis

        minCost = workList.length * (side1 * side2 + side2 * side3 + side3 * side1);

        bestSplit = null;
        bestAxis = null;
        for (let j = 0; j < 3; j++) {
            axis = j;
            LBottomCorner.set(Infinity, Infinity, Infinity);
            LTopCorner.set(-Infinity, -Infinity, -Infinity);
            RBottomCorner.set(Infinity, Infinity, Infinity);
            RTopCorner.set(-Infinity, -Infinity, -Infinity);
            countLeft = 0;
            countRight = 0;
            for (let i = 0, len = workList.length; i < len; i++) {
                k = workList[i];
                testMinCorner.set(aabb_array[9 * k + 0], aabb_array[9 * k + 1], aabb_array[9 * k + 2]);
                testMaxCorner.set(aabb_array[9 * k + 3], aabb_array[9 * k + 4], aabb_array[9 * k + 5]);
                testCentroid.set(aabb_array[9 * k + 6], aabb_array[9 * k + 7], aabb_array[9 * k + 8]);
                if (axis == 0) { // X-axis
                    value = testCentroid.x;
                    testSplit = centroidAverage.x;
                }
                else if (axis == 1) { // Y-axis
                    value = testCentroid.y;
                    testSplit = centroidAverage.y;
                }
                else { // Z-axis
                    value = testCentroid.z;
                    testSplit = centroidAverage.z;
                }

                if (value < testSplit) {
                    LBottomCorner.min(testMinCorner);
                    LTopCorner.max(testMaxCorner);
                    countLeft++;
                } else {
                    RBottomCorner.min(testMinCorner);
                    RTopCorner.max(testMaxCorner);
                    countRight++;
                }
            }

            if (countLeft < 1 || countRight < 1) continue;

            lside1 = LTopCorner.x - LBottomCorner.x;
            lside2 = LTopCorner.y - LBottomCorner.y;
            lside3 = LTopCorner.z - LBottomCorner.z;

            rside1 = RTopCorner.x - RBottomCorner.x;
            rside2 = RTopCorner.y - RBottomCorner.y;
            rside3 = RTopCorner.z - RBottomCorner.z;

            surfaceLeft = (lside1 * lside2) + (lside2 * lside3) + (lside3 * lside1);
            surfaceRight = (rside1 * rside2) + (rside2 * rside3) + (rside3 * rside1);
            totalCost = (surfaceLeft * countLeft) + (surfaceRight * countRight);
            if (totalCost < minCost) {
                minCost = totalCost;
                bestSplit = testSplit;
                bestAxis = axis;
            }
        }
        if (bestSplit == null) {
            nullCodePathReached = true;
        }
    }

    leftWorkCounter = 0;
    rightWorkCounter = 0;

    if (nullCodePathReached) {
        nullCodePathReached = false;

        for (let i = 0, len = workList.length; i < len; i++) {
            i % 2 == 0 ? leftWorkCounter++ : rightWorkCounter++;
        }
        leftWorkLists[stackptr] = new Uint32Array(leftWorkCounter);
        rightWorkLists[stackptr] = new Uint32Array(rightWorkCounter);

        leftWorkCounter = 0;
        rightWorkCounter = 0;
        for (let i = 0, len = workList.length; i < len; i++) {
            k = workList[i];
            if (i % 2 == 0) {
                leftWorkLists[stackptr][leftWorkCounter] = k;
                leftWorkCounter++;
            } else {
                rightWorkLists[stackptr][rightWorkCounter] = k;
                rightWorkCounter++;
            }
        }
        return;
    }

    leftWorkCounter = 0;
    rightWorkCounter = 0;

    for (let i = 0, len = workList.length; i < len; i++) {
        k = workList[i];
        testCentroid.set(aabb_array[9 * k + 6], aabb_array[9 * k + 7], aabb_array[9 * k + 8]);
        if (bestAxis == 0) value = testCentroid.x; // X-axis
        else if (bestAxis == 1) value = testCentroid.y; // Y-axis
        else value = testCentroid.z; // Z-axis
        if (value < bestSplit) {
            leftWorkCounter++;
        } else {
            rightWorkCounter++;
        }
    }
    leftWorkLists[stackptr] = new Uint32Array(leftWorkCounter);
    rightWorkLists[stackptr] = new Uint32Array(rightWorkCounter);
    leftWorkCounter = 0;
    rightWorkCounter = 0;

    for (let i = 0, len = workList.length; i < len; i++) {
        k = workList[i];
        testCentroid.set(aabb_array[9 * k + 6], aabb_array[9 * k + 7], aabb_array[9 * k + 8]);
        if (bestAxis == 0) value = testCentroid.x; // X-axis
        else if (bestAxis == 1) value = testCentroid.y; // Y-axis
        else value = testCentroid.z; // Z-axis
        if (value < bestSplit) {
            leftWorkLists[stackptr][leftWorkCounter] = k;
            leftWorkCounter++;
        } else {
            rightWorkLists[stackptr][rightWorkCounter] = k;
            rightWorkCounter++;
        }
    }
}

export function BVH_Build_Iterative(workList: any[] | Uint32Array, aabb_array: any[] | Float32Array): any[] {
    currentList = workList;
    buildnodes = [];
    leftWorkLists = [];
    rightWorkLists = [];
    parentList = [];

    stackptr = 0;
    nullCodePathReached = false;
    parentList.push(buildnodes.length - 1);
    BVH_Create_Node(currentList, aabb_array, -1, true);

    while (stackptr > -1) {
        currentList = leftWorkLists[stackptr];
        leftWorkLists[stackptr] = null;
        if (currentList != undefined) {
            stackptr++;
            parentList.push(buildnodes.length - 1);
            BVH_Create_Node(currentList, aabb_array, buildnodes.length - 1, true);
            leftBranchCounter++;
        } else {
            currentList = rightWorkLists[stackptr];
            if (currentList != undefined) {
                stackptr++;
                BVH_Create_Node(currentList, aabb_array, parentList.pop(), false);
                rightWorkLists[stackptr - 1] = null;
                rightBranchCounter++;
            }
            else {
                stackptr--;
            }
        }
    }
    return buildnodes;
}