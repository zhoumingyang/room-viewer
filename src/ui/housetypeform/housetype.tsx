import * as React from "react";
import "./style.css";
import { ResourceMessage, RoomTypeArray } from "../../resource"

export interface KeyValue {
    skey?: string;
    value?: number;
}

export interface HouseTypeInfo {
    roomNumber?: KeyValue;
    totalArea?: KeyValue;
    doorNumber?: KeyValue;
    windowNumber?: KeyValue;
    roomArea?: Array<KeyValue>;
    furnitureNumber?: KeyValue;
};

class DetailInfo extends React.Component<KeyValue, {}> {
    render() {
        let isRoomInfo: boolean = false;
        for (let i = 0, len = RoomTypeArray.length; i < len; i++) {
            if (RoomTypeArray[i] === this.props.skey) {
                isRoomInfo = true;
                break;
            }
        }
        return (
            <div key={this.props.skey} className={this.props.skey}>
                <span className={`detail_title`}>{isRoomInfo ? `${ResourceMessage[this.props.skey]}面积:` : `${ResourceMessage[this.props.skey]}:`}</span>
                <span className={`detail_value`}>{this.props.value.toFixed(2)}</span>
            </div>
        )
    }
}

export class HouseType extends React.Component<HouseTypeInfo, {}> {
    render() {
        const roomNumber: KeyValue = (this.props && this.props.roomNumber) ? this.props.roomNumber : { skey: 'roomNumber', value: 0 };
        const totalArea: KeyValue = (this.props && this.props.totalArea) ? this.props.totalArea : { skey: 'totalArea', value: 0 };
        const doorNumber: KeyValue = (this.props && this.props.doorNumber) ? this.props.doorNumber : { skey: 'doorNumber', value: 0 };
        const windowNumber: KeyValue = (this.props && this.props.windowNumber) ? this.props.windowNumber : { skey: 'windowNumber', value: 0 };
        const basicRoomInfos: Array<KeyValue> = [roomNumber, totalArea, doorNumber, windowNumber];
        const roomAreaInfos: Array<KeyValue> = (this.props && this.props.roomArea) ? this.props.roomArea : [];
        const allInfos = basicRoomInfos.concat(roomAreaInfos);
        const dividerHtml = <div className="panel-divider"></div>;
        const infoHtml: Array<any> = [];
        allInfos.forEach((info, idx) => {
            infoHtml.push(<DetailInfo skey={info.skey} value={info.value} />);
            if (idx !== allInfos.length - 1) {
                infoHtml.push(<div key={idx.toString()} className="panel-divider"></div>);
            }
        });
        const furnitureNumber: KeyValue = (this.props && this.props.furnitureNumber) ? this.props.furnitureNumber : { skey: 'furnitureNumber', value: 0 };
        return (
            <div className="whole-house-show-panel">
                <div className="housetype-panel">
                    <div className="housetype-head">户型信息</div>
                    {dividerHtml}
                    <div className="housetype-content">
                        {infoHtml}
                    </div>
                </div>
                {dividerHtml}
                <div className="furniturenumber-panel">
                    <div className="furniturenumber-head">家具信息</div>
                    {dividerHtml}
                    <div className="furniturenumber-content">
                        <div className={furnitureNumber.skey}>
                            <span className={`detail_title`}>家具数量:</span>
                            <span className={`detail_value`}>{furnitureNumber.value.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}