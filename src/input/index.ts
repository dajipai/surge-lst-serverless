import { Proxy } from "../proxy";

export interface ProxiesInput {
    proxies(url: string) : Promise<Array<[string, Proxy]>>
}

export { SurgeProfile, SurgeNodeList } from "./surge";
export { Subscription } from "./subscription";
export { SSDSubscription } from "./ssd";