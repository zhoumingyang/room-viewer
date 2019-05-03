export const selectedVertex = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const selectedFragment = `
    uniform vec3 pointColor;
    uniform float opacity;
    void main() {
        float step = 6.0;
        float modx = mod(gl_FragCoord.x, step);
        float mody = mod(gl_FragCoord.y, step);
        float e = 2.0;
        if((modx>=-e&&modx<=e)&&(mody>=-e&&mody<=e)) {
            gl_FragColor = vec4(pointColor, opacity);
        }else{
            discard;
        }
    }`;