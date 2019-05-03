interface Padder {
    getPaddingString(): string
}

class SpaceRepeatingPadder implements Padder {
    constructor(private numSpaces: number) { }
    getPaddingString() {
        return Array(this.numSpaces + 1).join(" ");
    }
}

class StringPadder implements Padder {
    constructor(private value: string) { }
    getPaddingString() {
        return this.value;
    }
}

function getRandomPadder() {
    return Math.random() < 0.5 ?
        new SpaceRepeatingPadder(4) :
        new StringPadder(" ");
}

let padder: Padder = getRandomPadder();

if (padder instanceof SpaceRepeatingPadder) {
    padder;
}

if (padder instanceof StringPadder) {
    padder;
}

type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
function getName(n: NameOrResolver): Name {
    if (typeof n == 'string') {
        return n;
    } else {
        return n();
    }
}

type Container<T> = { value: T };
type Tree<T> = {
    value: T;
    left: Tree<T>;
    right: Tree<T>;
}

type LinkedList<T> = T & { next: LinkedList<T> };

interface Person {
    name: string;
}

let people: LinkedList<Person>
let s = people.name;
s = people.next.name;

type Easing = "ease-in" | "ease-out" | "ease-in-out";
class UIElement {
    animate(dx: number, dy: number, easing: Easing) {
        if (easing === 'ease-in') {

        } else if (easing === 'ease-out') {

        } else if (easing === 'ease-in-out') {

        } else {

        }
    }
}

let button = new UIElement();
button.animate(0, 0, "ease-in");
// button.animate(0, 0, "uneasy"); error

interface Square {
    kind: "square";
    size: number;
}

interface Rectangle {
    kind: "rectangle";
    width: number;
    height: number;
}

interface Circle {
    kind: "circle";
    radius: number;
}

type Shape = Square | Rectangle | Circle;

function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

function area(s: Shape) {
    switch (s.kind) {
        case 'square':
            return s.size * s.size;
        case 'rectangle':
            return s.height * s.width;
        case 'circle':
            return Math.PI * s.radius ** 2;
    }
}

class BasicCalculator {
    public constructor(protected value: number = 0) { }
    public currentValue(): number {
        return this.value;
    }
    public add(operand: number): this {
        this.value += operand;
        return this;
    }
    public multiply(operand: number): this {
        this.value *= operand;
        return this;
    }
}

let v = new BasicCalculator(2)
    .multiply(5)
    .add(1)
    .currentValue();

class ScientificCalculator extends BasicCalculator {
    public constructor(value = 0) {
        super(0);
    }

    public sin() {
        this.value = Math.sin(this.value);
        return this;
    }
}

interface PersonPartial {
    name?: string;
    age?: number;
}

interface PersopnReadOnly {
    readonly name: string;
    readonly age: number;
}

type myReadonly<T> = {
    readonly [P in keyof T]: T[P];
}

type myPartial<T> = {
    [P in keyof T]?: T[P];
}

type tPersonPartial = myPartial<Person>;
type ReadonlyPerson = myReadonly<Person>;