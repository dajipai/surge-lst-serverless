export interface Proxy {
}

export class ShadowsocksProxy implements Proxy {
    readonly host: string;
    readonly port: number;
    readonly password: string;
    readonly encryptionMethod: string;
    readonly obfs?: string;
    readonly obfsHost?: string;
    udpRelay: boolean;

    constructor(host: string, port: number, password: string, encryptionMethod: string, obfs?: string, obfsHost?: string, udpRelay: boolean = false) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.encryptionMethod = encryptionMethod;
        this.obfs = obfs;
        this.obfsHost = obfsHost;
        this.udpRelay = udpRelay;
    }
}

export class ShadowsocksRProxy implements Proxy {
    readonly host: string;
    readonly port: number;
    readonly password: string;
    readonly encryptionMethod: string;
    readonly protocol: string;
    readonly protoParameter?: string;
    readonly obfs: string;
    readonly obfsParameter?: string;
    readonly udpRelay: boolean;
    readonly group?: string;

    constructor(host: string, port: number, password: string, encryptionMethod: string, protocol: string, obfs: string, group?: string, obfsParameter?: string, protoParameter?: string, udpRelay: boolean = false) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.encryptionMethod = encryptionMethod;
        this.protocol = protocol;
        this.protoParameter = protoParameter;
        this.obfs = obfs;
        this.obfsParameter = obfsParameter;
        this.udpRelay = udpRelay;
        this.group = group;
    }

    compatibleWithSS(): Boolean {
        // if `protocol` is origin, obfs must be plain
        if ((this.protocol === 'origin' || 
            this.protocol === 'verify_sha1' ||
            this.protocol === 'auth_sha1' || 
            this.protocol === 'auth_sha1_v2' || 
            this.protocol === 'auth_sha1_v4') && 
            (this.obfs === 'plain'|| 
            this.obfs === 'http_simple' ||
            this.obfs === 'http_post' || 
            this.obfs === 'random_head')) {
            return true;
        }
        return false;
    }

    toShadowsocksProxy() : ShadowsocksProxy {
        // since obfs == plain, it is off
        return new ShadowsocksProxy(this.host, this.port, this.password, this.encryptionMethod, undefined, undefined, this.udpRelay);
    }
}

export class V2rayProxy implements Proxy {
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly wsPath: string;
    readonly ws: boolean;
    readonly tls: boolean;
    readonly obfsHost?: string;
    readonly wsHeaders: {[key: string]: string};

    constructor(host: string, port: number, username: string, ws: boolean, tls: boolean, wsPath: string, obfsHost?: string, wsHeaders?: {[key: string]: string}) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.ws = ws;
        this.tls = tls;
        this.wsPath = wsPath;
        this.obfsHost = obfsHost;
        this.wsHeaders = wsHeaders ?? {};
        if (this.obfsHost) {
            this.wsHeaders['Host'] = this.obfsHost;
        }
    }

    get headers(): string {
        return this.wsHeaders ? Object.keys(this.wsHeaders).map((key) => `${key}:${this.wsHeaders[key]}`).join("|") : ""
    }

    // helpers
    get method(): string {
        if (this.ws == true) {
            return "chacha20-ietf-poly1305";
        }
        return "none;"
    }
}

export class Direct implements Proxy {
}

export class Reject implements Proxy {
}

export class RejectTinyPNG implements Proxy {
}

// TODO: To be implemented
export class HttpProxy implements Proxy {
}

export class ExternalProxy implements Proxy {
}