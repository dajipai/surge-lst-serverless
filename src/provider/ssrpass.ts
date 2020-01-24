import Resolver from "../resolver";
import { ProxiesInput, SSDSubscription } from "../input";

const SSRPassSSServerTypes: string[] = [];

class SSRPassSSResolver extends Resolver {
    constructor() {
        super("SSRPass-SS", SSRPassSSServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://ss.blacklist.pw/link/${token}?mu=3", SSDSubscription]);
    }
}

export default new SSRPassSSResolver();
