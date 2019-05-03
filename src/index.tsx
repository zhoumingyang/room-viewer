import * as React from "react";
import * as ReactDOM from "react-dom";
import { ViewerScene } from "./viewer3d";
import { fpsDomRender } from "./ui/fps/fps";
import { FileButton } from "./ui/filebutton/fileSelectButton";
import { DownLoadButton } from "./ui/downloadbutton/downloadbutton";
import { FurnitureInfo } from "./ui/selectedfurnitureform/furnitureinfo";
import { HouseType } from "./ui/housetypeform/housetype";
import { CheckData } from "./ui/scenecheck/checkscenedata";
import { ScenePlane3D } from "./ui/sceneOperation/sceneplane";
import { ArrowButton } from "./ui/arrowbutton/arrowbutton";
import { Util } from "./util";
import { Handler } from "./handler";
const FILENAME: any = {
    TXT: '.txt',
    JSON: '.json',
};

let fileCache: any = undefined;
const stats = fpsDomRender();
let curScene: ViewerScene = new ViewerScene(stats);
let designData: any;
let sceneHandler: Handler;

const createPreInfoUI = (designData: any): void => {
    if (!designData) {
        return;
    }
    ReactDOM.render(<DownLoadButton sceneData={designData} />, document.getElementsByClassName('down-button-container')[0]);
    ReactDOM.render(<CheckData sceneData={designData} />, document.getElementsByClassName('datacheck-container')[0]);
    const roomMsg: any = Util.parseSceneRoomMsg(designData);
    if (roomMsg) {
        const tmpHtml = <HouseType
            roomNumber={roomMsg.roomNumber}
            totalArea={roomMsg.totalArea}
            doorNumber={roomMsg.doorNumber}
            windowNumber={roomMsg.windowNumber}
            roomArea={roomMsg.roomArea}
            furnitureNumber={roomMsg.furnitureNumber}
        />
        ReactDOM.render(tmpHtml, document.getElementsByClassName('housetype-info-container')[0]);
    }
}

const clearScene = (): void => {
    if (curScene) {
        curScene.clearScene();
        curScene = undefined;
    }
}

const loadScene = (designData: any, index?: number): void => {
    if (!designData) {
        return;
    }
    createPreInfoUI(designData);
    if (index === 0 || !index) {
        curScene.drawScene([designData]);
    }
    curScene.setCacheSceneData(designData);
    const sceneParam: any = sceneHandler.getRenderParams();
    sceneParam.designId = designData.uid;
    const lightDatas: any = sceneHandler.getLightParams();
    ReactDOM.render(<ScenePlane3D sceneParam={sceneParam}
        lightDatas={lightDatas.datas}
        lightsControl={
            {
                removeAll: lightDatas.removeAllLights,
                addAll: lightDatas.addAllLights,
            }
        } />,
        document.getElementsByClassName('plane3D-container')[0]);
}

function handleFileSelect(evt: any): void {
    let files = evt.target.files;
    if (files.length > 0) {
        const key = files[0].lastModified + files[0].name;
        if (fileCache === key) {
            return;
        }
        fileCache = key;
        let reader = new FileReader();
        reader.onload = (event: any) => {
            const target = event.target;
            let result: any = target.result;
            clearScene();
            curScene = new ViewerScene(stats);
            sceneHandler = new Handler(curScene);
            curScene.registerHander(sceneHandler);
            if (files[0].name.includes(FILENAME.TXT)) {
                const repalce = sceneHandler.getReplaceParams();
                ReactDOM.render(<ArrowButton
                    leftArrowClick={repalce.leftArrowClick}
                    rightArrowClick={repalce.rightArrowClick} />,
                    document.getElementsByClassName('arrow-button-container')[0]);
                const addressArray: string[] = [];
                let t: number = result.indexOf(FILENAME.JSON);
                if (t === -1) {
                    return;
                }
                while (t > 0) {
                    const tmpAddress: string = result.slice(0, t + FILENAME.JSON.length);
                    addressArray.push(tmpAddress);
                    result = result.slice(t + FILENAME.JSON.length + 1);
                    t = result.indexOf(FILENAME.JSON);
                }
                const tasks: any[] = [];
                addressArray.forEach((address: string) => {
                    const task = fetch(address).then((response: any) => {
                        return response.json();
                    }).then((jsonData) => {
                        return jsonData;
                    });
                    tasks.push(task);
                });
                if (tasks.length) {
                    Promise.all(tasks).then((sceneDatas: any): void => {
                        for (let i = 0, len = sceneDatas.length; i < len; i++) {
                            loadScene(sceneDatas[i], i);
                        }
                    });
                }
                return;
            }
            designData = JSON.parse(result);
            loadScene(designData);
        }
        reader.readAsText(files[0]);
    }
}

const appRun = (): void => {
    ReactDOM.render(<FileButton />, document.getElementsByClassName('file-button-container')[0]);
    ReactDOM.render(<DownLoadButton />, document.getElementsByClassName('down-button-container')[0]);
    ReactDOM.render(<FurnitureInfo />, document.getElementsByClassName('furniture-info-container')[0]);
    ReactDOM.render(<FurnitureInfo />, document.getElementsByClassName('furniture-info-container')[0]);
    ReactDOM.render(<HouseType />, document.getElementsByClassName('housetype-info-container')[0]);
    ReactDOM.render(<CheckData />, document.getElementsByClassName('datacheck-container')[0]);
    ReactDOM.render(<ArrowButton />, document.getElementsByClassName('arrow-button-container')[0]);
    document.getElementById('file-button').addEventListener('change', handleFileSelect, false);
}

appRun();