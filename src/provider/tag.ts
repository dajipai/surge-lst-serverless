import Resolver from "../resolver";
import { ProxiesInput, Subscription } from "../input";

const TagServerTypes: string[] = [];

class TagResolver extends Resolver {
    constructor() {
        super("TAG", TagServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://scrape.tagonline.asia/api/v1/client/subscribe?token=${token}", Subscription]);
    }
}

export default new TagResolver();
