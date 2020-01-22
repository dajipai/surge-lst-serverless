import Resolver from "../resolver";

const ConairServerTypes: string[] = ["南北互通", "專綫", "回國", "BGP"];

class ConairResolver extends Resolver {
    constructor() {
        super("Conair", ConairServerTypes);
    }
}

export default new ConairResolver();
