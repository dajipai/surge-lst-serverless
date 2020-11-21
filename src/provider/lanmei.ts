import Resolver from "../resolver";
import { ServerBuilder, serverInfoSortableKeyCodec } from "../server";
import { ProxiesInput, Subscription } from "../input";
import * as t from "io-ts";

const LanmeiServerTypes: string[] = ["流媒体"];

class LanmeiResolver extends Resolver {
    constructor() {
        super("Lanmei", LanmeiServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
    }

    public sortMethod(): t.TypeOf<typeof serverInfoSortableKeyCodec> {
        return [];
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://lanmei.fun/link/${token}?sub=3", Subscription]);
    }
}

export default new LanmeiResolver();