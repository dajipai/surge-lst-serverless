import { readdirSync } from "fs";
import { join } from "path";
import Resolver from "../resolver";

const normalizedPath = join(__dirname);
const resolverMap : {[name: string]: Resolver} = {}

const __load_providers = () => {
    readdirSync(normalizedPath).filter((file) => "index.ts" !== file).forEach(file => {
        let module = require("./" + file);
        let resolver = module.default;
        if (resolver instanceof Resolver) {
            resolverMap[resolver.providerName.toLowerCase()] = resolver;
        }
    });
}

__load_providers();

export const findResolver = (name: string): Resolver|undefined => {
    console.log(resolverMap);
    return resolverMap[name.toLowerCase()];
}