import { OrderedMap, List } from "immutable";
import Resolver from "./resolver";
import ServerInfo, { ServerBuilder, AllowSortedKeys } from "./server";
import { Proxy } from "./proxy";
import { ProxiesInput, Subscription } from "./input";
import { Software, QuantumultX } from "./softwares";

export class ProxyContext {
    private readonly provider: ProxiesInput;
    private software: Software;

    constructor(provider: ProxiesInput, output: Software) {
        this.software = output;
        this.provider = provider;
    }
  
    async getProxies(url: string): Promise<Array<[string, Proxy]>> {
       return await this.provider.proxies(url);
    }

    get respHeader(): {[key: string]: string} {
        if (this.software instanceof QuantumultX && this.provider instanceof Subscription) {
            const info = this.provider.subscriptionInfo;
            if (info !== undefined) {
                return {"subscription-userinfo": info};
            }
        }
        return {};
    }

    async handle(url: string, {
        inbound: inboundFilters = [],
        outbound: outboundFilters = [],
        multiplier: multiplierFilters = [],
        serverType: serverTypeFilters = [],
        tags: tagFilters = [],
        // filterNot
        noInbound: noInboundFilters = [],
        noOutbound: noOutboundFilters = [],
        noMultiplier: noMultiplierFilters = [],
        noServerType: noServerTypeFilters = [],
        noTags: noTagFilters = [],
      }: {[name: string]: string[]}, resolver: Resolver, useEmoji: boolean, sortMethod?: AllowSortedKeys[]) {
        if (sortMethod === undefined) {
            sortMethod = resolver.sortMethod();
        }
        const data = await this.getProxies(url);
        const proxies: OrderedMap<string,ServerInfo> = OrderedMap<string,Proxy>(data).map((value, name) => {
            return (new ServerBuilder(name, value)).withResolver(resolver).build();
        }).filter(resolver.defaultFilter());
        return this.software.format(proxies.filter(
            info => this.software.satisfies(info.proxy)
        ).filter((server) => {
            return List<string|string[]>([server.inbound, server.outbound, server.multiplier, server.serverType, server.tags])
                .zip<string[]>(List([inboundFilters, outboundFilters, multiplierFilters, serverTypeFilters, tagFilters]))
                .every(([property, filter]) => {
                    if (filter.length == 0) {
                        return true;
                    }
                    if (typeof property === "string") {
                        return filter.includes(property);
                    } else {
                        // make intersection
                        return property.filter(p => filter.includes(p)).length > 0;
                    }
            });
        }).filterNot((server) => {
            return List<string|string[]>([server.inbound, server.outbound, server.multiplier, server.serverType, server.tags])
                .zip<string[]>(List([noInboundFilters, noOutboundFilters, noMultiplierFilters, noServerTypeFilters, noTagFilters]))
                .some(([property, filter]) => {
                    if (filter.length == 0) {
                        return false;
                    }
                    if (typeof property === "string") {
                        return filter.includes(property);
                    } else {
                        // make intersection
                        return property.filter(p => filter.includes(p)).length > 0;
                    }
            });
        }).valueSeq().sort((a, b) => {
            return List(sortMethod!).map((key) => {
                return <number>a[key].localeCompare(b[key]);
            }).unshift(b.priority - a.priority).filterNot(x => x === 0).first(a.name.localeCompare(b.name, "pinyin"));
        }).toArray(), { useEmoji });
    }
}