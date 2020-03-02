import Resolver from "../resolver";
import { ServerBuilder, serverInfoSortableKeyCodec } from "../server";
import { ProxiesInput, Subscription } from "../input";
import * as t from "io-ts";

const MayingServerTypes: string[] = ["测试", "应急"];

class MayingResolver extends Resolver {
    constructor() {
        super("Maying", MayingServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/-([\d\.]+)X-/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
        // match serverType
        if (builder.serverType === "") {
            const serverTypeMatches = builder.name.match(/^V\d{3}[U,T]{1}-[\d\.]+X-[\u4e00-\u9fa5]+([A-Z\d]+)/);
            if (serverTypeMatches != null) {
                builder.serverType = serverTypeMatches[1];
                // append serverType as the default behavior
                builder.tag = builder.serverType;
            }
        }

        const tagsMatcher = builder.name.match(/-([A-Z]+\*?)$/);
        if (tagsMatcher != null) {
            builder.tag = tagsMatcher[1];
        }

        const l4ProtocolMatcher = builder.name.match(/^[D|V]\d+([T|U]{1})/);
        if (l4ProtocolMatcher != null) {
            builder.tag = "TCP";
            if (l4ProtocolMatcher[1] === "U") {
                builder.tag = "UDP";
            }
        }
    }

    public sortMethod(): t.TypeOf<typeof serverInfoSortableKeyCodec> {
        return [];
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://sub.ssr.sh/link/${token}?mu=1", Subscription]);
    }
}

export default new MayingResolver();
