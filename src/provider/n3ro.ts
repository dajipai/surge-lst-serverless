import Resolver from "../resolver";

const N3roServerTypes: string[] = ["CN2", "IPLC", "中继", "TOCN"];

class N3roResolver extends Resolver {
    constructor() {
        super("N3RO", N3roServerTypes);
    }
}

export default new N3roResolver();
