import Resolver from "../resolver";
import { ServerBuilder } from "../server";
import { Subscription, ProxiesInput } from "../input";

const YTOOServerTypes: string[] = ['日用', 'BGP', 'Test', 'N'];

class YTOOSSResolver extends Resolver {
    constructor() {
        super("YTOO-SS", YTOOServerTypes);
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
        return new Array(["https://api.oxycontin.cc/osubscribe.php?sid=${id}&token=${token}&sip002=1", Subscription]);
    }
}

export default new YTOOSSResolver();
