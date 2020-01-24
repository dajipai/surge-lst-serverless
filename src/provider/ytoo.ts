import Resolver from "../resolver";
import { ServerBuilder } from "../server";
import { Subscription, ProxiesInput } from "../input";

const YTOOServerTypes: string[] = ['日用', 'BGP', 'Test', 'None'];

class YTOOResolver extends Resolver {
    constructor() {
        super("YTOO", YTOOServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\((\d\.\d)\)$/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }

        const tagMatcher = builder.name.match(/-(\w+)-/);
        if (tagMatcher != null) {
            builder.tag = tagMatcher[1];
        }
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://ytoo.xyz/modules/servers/V2raySocks/osubscribe.php?sid=${id}&token=${token}", Subscription]);
    }
}

export default new YTOOResolver();
