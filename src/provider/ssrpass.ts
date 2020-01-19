import Resolver from "../resolver";

const SSRPassSSInboundsMap: {[key: string]: string} = {};
const SSRPassSSOutboundsMap: {[key: string]: string} = { Taiwan: "TW", America: "US" };
const SSRPassSSServerTypes: string[] = [];

class SSRPassSSResolver extends Resolver {
    constructor() {
        super(SSRPassSSInboundsMap, SSRPassSSOutboundsMap, SSRPassSSServerTypes, "Conair");
    }
}

export default new SSRPassSSResolver();
