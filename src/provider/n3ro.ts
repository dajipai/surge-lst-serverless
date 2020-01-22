import Resolver from "../resolver";
import { ServerBuilder } from "../server";

const N3roInboundsMap: {[key: string]: string} = { 沪: "SH", 深: "SZ", 杭: "HZ", 川: "CD", 京: "BJ" };
const N3roOutboundsMap: {[key: string]: string} = { 俄罗斯: "RU", 德国: "DE", 美国: "US", 香港: "HK", 台湾: "TW", 德: "DE", 新: "SG", 港: "HK", 美: "US", 日: "JP", 韩: "KR", 英: "UK", 台: "TW"};
const N3roServerTypes: string[] = ["CN2", "IPLC", "HINET", "BGP"];

class N3roResolver extends Resolver {
    constructor() {
        super("N3RO", N3roServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\((\d\.\d+)/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
    }
}

export default new N3roResolver();
