import Resolver from "../resolver";
import { SSDSubscription, ProxiesInput } from "../input";

const N3roServerTypes: string[] = ["CN2", "IPLC", "中继", "TOCN"];

class N3roResolver extends Resolver {
    constructor() {
        super("N3RO", N3roServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://nnn3ro.link/link/${token}?mu=3", SSDSubscription]);
    }
}

export default new N3roResolver();
