import Resolver from "../resolver";
import { ServerBuilder } from "../server";

const YTOOServerTypes: string[] = ['日用', 'BGP', 'Test', 'None'];

class YTOOResolver extends Resolver {
    constructor() {
        super("YTOO", YTOOServerTypes);
    }

    public resolve(builder: ServerBuilder): void {
        super.resolve(builder);
        const matches = builder.name.match(/\((\d\.\d)\)$/);
        if (matches != null) {
            builder.multiplier = matches[1];
        }

        const tagMatcher = builder.name.match(/-(\w+)-/);
        if (tagMatcher != null) {
            builder.tag = tagMatcher[1];
        }
    }
}

export default new YTOOResolver();
