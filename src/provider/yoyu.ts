import Resolver from "../resolver";
import { ServerBuilder } from "../server";
import { Subscription, ProxiesInput } from "../input";

const YoYuServerTypes: string[] = ["BGP", "测试", "专线", "日用", "购物", "游戏", "GIA", "回国", "IPLC"];

class YoYuResolver extends Resolver {
    constructor() {
        super("YoYu", YoYuServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\[(\d\.\d)\]/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }

        // tag - `CN2`
        if (builder.name.includes("CN2")) {
            builder.tag = "CN2";
        }

        if (builder.serverType === "回国") {
            builder.outbound = "CN";
        }
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://home.yoyu.cc/subscribe/${id}/${token}/sip002/", Subscription]);
    }
}

export default new YoYuResolver();
