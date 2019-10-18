import Resolver from "../resolver";
import { ServerBuilder } from "../server";

const YTOOInboundsMap: {[key: string]: string} = { 穗: "GZ", 沪: "SH", 京: "BJ", 筑: "GY"};
const YTOOOutboundsMap: {[key: string]: string} = { 台: "TW", 德: "DE", 日: "JP", 美: "US", 港: "HK", 韩: "KR", 新: "SG"};
const YTOOServerTypes: string[] = ["KT", "GIA", "NTT", "OCN", "CHT", "IIJ"];

class YTOOResolver extends Resolver {
    constructor() {
        super(YTOOInboundsMap, YTOOOutboundsMap, YTOOServerTypes, "YTOO");
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\((\d\.\d)\)/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
    }
}

export default new YTOOResolver();
