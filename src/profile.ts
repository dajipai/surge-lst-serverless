import { OrderedMap, List } from "immutable";
import { addFlag } from "emoji-append";
import Resolver from "./resolver";
import ServerInfo, { ServerBuilder, AllowSortedKeys } from "./server";
import { Proxy } from "./proxy";
import { Formatter } from "./formatter";
import { SurgeFormatter } from "./formatter/surge";
import { ProxiesInput } from "./input";
import { QuantumultXFormatter } from "./formatter/quanx";
import { Software, Surge } from "./softwares";

export class ProxyContext {
    private provider: ProxiesInput;
    private formatter: Formatter;
    private software: Software;

    constructor(provider: ProxiesInput, output: Software) {
        this.software = output;
        if (output instanceof Surge) {
            this.formatter = new SurgeFormatter();
        } else {
            this.formatter = new QuantumultXFormatter();
        }
        this.provider = provider;
    }
  
    async getProxies(url: string): Promise<Array<[string, Proxy]>> {
       return await this.provider.proxies(url);
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
        return proxies.filter(
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
        }).map((server) => {
            if (useEmoji) {
                return this.formatter.format(server.proxy, addFlag(server.name));
            } else {
                return this.formatter.format(server.proxy, server.name);
            }
        }).toArray().join("\n");
    }
}