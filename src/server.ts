import Resolver from "./resolver";

class ServerInfo {
    readonly name: string;
    readonly value: string;
    readonly provider: string;
    readonly serverType: string;
    readonly inbound: string;
    readonly outbound: string;
    readonly multiplier: string;

    constructor(name: string, value: string, provider: string, serverType: string, inbound: string, outbound: string, multiplier: string = "1.0") {
        this.name = name;
        this.value = value;
        this.provider = provider;
        this.serverType = serverType;
        this.inbound = inbound;
        this.outbound = outbound;
        this.multiplier = multiplier;
    }

    static isValidComparator(key: string): boolean {
        return ["inbound", "outbound", "serverType"].includes(key);
    }
}

export class ServerBuilder {
    name: string;
    value: string;
    private _provider: string;
    private _serverType: string;
    private _inbound: string;
    private _outbound: string;
    private _multiplier: string;

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
        this._serverType = "";
        this._provider = "unknown";
        this._inbound = "";
        this._outbound = "";
        this._multiplier = "1.0";
    }

    withResolver(resolver: Resolver) {
        resolver.resolve(this);
        return this;
    }

    set provider(value: string) {
        this._provider = value;
    }

    set serverType(value: string) {
        this._serverType = value;
    }

    set inbound(value: string) {
        this._inbound = value;
    }

    set outbound(value: string) {
        this._outbound = value;
    }

    set multiplier(value: string) {
        this._multiplier = value;
    }

    build() {
        return new ServerInfo(this.name, 
            this.value, 
            this._provider, 
            this._serverType,
            this._inbound,
            this._outbound,
            this._multiplier);
    }
}

export default ServerInfo
