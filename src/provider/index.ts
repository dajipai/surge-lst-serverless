import { readdirSync } from "fs";
import { join } from "path";
import Resolver from "../resolver";

const normalizedPath = join(__dirname);

const commonInboundsMap = { 上海: "SH", 
                            北京: "BJ", 
                            杭州: "HZ", 
                            深圳: "SZ",
                            青岛: "QD",
                            青島: "QD", 
                            沪: "SH", 
                            深: "SZ", 
                            杭: "HZ", 
                            川: "CD", 
                            京: "BJ", 
                            无锡: "WX", 
                            呼: "HHHT", 
                            成都: "CD",
                            穗: "GZ",
                            筑: "GY",
                            广州: "GZ", 
                            东莞: "DG",
                            江苏: "JS",
                            武汉: "WH",
                            广西: "GX",
                            重庆: "CQ",
                            辽宁: "LN" };

const commonOutboundsMap = {
    英国: "UK", 台湾: "TW", 日本: "JP", 新加坡: "SG", 美国: "US", 香港: "HK", 土耳其: "TR", 澳大利亚: "AU", 印度: "IN", 加拿大: "CA",
    
};

class ProviderLoader {

    private resolverMap : {[name: string]: Resolver};

    constructor() {
        this.resolverMap = {};
        readdirSync(normalizedPath).filter((file) => "index.ts" !== file).forEach(file => {
            let module = require("./" + file);
            let resolver = module.default;
            if (resolver instanceof Resolver) {
                let providerName = resolver.providerName;
                if (this.resolverMap[resolver.providerName.toLowerCase()] !== undefined) {
                    throw new Error(`module ${providerName.toLowerCase()} has already been defined...`)
                }
                this.resolverMap[providerName.toLowerCase()] = resolver;
            }
        });
    }

    findResolver(name: string): Resolver|undefined {
        return this.resolverMap[name.toLowerCase()];
    }
}

export default new ProviderLoader();