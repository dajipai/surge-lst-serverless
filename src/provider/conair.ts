import Resolver from "../resolver";
import { ProxiesInput, SurgeProfile, SurgeNodeList } from "../input";

const ConairServerTypes: string[] = ["南北互通", "專綫", "回國", "BGP"];

class ConairResolver extends Resolver {
    constructor() {
        super("Conair", ConairServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://conair.me/link/${token}?mu=7", SurgeNodeList]);
    }
}

export default new ConairResolver();
