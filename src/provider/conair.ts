import Resolver from "../resolver";
import { ProxiesInput, SurgeProfile } from "../input";

const ConairServerTypes: string[] = ["南北互通", "專綫", "回國", "BGP"];

class ConairResolver extends Resolver {
    constructor() {
        super("Conair", ConairServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://conair.me/link/${token}?mu=6", SurgeProfile]);
    }
}

export default new ConairResolver();
