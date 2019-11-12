import { ProxiesInput } from ".";
import axios from "axios";
import { Base64 } from "js-base64";
import { Proxy, V2rayProxy, ShadowsocksRProxy, ShadowsocksProxy } from "../proxy";
import { splitKV } from "./surge";
import { URL } from "url";

export class Subscription implements ProxiesInput {
    private upload: number;
    private download: number;
    private total: number;

    constructor() {
        this.upload = 0;
        this.download = 0;
        this.total = -1;
    }

    async proxies(url: string) : Promise<Array<[string, Proxy]>> {
        let resp = await axios.get<string>(url);
        if (resp.headers['subscription-userinfo'] !== undefined) {
            const userInfo = resp.headers['subscription-userinfo'].match(/upload=(\d+); download=(\d+); total=(\d+)/);
            if (userInfo != null) {
                this.upload = parseInt(userInfo[1]);
                this.download = parseInt(userInfo[2]);
                this.total = parseInt(userInfo[3]);
            }
        }
        return <Array<[string,string]>> (Base64.decode(resp.data).split("\n").map((link): [string, Proxy]|null => {
            if(link.startsWith("vmess://")) {
                return parseVmessLink(link);
            } else if (link.startsWith("ssr://")) {
                return parseSSRLink(link);
            } else if (link.startsWith("ss://")) {
                return parseSIP002Link(link);
            }
            return null;
        }).filter(arr => arr !== null) || []);
    }

    get subscriptionInfo(): string|undefined {
        if (this.total !== -1) {
            return `upload=${this.upload}; download=${this.download}; total=${this.total}`;
        }
    }
}

export const parseVmessLink = (vmessUrl: string) : [string, Proxy] => {
    const vmessObj = JSON.parse(Base64.decode(vmessUrl.trim().substr("vmess://".length)));
    return [vmessObj.ps, new V2rayProxy(vmessObj.add, parseInt(vmessObj.port), vmessObj.id, vmessObj.net === "ws", vmessObj.tls === "tls", vmessObj.path, vmessObj.host)];
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
    obfsparam = obfsparam?.fromBase64();
    protoparam = protoparam?.fromBase64();
    remarks = remarks?.fromBase64() ?? "";
    group = group?.fromBase64();
    return [remarks,
        new ShadowsocksRProxy(host, parseInt(port), Base64.decode(base64pass), method, protocol, obfs, group, obfsparam, protoparam)];
}

export const parseSIP002Link = (data: string): [string, Proxy] => {
    const url = new URL(data.trim());
    const host = url.hostname;
    const port = parseInt(url.port);
    const [method, password] = Base64.decode(decodeURIComponent(url.username)).split(":");
    const remarks = decodeURIComponent(url.hash).replace(/^#/, "");
    const plugin = url.searchParams.get("plugin");
    if (plugin !== null) {
        const pluginMap = decodeURIComponent(plugin).split(";").reduce<{[name: string]: string|undefined}>((map, item) => {
            let pos = -1;
            if ((pos = item.indexOf("=")) > -1) {
                map[item.substr(0, pos)] = item.substr(pos+1);
            }
            return map;
        }, {});
        return [remarks, new ShadowsocksProxy(host, port, password, method, pluginMap['obfs'], pluginMap['obfs-host'])];
    }
    return [remarks, new ShadowsocksProxy(host, port, password, method)];
}