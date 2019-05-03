import * as React from "react";
import "./style.css";

interface Props {
    data: any
    [propName: string]: any;
}

interface State {
    startFromZero?: boolean;
    value?: number;
    option?: any;
    max?: number;
    title?: string;
    className?: string;
    handleClassName?: string;
    label?: string;
    titleOffset?: true;
    onValueChanged?: Function;
    onValueChanging?: Function;
    disabledText?: string;
    displayValue?: number;
    [propName: string]: any;
}

export class Slider extends React.Component<Props, State> {
    private startMove: boolean
    private startX: number;
    private sliderLength: number;
    private startValue: number;
    private leftPixel: number;
    private rightPixel: number;
    private oldValue: number;
    constructor(props: Props) {
        super(props);
        const data: any = this.props.data;
        this.startMove = false;
        this.state = {
            value: data.startFromZero ? data.value - data.option.max / 2 : data.value,
            option: data.option,
            max: data.startFromZero ? data.option.max / 2 : data.option.max,
            handleClassName: "",
            title: data.title,
            label: data.label,
            className: data.className,
            displayValue: data.startFromZero ? data.value.toFixed(0) - data.option.max / 2 : data.value.toFixed(0),
            onValueChanged: data.onValueChangeEnd,
            onValueChanging: data.onValueChanging,
            startFromZero: data.startFromZero,
            titleOffset: data.titleOffset,
            disabled: data.disabled,
            disabledText: data.disabledText,
            delay: data.delay,
            secStyle: data.secStyle,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        let data: any = nextProps.data;
        this.setState(
            {
                value: data.startFromZero ? data.value - data.option.max / 2 : data.value,
                option: data.option,
                max: data.startFromZero ? data.option.max / 2 : data.option.max,
                title: data.title,
                label: data.label,
                className: data.className,
                displayValue: data.startFromZero ? data.value - data.option.max / 2 : data.value,
                onValueChanged: data.onValueChangeEnd,
                onValueChanging: data.onValueChanging,
                startFromZero: data.startFromZero,
                titleOffset: data.titleOffset,
                disabled: data.disabled,
                disabledText: data.disabledText,
                delay: data.delay,
                secStyle: data.secStyle,
            }
        );
    }

    throttleFun() {
        this.state.onValueChanged(this.state.displayValue + this.state.max);
        this.removeEventListener();
        this.setState({ handleClassName: "" }, function () { });
    }

    delayMousemoveFun(e: any) {
        if (this.startMove) {
            let delta: number = e.pageX - this.startX;
            let deltaValue: number = (delta / this.sliderLength) * this.state.max * 2;
            var tmpValue: number = this.startValue + deltaValue;
            if (tmpValue > this.state.max) {
                tmpValue = this.state.max;
            } else if (tmpValue < (0 - this.state.max)) {
                tmpValue = 0 - this.state.max;
            }

            this.setState({ value: tmpValue, displayValue: tmpValue });
        }
    }

    delayMouseupFun() {
        if (this.state.onValueChanged !== undefined) {
            this.state.onValueChanged(this.state.displayValue);
            this.startMove = false;
            this.removeEventListener();
            this.setState({ handleClassName: "" }, function () { });
        }
    }

    addEventListener() {
        if (this.state.startFromZero) {
            // this.throttleFunInstance = _.debounce(this.throttleFun, 100);
            if (this.state.delay) {
                document.addEventListener("mousemove", this.delayMousemoveFun.bind(this), false);
            } else {
                document.addEventListener("mousemove", this.onmousemove.bind(this), false);
            }
            document.addEventListener("mouseup", this.throttleFun.bind(this), false);
        } else {
            if (this.state.delay) {
                document.addEventListener("mousemove", this.delayMousemoveFun.bind(this), false);
                document.addEventListener("mouseup", this.delayMouseupFun.bind(this), false);
            } else {
                document.addEventListener("mousemove", this.onmousemove.bind(this), false);
                document.addEventListener("mouseup", this.onmouseup.bind(this), false);
            }
        }
    }

    removeEventListener() {
        if (this.state.startFromZero) {
            // document.removeEventListener("mousemove", this.throttleFunInstance, false);
        }
        if (this.state.delay) {
            document.removeEventListener("mousemove", this.delayMousemoveFun.bind(this), false);
            document.removeEventListener("mouseup", this.delayMouseupFun.bind(this), false);
        }
        document.removeEventListener("mousemove", this.onmousemove.bind(this), false);
        document.removeEventListener("mouseup", this.onmouseup.bind(this), false);
        document.removeEventListener("mouseup", this.throttleFun.bind(this), false);
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize.bind(this));
        this.handleResize();
    }

    handleResize() {
        let slider: any = this.refs.slider;
        if (slider != undefined) {
            let rect: any = slider.getBoundingClientRect();
            this.leftPixel = rect.left;
            this.rightPixel = rect.right;
            this.sliderLength = this.rightPixel - this.leftPixel;
        }
    }

    componentDidUpdate() {

    }

    onmousedown(e: any) {
        if (e.button == 0) {
            this.startMove = true;
            this.startX = e.pageX;
            this.startValue = this.state.value;
            this.addEventListener();
            this.setState({ handleClassName: "slider-handle-hover" });
        }

        this.pauseEvent(e);
    }

    onmousemove(e: any) {
        if (this.startMove) {
            let delta = e.pageX - this.startX;
            let deltaValue = (delta / this.sliderLength) * this.state.max * 2;
            var tmpValue = this.startValue + deltaValue;
            if (tmpValue > this.state.max) {
                tmpValue = this.state.max;
            } else if (tmpValue < (0 - this.state.max)) {
                tmpValue = 0 - this.state.max;
            }

            this.setState({ value: tmpValue, displayValue: tmpValue }, function () {
                if (this.state.onValueChanging !== undefined) {
                    this.state.onValueChanging(parseInt(this.state.displayValue));
                } else {
                    this.state.onValueChanged(parseInt(this.state.displayValue));
                }
            });
        }
    }

    onmouseup(e: any) {
        this.startMove = false;
        this.removeEventListener();
        this.setState({ handleClassName: "" }, function () { });
    }

    onsliderclick(e: any) {
        if (!this.startMove) {
            this.setState({ handleClassName: "" });
            let value;
            if (e.pageX > this.rightPixel) {
                value = this.state.max;
            } else if (e.pageX < this.leftPixel) {
                value = 0 - this.state.max;
            } else {
                let delta = e.pageX - this.leftPixel;
                let deltaValue = (delta / this.sliderLength) * this.state.max * 2;
                value = deltaValue - this.state.max;
            }
        }
    }

    mouseDisabled() {
        const ele: any = document.getElementsByClassName('slider-disabled-mask');
        if (ele && ele.length !== 0) {
            ele[0].style.cursor = 'not-allowed';
            const textEle: any = document.getElementsByClassName('slider-disabled-tip');
            if (textEle) {
                textEle[0].style.display = 'block';
            }
        }
    }

    mouseEnabled() {
        const ele: any = document.getElementsByClassName('slider-disabled-mask');
        if (ele && ele.length !== 0) {
            ele[0].style.cursor = 'default';
            const textEle: any = document.getElementsByClassName('slider-disabled-tip');
            if (textEle) {
                textEle[0].style.display = 'none';
            }
        }
    }

    pauseEvent(e: any) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        return false;
    }

    handelChange(e: any) {
        let v = e.target.value;
        if (v == "") {
            v = "";
            // this.setState({ value: 0, displayValue: "" });
            this._lefmodeSetState(0, "");
            return;
        } else if (v == "-") {
            // this.setState({ value: 0, displayValue: "-" });
            this._lefmodeSetState(0, "-");
            return;
        }
        let old = this.state.value;
        if (isNaN(v)) {
            return;
        }
        if (v.indexOf(".") != -1) {
            return;
        }
        v = parseFloat(v);
        if (!this._isValueInRange(v)) {
            v = old;
            if (this.state.startFromZero) {
                v = 2 * this.state.max;
            }
        }
        old = v;
        // this.setState({ value: old, displayValue: old.toFixed(0) });
        this._lefmodeSetState(old, old.toFixed(0))
    }

    _lefmodeSetState(value: any, displayValue: any) {
        if (this.state.startFromZero) {
            if (Number.isInteger(parseInt(displayValue))) {
                this.setState({ value: value - this.state.max, displayValue: parseInt(displayValue) - this.state.max });
            } else {
                this.setState({ value: value - this.state.max, displayValue: -this.state.max });
            }
        } else {
            this.setState({ value: value, displayValue: displayValue });
        }
    }

    _isValueInRange(value: any) {
        if (this.state.startFromZero) {
            if (value > this.state.max * 2) {
                return false
            }

            if (value < 0) {
                return false
            }
            return true
        } else {
            if (value > this.state.max) {
                return false;
            }

            if (value < (0 - this.state.max)) {
                return false;
            }
            return true;
        }
    }

    onFocus() {
        this.oldValue = this.state.displayValue;
    }

    onblur() {
        if (this.state.displayValue != this.oldValue) {
            if (this.state.startFromZero) {
                this.state.onValueChanged(this.state.displayValue + this.state.max);
            } else {
                this.state.onValueChanged(this.state.displayValue);
            }

        }
    }

    keydown(e: any) {
        if (this.state.option.readOnly) return;
        let increase;
        switch (e.keyCode) {
            case 13: // enter key
                this.onblur();
                break;
        }
    }

    render() {
        if (isNaN(this.state.max) || isNaN(this.state.value)) {
            return null;
        }
        if (this.state.max <= 0) {
            return null;
        }
        let leftTwoWidth: number = 0;
        let rightOneWidth: number = 0;
        if (this.state.value < 0) {
            let tmpLeftTwoWidth: string = (this.state.value / (0 - 2 * this.state.max)).toFixed(3);
            leftTwoWidth = parseFloat(tmpLeftTwoWidth) * 100;
        } else {
            let tmpRightOneWidth: string = (this.state.value / (2 * this.state.max)).toFixed(3);
            rightOneWidth = parseFloat(tmpRightOneWidth) * 100;
        }
        let leftOneWidth: number = 50 - leftTwoWidth;
        let rightTwoWidth: number = 50 - rightOneWidth;
        let rightTwoLeft: number = 50 + rightOneWidth;
        let handleLeft: number;
        if (this.state.value > 0) {
            handleLeft = 50 + rightOneWidth;
        } else {
            handleLeft = 50 - leftTwoWidth;
        }
        let leftOneStyle = {
            width: leftOneWidth.toString() + "%",
        };
        let leftTwoStyle = {
            left: leftOneWidth.toString() + "%",
            width: leftTwoWidth.toString() + "%",
        };
        let rightOneStyle = {
            width: rightOneWidth.toString() + "%",
        };
        let rightTwoStyle = {
            left: rightTwoLeft.toString() + "%",
            width: rightTwoWidth.toString() + "%",
        };
        let sliderHandleStyle = {
            left: handleLeft.toString() + "%",
        };
        let handleClass: string = "slider-handle " + this.state.handleClassName;
        let dispValue: number = this.state.displayValue || 0;
        if (this.state.startFromZero) {
            dispValue = Math.round(dispValue + this.state.max);
        }
        let barStyle: any = null;
        let sliderDisabledMaskShow = {
            display: this.state.disabled ? 'block' : 'none'
        }
        let disabledText = this.state.disabledText;
        if (this.state.startFromZero) {
            barStyle = <div className="slider-track">
                <div className="slider-track-left-one" ref="leftOne" style={{ width: '100%' }}>
                </div>
            </div>
        } else {
            barStyle = <div className="slider-track">
                <div className="slider-track-left-one" ref="leftOne" style={leftOneStyle}>
                </div>
                <div className="slider-track-left-two" ref="leftTwo" style={leftTwoStyle}>
                </div>
                <div className="slider-track-right-one" ref="rightOne" style={rightOneStyle}>
                </div>
                <div className="slider-track-right-two" ref="rightTwo" style={rightTwoStyle}>
                </div>
            </div>
        }
        let titleView = (<span className="sliderTitle">{this.state.title + ":"}</span>);
        if (this.state.secStyle) titleView = (<div className="sliderTitle">{this.state.title + ":"}</div>);
        if (this.state.titleOffset) {
            if (this.state.title) {
                titleView = (<span className="sliderTitle ezhomeTitleOffset">{this.state.title + ":"}</span>);
            } else {
                titleView = (<span className="sliderTitle emptyTitleOffset"></span>);
                if (this.state.secStyle) titleView = (<div className="sliderTitle emptyTitleOffset"></div>);
            }
        }
        return (
            <div className={`${this.state.className} doubleSlide`}>
                {titleView}
                <div style={sliderDisabledMaskShow} className='slider-disabled-mask' onMouseEnter={() => this.mouseDisabled()} onMouseLeave={() => this.mouseEnabled()}></div>
                <div className='slider-disabled-tip'>{disabledText}</div>
                {this.state.secStyle && (<div className="sliderLabel">{this.state.label}:</div>)}
                <div className="slider slider-horizontal" ref="slider" onClick={(e) => this.onsliderclick(e)}>
                    {barStyle}
                    {this.state.startFromZero ? "" : <div className="slider-handle-origin"></div>}

                    <div className={handleClass} style={sliderHandleStyle} onMouseDown={(e) => this.onmousedown(e)} ref="sliderHandle" ></div>

                </div>
                <input type="text" className="sliderInput" value={dispValue} onFocus={() => this.onFocus()} onBlur={() => this.onblur()}
                    onChange={(e) => this.handelChange(e)} onKeyDown={(e) => this.keydown(e)} />
                {!this.state.secStyle && (<div className="sliderLabel">{this.state.label}</div>)}
            </div>
        );
    }
}