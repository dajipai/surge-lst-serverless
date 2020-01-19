import { Proxy } from "../proxy";
import { Formatter } from "./formatter";
import ServerInfo from "../server";
import { getFlagFromAbbr } from "emoji-append";

export interface Software extends Formatter {
    satisfies(proxy: Proxy) : boolean
}

export abstract class ComposableOutputSoftware implements Software {
    abstract writeSingleProxy(proxy: Proxy, name: string): string;
    abstract satisfies(proxy: Proxy) : boolean;

    format(proxies: ServerInfo[], options: {[key: string]: any}) : string {
        const useEmoji : boolean = options["useEmoji"] ?? true;
        return proxies.map((server) => {
            if (useEmoji) {
                return this.writeSingleProxy(server.proxy, `${getFlagFromAbbr(server.outbound)} ${server.name}`);
            } else {
                return this.writeSingleProxy(server.proxy, server.name);
            }
        }).join("\n");
    }
}

export { QuantumultX } from "./quantumultx";
export { Surge } from "./surge";