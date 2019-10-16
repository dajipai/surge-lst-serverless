import { Software } from ".";
import { Proxy, V2rayProxy } from "../proxy";

export class QuantumultX implements Software {
    readonly build?: number;
    
    constructor(build?: number) {
        this.build = build;
    }
    satisfies(proxy: Proxy) : boolean {
        if (this.build === undefined) {
            return true;
        }
        if (proxy instanceof V2rayProxy && this.build < 123) {
            return false;
        }
        return true;
    }
}