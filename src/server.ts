import Resolver from "./resolver";
import { Proxy } from "./proxy";
import { Union, Literal } from "runtypes";

export type AllowSortedKeys = "name" | "inbound" | "outbound" | "serverType";
export type FromServerInfoKeys = { [k in AllowSortedKeys]: string };

const ServerInfoKeyUnion = Union(
    Literal('name'),
    Literal('inbound'),
    Literal('outbound'),
    Literal('serverType'),
);

class ServerInfo {
    readonly name: string;
    readonly proxy: Proxy;
    readonly provider: string;
    readonly serverType: string;
    readonly inbound: string;
    readonly outbound: string;
    readonly multiplier: string;
    readonly tags: string[];

    constructor(name: string, proxy: Proxy, provider: string, serverType: string, inbound: string, outbound: string, multiplier: string = "1.0", tags: string[] = []) {
        this.name = name;
        this.proxy = proxy;
        this.provider = provider;
        this.serverType = serverType;
        this.inbound = inbound;
        this.outbound = outbound;
        this.multiplier = multiplier;
        this.tags = tags;
    }

    get priority(): number {
        if (this.inbound === "" && this.outbound === "" && this.serverType === "") {
            // make remarks the first place
            return Infinity;
        }
        return 0;
    }

    static isValidComparator(key: string): key is AllowSortedKeys {
        if (ServerInfoKeyUnion.guard(key)) {
            return true;
        }
        return false;
    }
}

export class ServerBuilder {
    name: string;
    proxy: Proxy;
    private _provider: string;
    private _serverType: string;
    private _inbound: string;
    private _outbound: string;
    private _multiplier: string;
    private _tags: string[];

    constructor(name: string, proxy: Proxy) {
        this.name = name;
        this.proxy = proxy;
        this._serverType = "";
        this._provider = "unknown";
        this._inbound = "";
        this._outbound = "";
        this._multiplier = "1.0";
        this._tags = [];
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

    get serverType(): string {
        return this._serverType;
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

    set tag(tag: string) {
        this._tags.push(tag);
    }

    build() {
        return new ServerInfo(this.name, 
            this.proxy, 
            this._provider, 
            this._serverType,
            this._inbound,
            this._outbound,
            this._multiplier,
            this._tags);
    }
}

export default ServerInfo
