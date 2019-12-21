import Resolver from "../resolver";
import { ServerBuilder } from "../server";

const YTOOInboundsMap: {[key: string]: string} = { 穗: "GZ", 沪: "SH", 京: "BJ", 筑: "GY", 广州: "GZ", 江苏: "JS"};
const YTOOOutboundsMap: {[key: string]: string} = { 台: "TW", 德: "DE", 日: "JP", 美: "US", 港: "HK", 韩: "KR", 新: "SG", 俄罗斯: "RU", 台湾: "TW", 日本: "JP", 香港: "HK", 菲律宾: "PH"};
const YTOOServerTypes: string[] = [];

class YTOOResolver extends Resolver {
    constructor() {
        super(YTOOInboundsMap, YTOOOutboundsMap, YTOOServerTypes, "YTOO");
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\((\d\.\d)\)$/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }

        // ^BGP, ^Time, ^Time-BGP, ^Time-CU
        const tagMatcher = builder.name.match(/^([A-Za-z0-9]+)-([A-Za-z0-9]+)?/);
        if (tagMatcher != null) {
            builder.tag = tagMatcher[1];
        }

        const serverTypeMatcher = builder.name.match(/-(\w+)-/);
        if (serverTypeMatcher != null) {
            builder.serverType = serverTypeMatcher[1];
            builder.tag = builder.serverType;
        }
    }
}

export default new YTOOResolver();
