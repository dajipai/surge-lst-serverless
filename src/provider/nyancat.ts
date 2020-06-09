import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const NyanCatServerTypes: string[] = ["Game", "Premium"];

class NyanCatResolver extends Resolver {
    constructor() {
        super("NyanCat", NyanCatServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://api.nyancat.net/api/client/shadowsocks/sip002?id=${id}&password=${token}", Subscription]);
    }
}

export default new NyanCatResolver();
