import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const AnrunServerTypes: string[] = ["NTT", "PCCW", "BGP", "IEPL", "游戏专用"];

class AnrunResolver extends Resolver {
    constructor() {
        super("Anrun", AnrunServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://console.anrun.online/api/v1/client/subscribe?token=${token}", Subscription]);
    }
}

export default new AnrunResolver();
