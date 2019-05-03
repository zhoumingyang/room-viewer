import * as React from "react";
import './style.css';

const imgSrc = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAkCAMAAADip6m2AAAAolBMVEUAAAAAAAAAAAAAAAAAAAABAQEAAAAAAAAHBwcAAAD////9/f37+/vt7e25ubn39/cKCgrz8/Pe3t7c3Nz+/v729vbW1tZra2tKSkoAAABpaWlgYGD9/f38/Pz5+fn5+fn39/fz8/Px8fHu7u7q6urm5ubj4+Pd3d3y8vLX19fJycnAwMC4uLisrKyhoaGVlZWGhoajo6MpKSkxMTGAgID///9oDYyzAAAANXRSTlMAAwcLFR0SGRAO+efJbSOcIqBDQvLNbTEpGxEQ9e3h29XDvLOsnJOJiIFpYVlNRkE7MiwfDLl52bwAAAGFSURBVEjH3ZXZboMwFERbHAMhC6EFQtrs+777/3+t98bGjmwqy32plHmLPYfMiYTy9nJ5F/kb693j+O4h7Y567SZjzbYHuDv72WCQxgfSjixpReyRqEWAdmK/YyaTfAHtpivjIo6TUReTZYxxcZzupju/XufP4g660aYD2USmuF13sKeP7Ae6uF13fKZBDRLQ81gTt+rOCmD9MPSBLmaauEV3hWidQOqIr57FLbrpDllCPAghSO9SU7xad3QCNiRQgwAeAn0a6eLVutOC4mRk+SCcToupIW7qsmWnByw25B3Svc6SaeKGbn9LA8UqGsW3fVMc2VJ3eJS6apcUPw5LcVmAq1J30qWBL1mN9gPanZTiUBE3pe5C6cpo4gtRjXkJjtf8cbnSlTHEcz5yTTwBh00UOVToVogfGvibhQq+pCyr0q0Wz1h6kTDsyZObPvn36bckh6qA8YE1eIUEa6GxyyeKEzhC1MLy6byL3yNP4BNn7TSWVRffHYHaI7qq7PB3qMr/mh8s20b2bOZlXQAAAABJRU5ErkJggg==`;

interface Props {
    [propName: string]: any;
}

interface State {
    [propName: string]: any;
}

export class ArrowButton extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
    }

    onLeftClick() {
        if (this.props && this.props.leftArrowClick) {
            this.props.leftArrowClick();
        }
    }

    onRightClick() {
        if (this.props && this.props.rightArrowClick) {
            this.props.rightArrowClick();
        }
    }

    render() {
        return (
            <div className="arrow-button-plane">
                <span className="arrow-button-left" onClick={() => { this.onLeftClick() }}>
                    <img src={imgSrc} />
                </span>
                <span className="arrow-button-right" onClick={() => { this.onRightClick() }}>
                    <img src={imgSrc} />
                </span>
            </div>);
    }
}