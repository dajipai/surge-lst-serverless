import Resolver from "../resolver";

const BoslifeServerTypes = ["中转"];

class BoslifeResolver extends Resolver {
    constructor() {
        super("Boslife", BoslifeServerTypes);
    }
}

export default new BoslifeResolver();
