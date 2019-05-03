import * as React from "react";
import "./style.css";
import { ResourceMessage } from "../../resource";

export interface FurnitureMsg {
    jid?: string;
    name?: string;
    type?: string;
    room?: string;
}

export interface Info {
    infoName?: string;
    infoValue?: string;
}

const config: any = {
    "jid": "产品ID:",
    "name": "名称: ",
    "type": "类型: ",
    "room": "房间: "
};

class DetailInfo extends React.Component<Info, {}> {
    render() {
        return (
            <div className={`selected-${this.props.infoName}`}>
                <span className="titleName">{config[this.props.infoName]}</span>
                <span className="infoValue">{this.props.infoName === "room" ? ResourceMessage[this.props.infoValue] : this.props.infoValue}</span>
            </div>)
    }
}

export class FurnitureInfo extends React.Component<FurnitureMsg, {}> {
    render() {
        let infoHeader = <div className="selected-furniture-header">选择物品信息</div>;
        if (!this.props) {
            return infoHeader
        }
        let jidInfo = this.props.jid ? <DetailInfo infoName={"jid"} infoValue={this.props.jid} /> : undefined;
        let nameInfo = this.props.name ? <DetailInfo infoName={"name"} infoValue={this.props.name} /> : undefined;
        let typeInfo = this.props.type ? <DetailInfo infoName={"type"} infoValue={this.props.type} /> : undefined;
        let roomInfo = this.props.room ? <DetailInfo infoName={"room"} infoValue={this.props.room} /> : undefined;

        return (
            <div className="selected-furniture-panel">
                {infoHeader}
                <div className="selected-furniture-content">
                    {jidInfo}
                    {nameInfo}
                    {typeInfo}
                    {roomInfo}
                </div>
            </div>)
    }
}