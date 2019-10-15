import { Proxy } from "../proxy";

export interface ProxiesInput {
    proxies(url: string) : Promise<Array<[string, Proxy]>>
}

export { SurgeProfile, SurgeNodeList } from "./surge";
export { V2raySubscription } from "./v2ray";