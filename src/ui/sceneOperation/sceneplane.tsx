import * as React from "react";
import "./style.css";
import { Slider } from "../common/slider/slider";
import { ResourceMessage } from "../../resource";

interface Props {
    [propName: string]: any;
}

interface State {
    [propName: string]: any;
}

class Toggle extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            perspective: true,
            overlook: false,
        };
    }

    _perspectiveClick() {
        const convertToPerspectiveCamera = () => {
            if (this.props.sceneParam && this.props.sceneParam.changeToPerspectiveCamera) {
                this.props.sceneParam.changeToPerspectiveCamera();
            }
        }
        if (this.props.sceneParam && this.props.sceneParam.changeSceneRotation) {
            this.props.sceneParam.changeSceneRotation(0);
        }
        if (this.state.perspective) {
            this.setState({ overlook: false });
            convertToPerspectiveCamera();
            return;
        }
        this.setState({ perspective: true, overlook: false });
        convertToPerspectiveCamera();
        this.props.setActiveName(false);
    }

    _overlookClick() {
        const convertToOrthographicCamera = () => {
            if (this.props.sceneParam && this.props.sceneParam.changeToOrthographicCamera) {
                this.props.sceneParam.changeToOrthographicCamera();
            }
        }
        this.setState({ overlook: true, perspective: false });
        convertToOrthographicCamera();
        this.props.setActiveName(true);
    }

    render() {
        return (
            <span className="radioBtn" style={{ border: "0px" }}>
                <ul className="radioBtn-detail">
                    <li id="normal-perspective" className={`normal-perspective${this.state.perspective ? '-active' : ''}`} onClick={() => { this._perspectiveClick() }}>
                        <span className="normal-perspective-btn">{ResourceMessage['noramlPerspective']}</span>
                    </li>
                    <li id="orthogonal-overlook" className={`orthogonal-overlook${this.state.overlook ? '-active' : ''}`} onClick={() => { this._overlookClick() }}>
                        <span className="orthogonal-overlook-btn">{ResourceMessage['orthographicOverlook']}</span>
                    </li>
                </ul>
            </span>)
    }
}

class LightButton extends React.Component<Props, State> {
    render() {
        return (
            <div className="light-Button">
                <span id="first" className={this.props.firstButton} onClick={() => this.props.firstClick()}>{ResourceMessage[this.props.firstName]}</span>
                <span id="second" className={this.props.secondButton} onClick={() => this.props.secondClick()}>{ResourceMessage[this.props.secondName]}</span>
            </div>
        )
    }
}

export class ScenePlane3D extends React.Component<Props, State> {
    private _overlookSliderName: string;
    constructor(props: Props) {
        super(props);
        this.state = {
            sceneData: this.props.sceneParam.scene,
            ligths: this.props.sceneParam.lights,
            sceneRender: this.props.sceneParam.sceneRender,
            overlookSlider: false,
            reset: false,
        };
        this._overlookSliderName = 'overlook-scene-slider-hide';
    }

    _snapShot(): void {
        if (this.props.sceneParam && this.props.sceneParam.sceneRender) {
            const captureImage: any = this.props.sceneParam.sceneRender.domElement.toDataURL("image/jpg", 1.0);
            const btn = document.getElementsByClassName('screenshot-btn')[0];
            const imageName = this.props.sceneParam && this.props.sceneParam.designId ? `${this.props.sceneParam.designId}.jpg` : 'room.jpg';
            btn.setAttribute('download', imageName);
            btn.setAttribute('href', captureImage);
        }
    }

    _removeAllLights(): void {
        if (this.props.lightsControl && this.props.lightsControl.removeAll) {
            this.props.lightsControl.removeAll();
        }
    }

    _addAllLights(): void {
        if (this.props.lightsControl && this.props.lightsControl.addAll) {
            this.props.lightsControl.addAll();
        }
    }

    _setOverlookSliderName(overlook: boolean): void {
        let className: string = "overlook-scene-slider";
        className = overlook ? className : `${className}-hide`;
        this._overlookSliderName = className;
        this.setState({ overlookSlider: overlook });
    }

    _resetScene(): void {
        if (this.props.sceneParam && this.props.sceneParam.reset) {
            this.props.sceneParam.reset();
        }
        const perElem = document.getElementById('normal-perspective');
        const ortElem = document.getElementById('orthogonal-overlook');
        if (perElem) {
            perElem.className = "normal-perspective-active";
        }
        if (ortElem) {
            ortElem.className = "orthogonal-overlook";
        }
        this.setState({ reset: true });
    }

    render(): JSX.Element {
        let datas: Array<any> = this.props.lightDatas;
        const htmls: Array<any> = [];
        datas.forEach((data: any) => {
            htmls.push(<Slider data={data} />)
        });
        return (
            <div className="plane3D">
                <div className="plane3D-header">{ResourceMessage['3Dset']}</div>
                <div className="planeDivider"></div>
                <div className="plane3D-content">
                    <div className="plane3D-camer">
                        <div className="plane3D-camer-header">{ResourceMessage['camera']}</div>
                        <div className="planeDivider"></div>
                        <div className="plane3D-camer-content">
                            <Toggle sceneParam={this.props.sceneParam} setActiveName={this._setOverlookSliderName.bind(this)} />
                            <a className="screenshot-btn" onClick={() => { this._snapShot() }}>{ResourceMessage['snapShot']}</a>
                        </div>
                        <Slider data={this.props.sceneParam.sliderData} />
                        <Slider data={this.props.sceneParam.sliderFrustum} />
                    </div>
                    <div className="planeDivider"></div>
                    <div className="plane3D-light">
                        <div className="plane3D-light-header">{ResourceMessage['lightSource']}</div>
                        <div className="planeDivider"></div>
                        <div className="plane3D-light-content">
                            {htmls}
                        </div>
                    </div>
                    <div className="planeDivider"></div>
                    <div className="light-Button-plane">
                        <LightButton firstButton={'light-close'}
                            secondButton={'light-open'}
                            firstName={'closeAllLights'}
                            secondName={'openAllLights'}
                            firstClick={() => { this._removeAllLights(); }}
                            secondClick={() => { this._addAllLights(); }}
                        />
                        <div className="planeDivider"></div>
                        <LightButton firstButton={'pointlight-add'}
                            secondButton={'light-reset'}
                            firstName={'addPointLight'}
                            secondName={'resetLight'}
                            firstClick={() => { }}
                            secondClick={() => { this._resetScene(); }}
                        />
                    </div>
                    <div className="planeDivider"></div>
                </div>
            </div>
        )
    }
}