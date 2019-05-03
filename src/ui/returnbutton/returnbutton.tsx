import * as React from "react";
import * as ReactDOM from "react-dom";
import { ResourceMessage } from "../../resource";
import "./style.css";

interface Props {
    [propName: string]: any;
}

interface State {
    [propName: string]: any;
}

class ReturnButton extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
    }

    click() {
        if (this.props && this.props.clear) {
            this.props.clear();
        }
        ReturnButtonShow.destory();  
    }

    render() {
        return (
            <div className="returnbutton-plane">
                <span className="returnbutton" onClick={() => { this.click() }}>{ResourceMessage['return']}</span>
            </div>
        )
    }
}

export class ReturnButtonShow {
    static instance: any;
    static create(datas?: any): void {
        const container: any = document.getElementsByClassName('return-button-container')[0];
        if (!container) {
            return;
        }
        ReturnButtonShow.instance = ReactDOM.render(<ReturnButton clear={datas.clear} />, container);
    }

    static destory(): any {
        if (!ReturnButtonShow.instance) {
            return;
        }
        const container: any = document.getElementsByClassName('return-button-container')[0];
        if (container) {
            ReactDOM.unmountComponentAtNode(container);
            ReturnButtonShow.instance = undefined;
        }
        const singleCanvas = document.getElementById('single-canvas');
        if (!singleCanvas) {
            return;
        }
        document.body.removeChild(singleCanvas);
    }
}