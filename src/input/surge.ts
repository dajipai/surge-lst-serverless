import { Proxy, ShadowsocksProxy, Direct, Reject, RejectTinyPNG, HttpProxy, ExternalProxy, V2rayProxy } from "../proxy";
import { SurgeDict } from "../dict";
import axios from "axios";
import { ProxiesInput } from ".";

export class SurgeProfile implements ProxiesInput {
    constructor() {
    }

    async proxies(url: string) : Promise<Array<[string, Proxy]>> {
        let resp = await axios.get<string>(url);
        return getProxiesFromSurgeProfile(resp.data);
    }
}

export class SurgeNodeList implements ProxiesInput {
    constructor() {
    }

    async proxies(url: string) : Promise<Array<[string, Proxy]>> {
        let resp = await axios.get<string>(url);
        return getProxiesFromSurgeNodeList(resp.data);
    }
}

export const getProxiesFromSurgeProfile = (content: string): Array<[string, Proxy]> => {
    let proxies: Array<[string, Proxy]> = [];
    const lines = content.split('\n');
    let inProxyContext = false;
    for (let line of lines) {
        line = line.trim();
        if (line === "") {
            // empty line
            continue;
        }

        if (line.startsWith(";") || line.startsWith("//") || line.startsWith("#")) {
            // comment
            continue;
        }

        if (line.startsWith("[") && line.endsWith("]")) {
            if (line === "[Proxy]") {
                inProxyContext = true;
            } else {
                inProxyContext = false;
            }
        }

        if (inProxyContext) {
            let pos = line.indexOf("=");
            if (pos < 0) {
                continue;
            }
            proxies.push([line.substr(0, pos).trimRight(), createSurgeProxy(line.substr(pos + 1).trimLeft())]);
        }
    }
    return proxies;
}

export const splitKV = (input: string): [string, string] => {
    const idx = input.indexOf("=");
    return [input.substring(0, idx).trim(), input.substring(idx + 1, input.length).trim()];
}

export const getProxiesFromSurgeNodeList = (content: string): Array<[string, Proxy]> => {
    return <Array<[string,Proxy]>> (content.split('\n').filter((line) => {
        return !(line.trim() === "" || line.trim().startsWith(";") || line.trim().startsWith("//") || line.trim().startsWith("#"));
    }).map((line): [string,Proxy]|null => {
        let pos = line.indexOf("=");
        if (pos < 0) {
            return null;
        }
        return [line.substr(0, pos).trimRight(), createSurgeProxy(line.substr(pos + 1).trimLeft())];
    }).filter(ele => ele !== null) || []);
}

export const createSurgeProxy = (content: string): Proxy => {
    // ss
    if (content.startsWith("ss")) {
        const server = new SurgeDict(content);
        let host = server.getKey(1);
        if (host === undefined) {
            throw new Error("host not valid");
        } 
        let portStr = server.getKey(2);
        if (portStr === undefined) {
            throw new Error("port not valid");
        }
        let port = parseInt(portStr);
        let encryptMethod = server.getKey("encrypt-method");
        if (encryptMethod === undefined) {
            throw new Error("encryption method not valid");
        }
        let password = server.getKey("password");
        if (password === undefined) {
            throw new Error("password not valid");
        }
        let obfs = server.getKey("obfs");
        let obfsHost = server.getKey("obfs-host");
        // https://trello.com/c/ugOMxD3u/53-udp-%E8%BD%AC%E5%8F%91
        const udpRelayStr = server.getKey("udp-relay");
        let udpRelay = false;
        if (udpRelayStr === "true") {
            udpRelay = true;
        }
        return new ShadowsocksProxy(host, port, password, encryptMethod, obfs, obfsHost, udpRelay);
    // vmess
    } else if (content.startsWith("vmess")) {
        const server = new SurgeDict(content); 
        let host = server.getKey(1);
        if (host === undefined) {
            throw new Error("host not valid");
        }
        let portStr = server.getKey(2);
        if (portStr === undefined) {
            throw new Error("port not valid");
        }
        let port = parseInt(portStr);
        let username = server.getKey("username");
        if (username === undefined) {
            throw new Error("username not valid");
        }
        let wsStr = server.getKey("ws");
        let ws = false;
        if (wsStr === "true") {
            ws = true;
        }
        let tlsStr = server.getKey("tls");
        let tls = false;
        if (tlsStr == "true") {
            tls = true;
        }
        let wsPath = server.getKey("ws-path");
        if (wsPath === undefined) {
            wsPath = "/";
        }
        let wsHeaders = server.getKey("ws-headers");
        return new V2rayProxy(host, port, username, ws, tls, wsPath, "", wsHeaders);
    // custom, probably ss
    } else if (content.startsWith("custom")) {
        const server = new SurgeDict(content);
        let host = server.getKey(1);
        if (host === undefined) {
            throw new Error("host not valid");
        }
        let portStr = server.getKey(2);
        if (portStr === undefined) {
            throw new Error("port not valid");
        }
        let port = parseInt(portStr);
        let encryptMethod = server.getKey(3);
        if (encryptMethod === undefined) {
            throw new Error("encryption method not valid");
        }
        let password = server.getKey(4);
        if (password === undefined) {
            throw new Error("password not valid");
        }
        let obfs = server.getKey("obfs");
        let obfsHost = server.getKey("obfs-host");
        // https://trello.com/c/ugOMxD3u/53-udp-%E8%BD%AC%E5%8F%91
        const udpRelayStr = server.getKey("udp-relay");
        let udpRelay = false;
        if (udpRelayStr === "true") {
            udpRelay = true;
        }
        return new ShadowsocksProxy(host, port, password, encryptMethod, obfs, obfsHost, udpRelay);
    } else if (content.startsWith("http")) {
        return new HttpProxy();
    } else if (content.startsWith("external")) {
        return new ExternalProxy();
    } else if (content.toLowerCase() === "direct") {
        return new Direct();
    } else if (content.toLowerCase() === "reject") {
        return new Reject();
    } else if (content.toLowerCase() === "reject-tinygif") {
        return new RejectTinyPNG();
    } else {
        throw new Error("unrecognized server type");
    }
}