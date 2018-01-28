/* Drawable objects on canvas */

export class Drawable {
    constructor() {
        // metadata
        this.timeCreated = new Date().getTime();    // utc time in seconds, exclude .getTime for proper time object
        this.user = 0;                              // todo: set by session id?
        this.session = 0;                           // todo: set by session id?
        this.branch = 0;                            // primary, todo: set by interaction
    }

    toString() {
        return `session ${this.session}, user ${this.user}, branch ${this.branch}, at ${this.timeCreated}, `;
    }
}

export class Point extends Drawable {
    constructor(x, y) {
        super();

        // spatial
        this.x = x;
        this.y = y;
    }

    toString() {
        //let details = '(' + this.x + ', ' + this.y + ')' + ' ' + this.color;
        let details = `(${this.x}, ${this.y}), `;
        return super.toString() + details;
    }
}

export class Circle extends Point {
    constructor(x, y, r, color) {
        super(x, y);

        // aesthetics
        this.r = r;                 // todo: allow using default radius, color
        this.color = color;
        this.type = 'Circle'
    }

    toString() {
        let details = `type: ${this.type}, r: ${this.r}, color: ${this.color}, `;
        return super.toString() + details;
    }
}


export class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

export class Stroke extends Drawable {
    constructor(Pairs) {
        super();

        // spatial
        this.pairs = Pairs;
        this.type = 'Stroke'
    }

    toString() {
        let details = `type: ${this.type}, ` + this.pairs.join();
        return super.toString() + details;
    }
}
