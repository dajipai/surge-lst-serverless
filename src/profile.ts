import { OrderedMap, List } from "immutable";
import { addFlag } from "emoji-append";
import Resolver from "./resolver";
import ServerInfo, { ServerBuilder } from "./server";
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
        // filterNot
        noInbound: noInboundFilters = [],
        noOutbound: noOutboundFilters = [],
        noMultiplier: noMultiplierFilters = [],
        noServerType: noServerTypeFilters = [],
      }: {[name: string]: string[]}, resolver: Resolver, sortMethod: string[], useEmoji: boolean) {
        const data = await this.getProxies(url);
        const proxies: OrderedMap<string,ServerInfo> = OrderedMap<string,Proxy>(data).map((value, name) => {
            return (new ServerBuilder(name, value)).withResolver(resolver).build();
        }).filter(resolver.defaultFilter());
        return proxies.filter(
            info => this.software.satisfies(info.proxy)
        ).filter((server) => {
            return List<string>([server.inbound, server.outbound, server.multiplier, server.serverType])
                .zip<string[]>(List([inboundFilters, outboundFilters, multiplierFilters, serverTypeFilters]))
                .every(([property, filter]) => {
                    if (filter.length == 0) {
                        return true;
                    }
                    return filter.includes(property);
            });
        }).filterNot((server) => {
            return List<string>([server.inbound, server.outbound, server.multiplier, server.serverType])
                .zip<string[]>(List([noInboundFilters, noOutboundFilters, noMultiplierFilters, noServerTypeFilters]))
                .some(([property, filter]) => {
                    if (filter.length == 0) {
                        return false;
                    }
                return filter.includes(property);
            });
        }).valueSeq().sort((a, b) => {
            return List(sortMethod).map((key) => {
                return <number>(<string>(<any>a)[key]).localeCompare(<string>(<any>b)[key]);
            }).filterNot(x => x === 0).first(a.name.localeCompare(b.name, "pinyin"));
        }).map((server) => {
            if (useEmoji) {
                return this.formatter.format(server.proxy, addFlag(server.name));
            } else {
                return this.formatter.format(server.proxy, server.name);
            }
        }).toArray().join("\n");
    }
}