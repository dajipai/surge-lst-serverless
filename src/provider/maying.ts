import Resolver from "../resolver";
import { ServerBuilder, AllowSortedKeys } from "../server";

const MayingOutboundsMap: {[key: string]: string} = { 
    香港: "HK",
    大阪: "JP",
    东京: "JP",
    首尔: "KR",
    硅谷: "US",
    新加坡: "SG",
    波特兰: "US",
    洛杉矶: "US",
    圣何塞: "US",
    达拉斯: "US",
    西雅图: "US",
    芝加哥: "US",
    伦敦: "UK",
    法兰克福: "DE",
    彰化: "TW",
    新北: "TW",
    台北: "TW",
    圣克拉拉: "US",
    凤凰城: "US",
    圣彼得堡: "RU",
    悉尼: "AU",
    曼谷: "TH",
    台中: "TW",
    埼玉: "JP",
};
const MayingServerTypes: string[] = ["测试", "应急"];

class MayingResolver extends Resolver {
    constructor() {
        super("Maying", MayingServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/-([\d\.]+)X-/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }
        // match serverType
        if (builder.serverType === "") {
            const serverTypeMatches = builder.name.match(/^V\d{3}[U,T]{1}-[\d\.]+X-[\u4e00-\u9fa5]+([A-Z\d]+)/);
            if (serverTypeMatches != null) {
                builder.serverType = serverTypeMatches[1];
                // append serverType as the default behavior
                builder.tag = builder.serverType;
            }
        }

        const tagsMatcher = builder.name.match(/-([A-Z]+\*?)$/);
        if (tagsMatcher != null) {
            builder.tag = tagsMatcher[1];
        }

        const l4ProtocolMatcher = builder.name.match(/^[D|V]\d+([T|U]{1})/);
        if (l4ProtocolMatcher != null) {
            builder.tag = "TCP";
            if (l4ProtocolMatcher[1] === "U") {
                builder.tag = "UDP";
            }
        }
    }

    public sortMethod(): AllowSortedKeys[] {
        return [];
    }
}

export default new MayingResolver();
