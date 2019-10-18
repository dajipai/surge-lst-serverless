import { Software } from ".";
import { Proxy, V2rayProxy, ShadowsocksProxy, ShadowsocksRProxy } from "../proxy";

export class QuantumultX implements Software {
    readonly build?: number;
    
    constructor(build?: number) {
        this.build = build;
    }
    
    satisfies(proxy: Proxy) : boolean {
        if (proxy instanceof ShadowsocksProxy) {
            return true;
        }
        if (proxy instanceof ShadowsocksRProxy) {
            return true;
        }
        if (proxy instanceof V2rayProxy) {
            if (this.build === undefined) {
                return true;
            }
            if (this.build >= 123) {
                return true;
            }
        }
        return false;
    }
}