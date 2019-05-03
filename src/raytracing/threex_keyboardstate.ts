class KeyboardState {
    public domElement: any;
    public keyCodes: any;
    public modifiers: any;
    public _onKeyDown: any;
    public _onKeyUp: any;
    public static MODIFIERS: any;
    public static ALIAS: any;
    constructor(domElement?: any) {
        this.domElement = domElement || document;
        this.keyCodes = {};
        this.modifiers = {};
        let _this = this;
        this._onKeyDown = function (event: any) {
            _this._onKeyChange(event);
        };
        this._onKeyUp = function (event: any) {
            _this._onKeyChange(event);
        }

        this.domElement.addEventListener("keydown", this._onKeyDown, false);
        this.domElement.addEventListener("keyup", this._onKeyUp, false);
    }

    public destroy() {
        this.domElement.removeEventListener("keydown", this._onKeyDown, false);
        this.domElement.removeEventListener("keyup", this._onKeyUp, false);
    }

    private _onKeyChange(event: any) {
        event.preventDefault();
        const keyCode = event.keyCode;
        const pressed = event.type === 'keydown' ? true : false;
        this.keyCodes[keyCode] = pressed;
        this.modifiers['shift'] = event.shiftKey;
        this.modifiers['ctrl'] = event.ctrlKey;
        this.modifiers['alt'] = event.altKey;
        this.modifiers['meta'] = event.metaKey;
    }

    public pressed(keyDesc: string): boolean {
        const keys: string[] = keyDesc.split("+");
        for (let i = 0, len = keys.length; i < len; i++) {
            const key: string = keys[i];
            let pressed: boolean = false;
            if (KeyboardState.MODIFIERS.indexOf(key) !== -1) {
                pressed = this.modifiers[key];
            } else if (Object.keys(KeyboardState.ALIAS).indexOf(key) != -1) {
                pressed = this.keyCodes[KeyboardState.ALIAS[key]];
            } else {
                pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)];
            }
            if (!pressed) return false;
        }
        return true;
    }

    public eventMatches(event: any, keyDesc: any): boolean {
        const aliases = KeyboardState.ALIAS;
        const aliasKeys = Object.keys(aliases);
        const keys = keyDesc.split("+");
        for (let i = 0, len = keys.length; i < len; i++) {
            let key = keys[i];
            let pressed = false;
            if (key === 'shift') {
                pressed = (event.shiftKey ? true : false);
            } else if (key === 'ctrl') {
                pressed = (event.ctrlKey ? true : false);
            } else if (key === 'alt') {
                pressed = (event.altKey ? true : false);
            } else if (key === 'meta') {
                pressed = (event.metaKey ? true : false);
            } else if (aliasKeys.indexOf(key) !== -1) {
                pressed = (event.keyCode === aliases[key] ? true : false);
            } else if (event.keyCode === key.toUpperCase().charCodeAt(0)) {
                pressed = true;
            }
            if (!pressed) return false;
        }
        return true;
    }
}

KeyboardState.MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];
KeyboardState.ALIAS = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40,
    'space': 32,
    'pageup': 33,
    'pagedown': 34,
    'tab': 9,
    'escape': 27
};

export const THREEx: any = {
    KeyboardState: KeyboardState,
};