const Stats = require('stats-js');

export const fpsDomRender = () => {
    const stats = new Stats();
    const divs = document.getElementsByClassName('fps-container');
    if (divs && divs.length) {
        const divChildren = divs[0].getElementsByTagName('div');
        if (divChildren && divChildren.length) {
            divChildren[0].remove();
        }
        divs[0].appendChild(stats.dom);
    }
    return stats;
}