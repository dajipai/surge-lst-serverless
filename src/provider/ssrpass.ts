import Resolver from "../resolver";

const SSRPassSSInboundsMap: {[key: string]: string} = {};
const SSRPassSSOutboundsMap: {[key: string]: string} = { Taiwan: "TW", America: "US", Japan: "JP", Hongkong: "HK" };
const SSRPassSSServerTypes: string[] = [];

class SSRPassSSResolver extends Resolver {
    constructor() {
        super(SSRPassSSInboundsMap, SSRPassSSOutboundsMap, SSRPassSSServerTypes, "Conair");
    }
}

export default new SSRPassSSResolver();
