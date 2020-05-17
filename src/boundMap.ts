export class BoundMap {
    private readonly boundSet: Array<[string, string]>;

    constructor(boundSet: Array<[string, string]>) {
        this.boundSet = boundSet;
    }

    match(name: string): string | undefined {
        for (let [keyword, bound] of this.boundSet) {
            if (name.includes(keyword)) {
                return bound;
            }
        }
    }

    static newBuilder(): BoundMapBuilder {
        return new BoundMapBuilder();
    }
}

class BoundMapBuilder {
    private boundMap: Map<string,string>;

    constructor() {
        this.boundMap = new Map();
    }

    register(name: string, bound: string): BoundMapBuilder {
        let existedVal = this.boundMap.get(name);
        if (existedVal !== undefined && existedVal !== bound) {
            throw new Error("bound entry conflict!");
        }
        this.boundMap.set(name, bound);
        return this;
    }

    registerMap(plainMap: {[key: string]: string}): BoundMapBuilder {
        for (let key in plainMap) {
            this.register(key, plainMap[key]);
        }
        return this;
    }

    build(): BoundMap {
        const sortedBoundSet = Array.from(this.boundMap);
        sortedBoundSet.sort(([key1, _val1], [key2, _val2]) => key2.length - key1.length);
        return new BoundMap(sortedBoundSet);
    }
}

export const commonInboundsMap = BoundMap.newBuilder()
                            .register("上海", "SH")
                            .register("北京", "BJ")
                            .register("杭州", "HZ")
                            .register("深圳", "SZ")
                            .register("青岛", "QD")
                            .register("青島", "QD")
                            .register("沪", "SH")
                            .register("深", "SZ") 
                            .register("杭", "HZ")
                            .register("川", "CD")
                            .register("京", "BJ")
                            .register("无锡", "WX")
                            .register("呼", "HHHT")
                            .register("成都", "CD")
                            .register("穗", "GZ")
                            .register("筑", "GY")
                            .register("广州", "GZ")
                            .register("东莞", "DG")
                            .register("江苏", "JS")
                            .register("武汉", "WH")
                            .register("广西", "GX")
                            .register("重庆", "CQ")
                            .register("辽宁", "LN").build();

export const commonOutboundsMap = BoundMap.newBuilder()
                            .registerMap({ 英国: "UK", 台湾: "TW", 日本: "JP", 新加坡: "SG", 美国: "US", 香港: "HK", 土耳其: "TR", 澳大利亚: "AU", 印度: "IN", 加拿大: "CA" })
                            .registerMap({ 台灣: "TW", 台湾: "TW", 日本: "JP", 新加坡: "SG", 美國: "US", 香港: "HK", 韓國: "KR", 韩国: "KR", 加拿大: "CA", 土耳其: "TR", 俄羅斯: "RU", 印度: "IN", 法國: "FR", 德國: "DE", 阿根廷: "AR", 英國: "UK", 尼德蘭: "NL", 泰国: "TH", 泰國: "TH"})
                            .registerMap({ 
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
                                费利蒙: "US",
                                米兰: "IT",
                            })
                            .registerMap({ Taiwan: "TW", America: "US", Japan: "JP", "Hong Kong": "HK", Singapore: "SG"})
                            .registerMap({ 台湾: "TW", 德国: "DE", 日本: "JP", 狮城: "SG", 美国: "US", 香港: "HK", 港: "HK", 韩国: "KR", 伦敦: "UK", 东京: "JP", 首尔: "KR", 土耳其: "TR", 印度: "IN", 阿根廷: "AR" })
                            .registerMap({ 俄罗斯: "RU", 德国: "DE", 美国: "US", 香港: "HK", 台湾: "TW", 德: "DE", 新: "SG", 港: "HK", 美: "US", 日: "JP", 韩: "KR", 英: "UK", 台: "TW"})
                            .registerMap({ 台: "TW", 德: "DE", 日: "JP", 美: "US", 港: "HK", 韩: "KR", 新: "SG", 俄罗斯: "RU", 台湾: "TW", 日本: "JP", 香港: "HK", 菲律宾: "PH", 狮城: "SG"})
                            .registerMap({ USA: "US", Germany: "DE", Korea: "KR", Netherlands: "NL", Russia: "RU", France: "FR", "United Kingdom": "UK", Turkey: "TR", Thailand: "TH", Canada: "CA", Sydney: "AU", "United Arab Emirates": "AE", India: "IN", Brazil: "BR", Ireland: "IE", "South Africa": "ZA", Sweden: "SE", Malaysia: "MY" })
                            .register("墨西哥", "MX")
                            .register("意大利", "IT")
                            .register("意国", "IT")
                            .register("義大利", "IT")
                            .register("西班牙", "ES")
                            .build();