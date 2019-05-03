import * as React from "react";
import "./style.css";
import { ResourceMessage } from "../../resource";
const FileSaver = require("filesaver.js-npm");

interface checkParam {
    checkName?: string;
    checkFileState?: boolean;
    checkError?: any;
    [propName: string]: any;
}

interface State {
    checkFile?: boolean;
    checkRoomName?: boolean;
    checkProductID?: boolean;
    checkEntryDoor?: boolean;
    checkPano?: boolean;
    checkHousePlan?: boolean,
    checkOutdoor?: boolean,
}

interface Props {
    sceneData?: any;
    [propName: string]: any;
}

class CheckList extends React.Component<checkParam, State> {
    constructor(props: checkParam) {
        super(props);
        this.state = {
            checkRoomName: false,
            checkProductID: false,
            checkEntryDoor: false,
            checkPano: false,
            checkHousePlan: false,
            checkOutdoor: false,
        }
    }

    _setErrorStatus(errorInfo: any) {
        const spanEle = document.getElementById(`${this.props.checkName}-error-status`);
        if (errorInfo && errorInfo.length) {
            spanEle.style.backgroundColor = "#ff0000";
        } else {
            spanEle.style.backgroundColor = "#ffffff";
        }
    }

    onDetailCheckChange(event: any) {
        if (!this.props.checkFileState) {
            return;
        }
        const target = event.target;
        const value = target.checked;
        switch (this.props.checkName) {
            case 'checkRoomName':
                this.setState({ checkRoomName: value });
                if (value) {
                    this._setErrorStatus(this.props.checkError);
                }
                break;
            case 'checkProductID':
                this.setState({ checkProductID: value });
                if (value) {
                    this._setErrorStatus(this.props.checkError);
                }
                break;
            case 'checkEntryDoor':
                this.setState({ checkEntryDoor: value });
                if (value) {
                    this._setErrorStatus(this.props.checkError);
                }
                break;
            case 'checkPano':
                this.setState({ checkPano: value });
                if (value) {
                    this._setErrorStatus(this.props.checkError);
                }
                break;
            case 'checkHousePlan':
                this.setState({ checkHousePlan: value });
                if (value) {
                    this._setErrorStatus(this.props.checkError);
                }
                break;
            case 'checkOutdoor':
                this.setState({ checkOutdoor: value });
                if (value) {
                    this._setErrorStatus(this.props.checkError);
                }
                break;
        }
    }

    render() {
        return (
            <div className={this.props.checkName}>
                <input type="checkbox" name='checkentity' className='checkentity' id={`checkentity_${this.props.checkName}`} disabled={true} onChange={(event) => this.onDetailCheckChange(event)} />
                <label htmlFor={`checkentity_${this.props.checkName}`}></label>
                <span className="check-name">{ResourceMessage[this.props.checkName]}</span>
                <span className="error-status" id={`${this.props.checkName}-error-status`}></span>
            </div>
        )
    }
}

export class CheckData extends React.Component<Props, State> {

    constructor(props: any) {
        super(props);
        this.state = {
            checkFile: false,
        };

    }

    handleCheckChange(event: any) {
        const target = event.target;
        const value = target.checked;
        this.setState({ checkFile: value });
        const checkRoomName: any = document.getElementById('checkentity_checkRoomName');
        const checkProductID: any = document.getElementById('checkentity_checkProductID');
        const checkEntryDoor: any = document.getElementById('checkentity_checkEntryDoor');
        const checkPano: any = document.getElementById('checkentity_checkPano');
        const checkHousePlan: any = document.getElementById('checkentity_checkHousePlan');
        const checkOutdoor: any = document.getElementById('checkentity_checkOutdoor');
        if (value) {
            if (checkRoomName && checkProductID &&
                checkEntryDoor && checkPano &&
                checkHousePlan && checkOutdoor) {
                checkRoomName.disabled = false;
                checkProductID.disabled = false;
                checkEntryDoor.disabled = false;
                checkPano.disabled = false;
                checkHousePlan.disabled = false;
                checkOutdoor.disabled = false;
            }
        } else {
            if (checkRoomName && checkProductID &&
                checkEntryDoor && checkPano &&
                checkHousePlan && checkOutdoor) {
                checkRoomName.disabled = true;
                checkRoomName.checked = false;
                checkProductID.disabled = true;
                checkProductID.checked = false;
                checkEntryDoor.disabled = true;
                checkEntryDoor.checked = false;
                checkPano.disabled = true;
                checkPano.checked = false;
                checkHousePlan.disabled = true;
                checkHousePlan.checked = false;
                checkOutdoor.disabled = true;
                checkOutdoor.checked = false;

                const checkRoomNameEle = document.getElementById(`checkRoomName-error-status`);
                checkRoomNameEle.style.backgroundColor = "#ffffff";
                const checkProductIDEle = document.getElementById(`checkProductID-error-status`);
                checkProductIDEle.style.backgroundColor = "#ffffff";
                const checkEntryDoorEle = document.getElementById(`checkEntryDoor-error-status`);
                checkEntryDoorEle.style.backgroundColor = "#ffffff";
                const checkPanoEle = document.getElementById(`checkPano-error-status`);
                checkPanoEle.style.backgroundColor = "#ffffff";
                const checkHousePlanEle = document.getElementById(`checkHousePlan-error-status`);
                checkHousePlanEle.style.backgroundColor = "#ffffff";
                const checkOutdoorEle = document.getElementById(`checkOutdoor-error-status`);
                checkOutdoorEle.style.backgroundColor = "#ffffff";
            }
        }
    }

    onDownloadErrorClick(errorData: any) {
        if (!this.state.checkFile) {
            return;
        }
        const tmp: any = { errorData };
        const blob: Blob = new Blob([JSON.stringify(tmp)], { type: `text/plain;charset=${document.characterSet}` });
        FileSaver.saveAs(blob, "error.json");
    }

    doDataCheck() {
        if (!this.props.sceneData) {
            return {};
        }
        const sceneData = this.props.sceneData;
        const errorRooms: Array<any> = [];
        const errorJids: Array<any> = [];
        //check room type
        const rooms = sceneData.scene.room;
        if (rooms) {
            rooms.forEach((room: any) => {
                if (!room.type || room.type.includes('none')
                    || !room.instanceid) {
                    errorRooms.push(room);
                }
            });
        }

        //check room furniture jid
        const furnitures = sceneData.furniture;
        if (furnitures) {
            furnitures.forEach((furniture: any) => {
                if (!furniture.jid || furniture.jid.length !== 36 || furniture.jid.includes('customURI') ||
                    furniture.jid.includes('generated') || furniture.jid.includes('customized')) {
                    errorJids.push(furniture);
                }
            });
        }

        //check room material jid 
        const materials = sceneData.material;
        if (materials) {
            materials.forEach((material: any) => {
                if (!material.jid || material.jid.length !== 36 || material.jid.includes('customURI') ||
                    material.jid.includes('generated') || material.jid.includes('customized')) {
                    if (material.jid !== 'local') {
                        errorJids.push(material);
                    }
                }
            });
        }

        //check extension: door, pano, minimap, outdoor
        const extension = sceneData.extension;
        if (!extension) {
            return {
                errorRooms,
                errorJids,
                errorExtensionInfo: ResourceMessage["noExtensionInfo"],
            }
        }
        const doors = extension.door;
        const outdoor = extension.outdoor;
        const pano = extension.pano;
        const mini_map = extension.mini_map;
        let errorDoorInfo: string;
        let errorOutDoorInfo: string;
        let errorPanoInfo: string;
        let errorMiniMap: string;
        let hasEntryDoor: boolean = false;
        let hasInteriorDoor: boolean = false;
        if (doors && doors.length) {
            for (let i = 0, len = doors.length; i < len; i++) {
                if (doors[i].type === 'entryDoor') {
                    hasEntryDoor = true;
                } else if (doors[i].type === 'interiorDoor') {
                    hasInteriorDoor = true;
                }
            }
            if (!hasEntryDoor && hasInteriorDoor) {
                errorDoorInfo = ResourceMessage["noEntryDoorInfo"];
            } else if (hasEntryDoor && !hasInteriorDoor) {
                errorDoorInfo = ResourceMessage["noInteriorDoorInfo"];
            } else if (!hasEntryDoor && !hasInteriorDoor) {
                errorDoorInfo = ResourceMessage["noEntryDoorAndInteriorDoorInfo"];
            }
        } else {
            errorDoorInfo = ResourceMessage["noDoorInfo"];
        }
        if (!outdoor || !outdoor.length) {
            errorOutDoorInfo = ResourceMessage["noOutDoorInfo"];
        }
        if (!pano) {
            errorPanoInfo = ResourceMessage["noPanoInfo"];
        }
        if (!mini_map || !mini_map.length) {
            errorMiniMap = ResourceMessage["noMiniMapInfo"];
        }
        return {
            errorRooms,
            errorJids,
            errorDoorInfo,
            errorOutDoorInfo,
            errorPanoInfo,
            errorMiniMap,
        };
    }

    render() {
        const totalError: any = this.doDataCheck();
        const checkArray: Array<string> = [
            "checkRoomName", "checkProductID",
            "checkEntryDoor", "checkPano",
            "checkHousePlan", "checkOutdoor"];
        const checkHtml: Array<any> = [];
        checkArray.forEach((thing, idx) => {
            let checkErrorInfo: any;
            switch (thing) {
                case "checkRoomName":
                    checkErrorInfo = totalError.errorRooms;
                    break;
                case "checkProductID":
                    checkErrorInfo = totalError.errorJids;
                    break;
                case "checkEntryDoor":
                    checkErrorInfo = totalError.errorExtensionInfo || totalError.errorDoorInfo;
                    break;
                case "checkPano":
                    checkErrorInfo = totalError.errorExtensionInfo || totalError.errorPanoInfo;
                    break;
                case "checkHousePlan":
                    checkErrorInfo = totalError.errorExtensionInfo || totalError.errorMiniMap;
                    break;
                case "checkOutdoor":
                    checkErrorInfo = totalError.errorExtensionInfo || totalError.errorOutDoorInfo;
                    break;
            }
            checkHtml.push(<CheckList key={idx} checkName={thing} checkFileState={this.state.checkFile} checkError={checkErrorInfo} />)
        })
        return (
            <div className="check-panel">
                <div className="check-head">
                    <input type="checkbox" name='checkentity' className='checkentity' id="checkentity-head" onChange={(event) => this.handleCheckChange(event)} />
                    <label htmlFor="checkentity-head"></label>
                    <span className="check-name">{ResourceMessage["checkDesignFile"]}</span>
                </div>
                <div className="check-list">
                    {checkHtml}
                </div>
                <div className="check-divider"></div>
                <div className="check-tail" onClick={() => this.onDownloadErrorClick(totalError)}>
                    <span>{ResourceMessage["downloadError"]}</span>
                </div>
            </div>
        )
    }
}