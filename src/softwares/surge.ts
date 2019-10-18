import { Software } from ".";
import { Proxy, V2rayProxy, ShadowsocksProxy } from "../proxy";
import { SemVer, gte, coerce } from "semver";

export class Surge implements Software {
    static IOS_BUILD_1429 = <SemVer> coerce("1429");
    readonly version?: SemVer;
    readonly platform?: string;

    constructor(version?: SemVer, platform?: string) {
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
        }
        return false;
    }
}