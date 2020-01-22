import Resolver from "../resolver";

const SSRPassSSServerTypes: string[] = [];

class SSRPassSSResolver extends Resolver {
    constructor() {
        super("SSRPass-SS", SSRPassSSServerTypes);
    }
}

export default new SSRPassSSResolver();
