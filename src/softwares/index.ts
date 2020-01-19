import { Proxy } from "../proxy";
import { Formatter } from "./formatter";

export interface Software extends Formatter {
    satisfies(proxy: Proxy) : boolean
}

export { QuantumultX } from "./quantumultx";
export { Surge } from "./surge";