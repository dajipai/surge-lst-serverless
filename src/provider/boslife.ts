import Resolver from "../resolver";
import { SurgeProfile, ProxiesInput } from "../input";

const BoslifeServerTypes = ["中转"];

class BoslifeResolver extends Resolver {
    constructor() {
        super("Boslife", BoslifeServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://api.cn1.info/downloads/conf/${token}.conf", SurgeProfile]);
    }
}

export default new BoslifeResolver();
