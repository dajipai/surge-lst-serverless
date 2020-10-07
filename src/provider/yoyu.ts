import Resolver from "../resolver";
import { ServerBuilder } from "../server";
import { Subscription, ProxiesInput } from "../input";

const YoYuServerTypes: string[] = ["CEN", "Daily", "EC", "NBGP", "PBGP", "GM", "SP"];

class YoYuResolver extends Resolver {
    constructor() {
        super("YoYu", YoYuServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\[(\d\.\d)\]/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://yoyu.cc/subscribe/${id}/${token}/sip002/", Subscription]);
    }
}

export default new YoYuResolver();
