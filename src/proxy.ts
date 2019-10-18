export interface Proxy {
}

export class ShadowsocksProxy implements Proxy {
    readonly host: string;
    readonly port: number;
    readonly password: string;
    readonly encryptionMethod: string;
    readonly obfs?: string;
    readonly obfsHost?: string;
    readonly udpRelay: boolean;

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
}

export class V2rayProxy implements Proxy {
    readonly host: string;
    readonly port: number;
    readonly username: string;
    readonly wsPath: string;
    readonly ws: boolean;
    readonly tls: boolean;
    readonly obfsHost: string;
    readonly wsHeaders?: string;

    constructor(host: string, port: number, username: string, ws: boolean, tls: boolean, wsPath: string, obfsHost: string, wsHeaders?: string) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.ws = ws;
        this.tls = tls;
        this.wsPath = wsPath;
        this.obfsHost = obfsHost;
        this.wsHeaders = wsHeaders;
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