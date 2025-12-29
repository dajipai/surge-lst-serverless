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
        return new Array(["https://api.wcc.best/sub?target=ss&url=https%3A%2F%2Fapi.oxycontinin.cc%2Fosubscribe.php%3Fsid%3D${id}%26token%3D${token}%26sip002%3D1&insert=false&config=https%3A%2F%2Fcdn.jsdelivr.net%2Fgh%2FSleepyHeeead%2Fsubconverter-config%40master%2Fremote-config%2Fcustomized%2Fytoo.ini&emoji=false&list=false&tfo=false&scv=true&fdn=false&sort=false", Subscription]);
    }
}

export default new YTOOSSResolver();
