import Resolver from "../resolver";

const ConairInboundsMap: {[key: string]: string} = { 上海: "SH", 北京: "BJ", 杭州: "HZ", 深圳: "SZ", 青島: "QD"};
const ConairOutboundsMap: {[key: string]: string} = { 台灣: "TW", 台湾: "TW", 日本: "JP", 新加坡: "SG", 美國: "US", 香港: "HK", 韓國: "KR", 韩国: "KR", 加拿大: "CA", 土耳其: "TR", 俄羅斯: "RU", 印度: "IN", 法國: "FR", 德國: "DE", 阿根廷: "AR", 英國: "UK", 尼德蘭: "NL", 泰国: "TH", 泰國: "TH"};
const ConairServerTypes: string[] = ["南北互通", "專綫", "回國"];

class ConairResolver extends Resolver {
    constructor() {
        super(ConairInboundsMap, ConairOutboundsMap, ConairServerTypes, "Conair");
    }
}

export default new ConairResolver();
