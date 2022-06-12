import { ProxiesInput } from ".";
import axios from "axios";
import { Base64 } from "js-base64";
import { Proxy, ShadowsocksProxy } from "../proxy";
Base64.extendString();

export const SSD_SCHEME = "ssd://";
const GB_IN_BYTES = 1024 * 1024 * 1024;

export interface SSDServerSchema {
    server: string;
    port?: number;
    remarks?: string;
    id?: number;
    ratio?: number;
    encryption?: string;
    password?: string;
}

export interface SSDSchema {
    airport: string;
    port: number;
    encryption: string;
    password: string;
    traffic_used?: number;
    traffic_total?: number;
    expiry?: string;
    url?: string;
    servers: SSDServerSchema[];
}

export class SSDSubscription implements ProxiesInput {
    private upload: number;
    private download: number;
    private total: number;

    constructor() {
        this.upload = 0;
        this.download = 0;
        this.total = -1;
    }

    async proxies(url: string) : Promise<Array<[string, Proxy]>> {
        let resp = await axios.get<string>(url);
        if (resp.data.startsWith(SSD_SCHEME)) {
            const ssdData: SSDSchema = JSON.parse(Base64.decode(resp.data.substring(SSD_SCHEME.length)));
            const port = ssdData.port;
            const passwd = ssdData.password;
            const encryption = ssdData.encryption;
            if (ssdData.traffic_used) {
                this.download = ssdData.traffic_used * GB_IN_BYTES;
            }
            if (ssdData.traffic_total) {
                this.total = ssdData.traffic_total * GB_IN_BYTES;
            }
            return ssdData.servers.map((server) => {
                return [server.remarks ?? server.server, new ShadowsocksProxy(server.server, server.port ?? port, server.password ?? passwd, server.encryption ?? encryption)];
            });
        } else {
            return [];
        }
    }

    get subscriptionInfo(): string|undefined {
        if (this.total !== -1) {
            return `upload=${this.upload}; download=${this.download}; total=${this.total}`;
        }
    }
}

