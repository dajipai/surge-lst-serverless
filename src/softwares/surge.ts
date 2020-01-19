import { ComposableOutputSoftware } from ".";
import { Proxy, V2rayProxy, ShadowsocksProxy, ShadowsocksRProxy } from "../proxy";
import { SemVer, gte, coerce } from "semver";

export class Surge extends ComposableOutputSoftware {
    static IOS_BUILD_1429 = <SemVer> coerce("1429");
    readonly version?: SemVer;
    readonly platform?: string;

    constructor(version?: SemVer, platform?: string) {
        super();
        this.version = version;
        this.platform = platform;
    }

    satisfies(proxy: Proxy) : boolean {
        if (proxy instanceof V2rayProxy) {
            if (this.version === undefined || this.platform === undefined) {
                return true;
            }
            if (this.platform === "macos") {
                return gte(this.version, "3.3.1");
            } else if (this.platform === "ios") {
                return gte(this.version, Surge.IOS_BUILD_1429);
            }
        } else if (proxy instanceof ShadowsocksProxy) {
            return true;
        } else if (proxy instanceof ShadowsocksRProxy && proxy.compatibleWithSS()) {
            return true;
        }
        return false;
    }

    writeSingleProxy(proxy: Proxy, name: string) : string {
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
            return this.writeSingleProxy(proxy.toShadowsocksProxy(), name);
        }
        throw new Error("the proxy type is not supported by Surge");
    }
}