import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const NexServerTypes: string[] = ["Premium"];

class NexResolver extends Resolver {
    constructor() {
        super("Nexitally", NexServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://naixisubs.com/downloadConfig/ShadowRocketImportService.aspx?urk=${token}&t=ssn", Subscription]);
    }
}

export default new NexResolver();
