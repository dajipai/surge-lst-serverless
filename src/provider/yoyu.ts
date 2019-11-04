import Resolver from "../resolver";
import { ServerBuilder } from "../server";

const YoYuInboundsMap: {[key: string]: string} = { 青岛: "QD", 上海: "SH", 沪: "SH", 北京: "BJ", 杭州: "HZ", 深圳: "SZ", 无锡: "WX", 呼: "HHHT"};
const YoYuOutboundsMap: {[key: string]: string} = { 台湾: "TW", 德国: "DE", 日本: "JP", 狮城: "SG", 美国: "US", 香港: "HK", 港: "HK", 韩国: "KR", 伦敦: "UK", 东京: "JP", 首尔: "KR", 土耳其: "TR"};
const YoYuServerTypes: string[] = ["BGP", "测试", "专线", "日用", "购物", "游戏", "GIA"];

class YoYuResolver extends Resolver {
    constructor() {
        super(YoYuInboundsMap, YoYuOutboundsMap, YoYuServerTypes, "YoYu");
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\[(\d\.\d)\]/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }

        // Only provide one tag `IPLC`
        if (builder.name.includes("IPLC")) {
            builder.tag = "IPLC";
        }

        if (builder.name.includes("CN2")) {
            builder.tag = "CN2";
        }
    }
}

export default new YoYuResolver();
