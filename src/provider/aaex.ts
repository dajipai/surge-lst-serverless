import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const AAEXServerTypes: string[] = ["中继", "特选"];

class AAEXResolver extends Resolver {
    constructor() {
        super("AAEX", AAEXServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://api.crhnode.top/subscribe/${id}/${token}/sip002/", Subscription]);
    }
}

export default new AAEXResolver();
