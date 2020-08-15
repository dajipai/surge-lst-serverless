import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const NyanCatIEPLServerTypes: string[] = ["Magic Ingress", "IEPL"];

class NyanCatIEPLResolver extends Resolver {
    constructor() {
        super("NyanCat-IEPL", NyanCatIEPLServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://api.nyancat.net/api/client/vmess/v2ray?uuid=${token}", Subscription]);
    }
}

export default new NyanCatIEPLResolver();
