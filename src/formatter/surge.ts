import { Formatter } from ".";
import { Proxy, ShadowsocksProxy, V2rayProxy } from "../proxy";

export class SurgeFormatter implements Formatter {
    format(proxy: Proxy) : string {
        if (proxy instanceof ShadowsocksProxy) {
            if (proxy.obfs === undefined) {
                return `ss, ${proxy.host}, ${proxy.port}, encrypt-method = ${proxy.encryptionMethod}, password = ${proxy.password}`;
            } else {
                return `ss, ${proxy.host}, ${proxy.port}, encrypt-method = ${proxy.encryptionMethod}, password = ${proxy.password}, obfs = ${proxy.obfs}, obfs-host = ${proxy.obfsHost}`;
            }
        } else if (proxy instanceof V2rayProxy) {
            return "";
        }
        throw new Error("the proxy type is not supported")
    }
}