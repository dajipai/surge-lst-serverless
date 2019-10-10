import Resolver from "../resolver";

const BoslifeInboundsMap = { 上海: "SH", 北京: "BJ", 杭州: "HZ", 深圳: "SZ", CN2: "CN2"};
const BoslifeOutboundsMap = { 英国: "UK", 台湾: "TW", 日本: "JP", 新加坡: "SG", 美国: "US", 香港: "HK", 土耳其: "TR"};
const BoslifeServerTypes = ["中转"];

class BoslifeResolver extends Resolver {
    constructor() {
        super(BoslifeInboundsMap, BoslifeOutboundsMap, BoslifeServerTypes, "Boslife");
    }
}

export default new BoslifeResolver();
