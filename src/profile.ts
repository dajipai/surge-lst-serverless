import axios from "axios";
import { getProxiesFromSurgeProfile, getProxiesFromSurgeNodeList } from "./utils";

interface SurgeProxiesProvider {
    proxies(url: string) : Promise<Array<[string, string]>>
}

export class SurgeProfile implements SurgeProxiesProvider {
    constructor() {
    }

    async proxies(url: string) : Promise<Array<[string, string]>> {
        let resp = await axios.get<string>(url);
        return getProxiesFromSurgeProfile(resp.data);
    }
}

export class SurgeNodeList implements SurgeProxiesProvider {
    constructor() {
    }

    async proxies(url: string) : Promise<Array<[string, string]>> {
        let resp = await axios.get<string>(url);
        return getProxiesFromSurgeNodeList(resp.data);
    }
}

export class ProxyContext {
    private provider: SurgeProxiesProvider;
  
    constructor(provider: SurgeProxiesProvider){
       this.provider = provider;
    }
  
    async getProxies(url: string): Promise<Array<[string, string]>> {
       return await this.provider.proxies(url);
    }
 }