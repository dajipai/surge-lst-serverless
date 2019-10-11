import { SurgeProxiesProvider } from "../profile";
import axios from "axios";
import { Base64 } from "js-base64";

export class V2raySubscription implements SurgeProxiesProvider {
    constructor() {
    }

    async proxies(url: string) : Promise<Array<[string, string]>> {
        let resp = await axios.get<string>(url);
        return <Array<[string,string]>> (Base64.decode(resp.data).split("\n").map((vmessUrl): [string, string]|null => {
            if(vmessUrl.startsWith("vmess://")) {
                return parseVmessLinkToSurgeNodeList(vmessUrl);
            }
            return null;
        }).filter(arr => arr !== null) || []);
    }
}

export const parseVmessLinkToSurgeNodeList = (vmessUrl: string) : [string, string] => {
    const vmessObj = JSON.parse(Base64.decode(vmessUrl.trim().substr("vmess://".length)));
    return [vmessObj.ps, `vmess, ${vmessObj.add}, ${vmessObj.port}, username=${vmessObj.id}, ws=${vmessObj.net === "ws"}, tls=${vmessObj.tls === "tls"}, ws-path=${vmessObj.path}`];
}