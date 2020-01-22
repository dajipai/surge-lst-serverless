import { readdirSync } from "fs";
import { join } from "path";
import Resolver from "../resolver";

const normalizedPath = join(__dirname);
    
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