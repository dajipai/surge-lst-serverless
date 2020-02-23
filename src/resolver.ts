import ServerInfo, { ServerBuilder, serverInfoSortableKeyCodec } from "./server";
import { Direct } from "./proxy";
import { BoundMap, commonInboundsMap, commonOutboundsMap } from "./boundMap";
import { ProxiesInput } from "./input";
import * as t from "io-ts";

export default abstract class Resolver {
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

    abstract providerTemplates(): Array<[string, new () => ProxiesInput]>;

    public sortMethod(): t.TypeOf<typeof serverInfoSortableKeyCodec> {
        return ["outbound"];
    }
}
