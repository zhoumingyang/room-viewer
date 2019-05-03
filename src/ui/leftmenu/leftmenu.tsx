import * as React from "react";
import * as ReactDOM from "react-dom";
import * as THREE from "three";
import { ResourceMessage } from "../../resource";
import { SingleRender } from "../../singlerender";
import "./style.css";

interface Props {
    [propName: string]: any;
}

interface State {
    [propName: string]: any;
}

interface ShowOption {
    [propName: string]: any;
}

class LeftMenu extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
    }

    renderSingle() {
        if (this.props && this.props.selectedSingleRender) {
            this.props.selectedSingleRender();
        }
        LeftMenuShow.destory();
    }

    renderAll() {
        if (this.props && this.props.renderAll) {
            this.props.renderAll();
        }
        LeftMenuShow.destory();
    }

    flipx() {
        if (this.props && this.props.selectedFlipx) {
            this.props.selectedFlipx();
        }
    }

    flipz() {
        if (this.props && this.props.selectedFlipz) {
            this.props.selectedFlipz();
        }
    }

    renderFurniture() {
        if (this.props && this.props.selected3DObject) {
            const singleRender: SingleRender = new SingleRender(this.props.selected3DObject);
        }
        LeftMenuShow.destory();
    }

    render() {
        const divider = (<div className='rightmenu_divider'></div>);
        let item = (
            <div>
                <span className="render_single" onClick={() => this.renderSingle()}>{ResourceMessage["renderSingle"]}</span>
                {divider}
                <span className="render_flipx" onClick={() => this.flipx()}>{ResourceMessage["renderFlipx"]}</span>
                {divider}
                <span className="render_flipz" onClick={() => this.flipz()}>{ResourceMessage["renderFlipz"]}</span>
            </div>
        );
        if (this.props.renderMode && this.props.renderMode === 'renderSingle') {
            item = (
                <div>
                    <span className="render_single" onClick={() => this.renderAll()}>{ResourceMessage["renderAll"]}</span>
                    {divider}
                    <span className="render_single" onClick={() => this.renderFurniture()}>{ResourceMessage["renderFurniture"]}</span>
                    {divider}
                    <span className="render_flipx" onClick={() => this.flipx()}>{ResourceMessage["renderFlipx"]}</span>
                    {divider}
                    <span className="render_flipz" onClick={() => this.flipz()}>{ResourceMessage["renderFlipz"]}</span>
                </div>
            );
        }
        return (
            <div className='rightmenu_panel'>
                {item}
            </div>)
    }
}

export class LeftMenuShow implements ShowOption {
    static instance: any;
    static create(position?: THREE.Vector2, datas?: any): void {
        const container: any = document.getElementsByClassName('right-menu-container')[0];
        if (!container) {
            return;
        }
        if (LeftMenuShow.instance) {
            LeftMenuShow.destory();
        }
        let offset: number = 15;
        let x: number = position.x + offset;
        let y: number = position.y - offset;
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
        LeftMenuShow.instance = ReactDOM.render(<LeftMenu
            selectedSingleRender={datas.selectedSingleRender}
            renderAll={datas.renderAll}
            selectedFlipx={datas.selectedFlipx}
            selectedFlipz={datas.selectedFlipz}
            renderMode={datas.renderMode}
            stopAnimation={datas.stopAnimation}
            selected3DObject={datas.selected3DObject} />, container);
    }

    static destory() {
        if (!LeftMenuShow.instance) {
            return;
        }
        const element = document.getElementsByClassName('right-menu-container')[0];
        if (element) {
            ReactDOM.unmountComponentAtNode(element);
            LeftMenuShow.instance = undefined;
        }
    }
}