import Resolver from "../resolver";
import { ProxiesInput, SurgeProfile } from "../input";

const TempestServerTypes: string[] = ["实验性 IEPL", "Magic IEPL", "高级 IEPL", "标准 IEPL", "CN2"];

class TempestServerTypesResolver extends Resolver {
    constructor() {
        super("Tempest", TempestServerTypes);
    }

    providerTemplates(): Array<[string, new () => ProxiesInput]> {
        return new Array(["https://api.rixcloud.io/v2/common/service/${id}/portal/surge3?DoH=true&auth=${token}", SurgeProfile]);
    }
}

export default new TempestServerTypesResolver();
