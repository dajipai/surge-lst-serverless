import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const NexServerTypes: string[] = ["Premium"];

class NexResolver extends Resolver {
    constructor() {
        super("Nexitally", NexServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://wnkbvx.lol/?${token}", Subscription]);
    }
}

export default new NexResolver();
