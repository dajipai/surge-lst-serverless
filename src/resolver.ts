import ServerInfo, { ServerBuilder, AllowSortedKeys } from "./server";
import { Direct } from "./proxy";
import { BoundMap, commonInboundsMap, commonOutboundsMap } from "./boundMap";

export default class Resolver {
    private readonly inboundsMap: BoundMap;
    private readonly outboundsMap: BoundMap;
    private readonly serverTypes: string[];
    private readonly provider: string;

    constructor(provider: string, serverTypes: string[], inboundsMap?: BoundMap, outboundsMap?: BoundMap, ) {
        this.inboundsMap = inboundsMap ?? commonInboundsMap;
        this.outboundsMap = outboundsMap ?? commonOutboundsMap;
        this.serverTypes = serverTypes;
        this.provider = provider;
    }

    get providerName() {
        return this.provider;
    }

    public resolve(builder: ServerBuilder): void {
        builder.provider = this.provider;
        builder.inbound = this.inboundsMap.match(builder.name) ?? "";
        builder.outbound = this.outboundsMap.match(builder.name) ?? "";

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
