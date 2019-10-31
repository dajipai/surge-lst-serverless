import ServerInfo, { ServerBuilder, AllowSortedKeys } from "./server";
import { Direct } from "./proxy";

export default class Resolver {
    private readonly inboundsMap: {[key: string]: string};
    private readonly outboundsMap: {[key: string]: string};
    private readonly serverTypes: string[];
    private readonly provider: string;

    constructor(inboundsMap: {[key: string]: string}, outboundsMap: {[key: string]: string}, serverTypes: string[], provider: string) {
        this.inboundsMap = inboundsMap;
        this.outboundsMap = outboundsMap;
        this.serverTypes = serverTypes;
        this.provider = provider;
    }

    public resolve(builder: ServerBuilder): void {
        builder.provider = this.provider;
        for (const city in this.inboundsMap) {
            if (builder.name.includes(city)) {
                builder.inbound = this.inboundsMap[city];
                break;
            }
        }
        for (const city in this.outboundsMap) {
            if (builder.name.includes(city)) {
                builder.outbound = this.outboundsMap[city];
                break;
            }
        }
        for (const serverType of this.serverTypes) {
            if (builder.name.includes(serverType)) {
                builder.serverType = serverType;
                // append serverType as the default behavior
                builder.tag = builder.serverType;
                break;
            }
        }
    }

    public defaultFilter(): (server: ServerInfo) => boolean {
        return (server) => {
            return !(server.proxy instanceof Direct);
        };
    }

    public sortMethod(): AllowSortedKeys[] {
        return ["outbound"];
    }
}
