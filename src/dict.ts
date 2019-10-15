import { splitKV } from "./input/surge";

export class SurgeDict {
    value: string;
    private _array: Array<string>;
    private _dict: {[key: string]: string};

    constructor(entry: string) {
        this.value = entry;
        this._array = this.value.split(/\s*\,\s*/).filter(s => !s.includes("="));
        this._dict = this.value.split(/\s*\,\s*/).filter(s => s.includes("=")).map((s) => {
            return splitKV(s);
        }).reduce<{[key: string]: string}>((map, [key, value]) => {
            map[key] = value;
            return map;
        }, {});
    }

    hasKey(key: string): Boolean {
        return this._dict.hasOwnProperty(key);
    }

    getKey(key: string | number): string|undefined {
        if (typeof(key) === "string") {
            return this._dict[key];
        } else if (typeof key === "number") {
            return this._array[key];
        } else {
            // runtime assertion
            throw new Error("invalid key type");
        }
    }
}