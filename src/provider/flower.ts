import Resolver from "../resolver";
import { ServerBuilder } from "../server";
import { Subscription, ProxiesInput } from "../input";

const FlowerServerTypes: string[] = [];

class FlowerResolver extends Resolver {
    constructor() {
        super("Flower", FlowerServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\[(\d\.\d)\]/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://flowercloud.yt/modules/servers/V2raySocks/osubscribe.php?sid=${id}&token=${token}&sip002=1", Subscription]);
    }
}

export default new FlowerResolver();
