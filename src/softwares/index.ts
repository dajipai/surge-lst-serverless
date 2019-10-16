import { Proxy } from "../proxy";

export interface Software {
    satisfies(proxy: Proxy) : boolean
}

export { QuantumultX } from "./quantumultx";
export { Surge } from "./surge";