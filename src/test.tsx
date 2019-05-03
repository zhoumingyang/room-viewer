import * as React from "react";
import * as THREE from "three";

export interface HelloProps {
    compiler: string;
    framework: string;
}

export class Hello extends React.Component<HelloProps, {}>{
    render() {

        let a = new THREE.Vector3(1.0, 2.0, 1.0);
        console.log(a);

        let tmpa: Array<Object> = [];
        tmpa.push(new THREE.Vector3(2.0, 2.0, 2.0));
        console.log(tmpa.length);
        console.log(tmpa[0]);

        let ob: Object = undefined;
        if (ob === undefined) {
            console.log('undefined');
        }
        return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>
    }
}