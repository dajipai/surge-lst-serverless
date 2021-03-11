import Resolver from "../resolver";
import { ServerBuilder } from "../server";
import { Subscription, ProxiesInput } from "../input";

const ImmTelServerTypes: string[] = [];

class ImmTelResolver extends Resolver {
    constructor() {
        super("ImmTel", ImmTelServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\[(\d\.\d)\]/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://api.immtel.co/Subscription/ShadowRocketImportService?t=sip002&sid=${id}&token=${token}", Subscription]);
    }
}

export default new ImmTelResolver();
