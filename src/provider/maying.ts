import Resolver from "../resolver";
import { ServerBuilder } from "../server";

const MayingInboundsMap: {[key: string]: string} = { 青岛: "QD", 上海: "SH", 沪: "SH", 北京: "BJ", 杭州: "HZ", 深圳: "SZ", 无锡: "WX", 呼: "HHHT"};
const MayingOutboundsMap: {[key: string]: string} = { 台湾: "TW", 德国: "DE", 日本: "JP", 狮城: "SG", 美国: "US", 香港: "HK", 港: "HK", 韩国: "KR", 伦敦: "UK", 东京: "JP", 首尔: "KR"};
const MayingServerTypes: string[] = ["测试", "HGC", "CN2", "LW", "HKBN", "NTT", "BBETC", "HE", "KI", "NME", "PCCW", "RS", "TATA", "QN", "INAP", "FC", "M247", "I3D", "BBIX", "L3", "AZ", "KT", "TFN", "TIG", "HiNet", "EX", "WR", "ST", "TTK", "MP", "CAT", "GCX", "PZ", "应急"];

class MayingResolver extends Resolver {
    constructor() {
        super(MayingInboundsMap, MayingOutboundsMap, MayingServerTypes, "Maying");
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/-([\d\.]+)X-/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
    }
}

export default new MayingResolver();
