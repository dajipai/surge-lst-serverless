import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const NexServerTypes: string[] = [];

class NexResolver extends Resolver {
    constructor() {
        super("Nexitally", NexServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://www.nenode.best/downloadConfig/ShadowRocketImportService.aspx?urk=${token}&t=ssn", Subscription]);
    }
}

export default new NexResolver();
