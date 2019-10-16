import { ProxiesInput } from ".";
import axios from "axios";
import { Base64 } from "js-base64";
import { Proxy, V2rayProxy } from "../proxy";

export class V2raySubscription implements ProxiesInput {
    constructor() {
    }

    async proxies(url: string) : Promise<Array<[string, Proxy]>> {
        let resp = await axios.get<string>(url);
        return <Array<[string,string]>> (Base64.decode(resp.data).split("\n").map((vmessUrl): [string, Proxy]|null => {
            if(vmessUrl.startsWith("vmess://")) {
                return parseVmessLinkToSurgeNodeList(vmessUrl);
            }
            return null;
        }).filter(arr => arr !== null) || []);
    }
}

export const parseVmessLinkToSurgeNodeList = (vmessUrl: string) : [string, Proxy] => {
    const vmessObj = JSON.parse(Base64.decode(vmessUrl.trim().substr("vmess://".length)));
    return [vmessObj.ps, new V2rayProxy(vmessObj.add, parseInt(vmessObj.port), vmessObj.id, vmessObj.net === "ws", vmessObj.tls === "tls", vmessObj.path, vmessObj.host)];
}