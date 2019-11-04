import { Formatter } from ".";
import { Proxy, ShadowsocksProxy, V2rayProxy, ShadowsocksRProxy } from "../proxy";

export class SurgeFormatter implements Formatter {
    format(proxy: Proxy, name: string) : string {
        if (proxy instanceof ShadowsocksProxy) {
            let res = `${name} = ss,${proxy.host},${proxy.port},encrypt-method=${proxy.encryptionMethod},password=${proxy.password}`;
            if (proxy.obfs !== undefined) {
               res += `,obfs=${proxy.obfs},obfs-host=${proxy.obfsHost}`;
            }
            if (proxy.udpRelay) {
                res += ",udp-relay=true";
            }
            return res;
        } else if (proxy instanceof V2rayProxy) {
            let res = `${name} = vmess,${proxy.host},${proxy.port},username=${proxy.username},ws=${proxy.ws},tls=${proxy.tls},ws-path=${proxy.wsPath}`;
            if (proxy.wsHeaders !== undefined) {
                res += `,ws-headers=${proxy.wsHeaders}`
            }
            return res;
        } else if (proxy instanceof ShadowsocksRProxy) {
            return this.format(proxy.toShadowsocksProxy(), name);
        }
        throw new Error("the proxy type is not supported by Surge");
    }
}