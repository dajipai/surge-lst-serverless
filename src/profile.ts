import axios from "axios";
import { OrderedMap, List } from "immutable";
import { getProxiesFromSurgeProfile, getProxiesFromSurgeNodeList } from "./utils";
import { addFlag } from "emoji-append";
import Resolver from "./resolver";
import Server, { ServerBuilder, Proxy } from "./server";

export interface ProxiesInput {
    proxies(url: string) : Promise<Array<[string, Proxy]>>
}

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

export class ProxyContext {
    private provider: SurgeProxiesProvider;
  
    constructor(provider: SurgeProxiesProvider){
       this.provider = provider;
    }
  
    async getProxies(url: string): Promise<Array<[string, Server]>> {
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
        const proxies: OrderedMap<string,Server> = OrderedMap<string,string>(data).map((value, name) => {
            return (new ServerBuilder(name, value)).withResolver(resolver).build();
        }).filter(resolver.defaultFilter());
        return proxies.filter((server) => {
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
                return `${addFlag(server.name)} = ${server.value}`;
            } else {
                return `${server.name} = ${server.value}`;
            }
        }).toArray().join("\n");
    }
}

export { V2raySubscription } from "./formatter/v2ray";