import { Proxy } from "../proxy";

export interface Formatter {
    format(proxy: Proxy, name: string) : string
}