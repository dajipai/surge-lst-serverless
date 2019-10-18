import { ProxiesInput } from ".";
import axios from "axios";
import { Base64 } from "js-base64";
import { Proxy, ShadowsocksRProxy } from "../proxy";
import { splitKV } from "./surge";

export class ShadowsocksRSubscription implements ProxiesInput {

    async proxies(url: string): Promise<Array<[string, Proxy]>> {
        let resp = await axios.get<string>(url);
        return <Array<[string,string]>> (Base64.decode(resp.data).split("\n").map((link): [string, Proxy]|null => {
            if(link.startsWith("ssr://")) {
                return parseSSRLink(link);
            }
            return null;
        }).filter(arr => arr !== null) || []);
    }
}

export const parseSSRLink = (data: string): [string, Proxy] => {
    const ssrLink = Base64.decode(data.trim().substr("ssr://".length));
    let [info, parameters] = ssrLink.split("/?");
    let [host, port, protocol, method, obfs, base64pass] = info.split(":");
    let {obfsparam, protoparam, remarks, group}: {[name: string]: string|undefined} = parameters.split("&").reduce<{[key: string]: string}>((map, str) => {
        let obj = splitKV(str);
        map[obj[0]] = obj[1];
        return map;
    }, {});
    obfsparam = obfsparam === undefined ? undefined : Base64.decode(obfsparam);
    protoparam = protoparam === undefined ? undefined : Base64.decode(protoparam);
    remarks = remarks === undefined ? "" : Base64.decode(remarks);
    group = group === undefined ? undefined : Base64.decode(group);
    return [remarks,
        new ShadowsocksRProxy(host, parseInt(port), Base64.decode(base64pass), method, protocol, obfs, group, obfsparam, protoparam)];
}