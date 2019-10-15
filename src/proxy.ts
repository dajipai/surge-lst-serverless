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

export class V2rayProxy implements Proxy {

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
