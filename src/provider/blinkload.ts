import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const BlinkloadServerTypes: string[] = ["中继", "特选"];

class BlinkloadResolver extends Resolver {
    constructor() {
        super("Blinkload", BlinkloadServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://api.pay.pm/api/v1/link/sip002?token=${token}", Subscription]);
    }
}

export default new BlinkloadResolver();
