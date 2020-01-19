import { Software } from ".";
import { Proxy, V2rayProxy, ShadowsocksProxy } from "../proxy";
import { safeDump } from "js-yaml";

/*
 *
 Proxy:
  # shadowsocks
  # The supported ciphers(encrypt methods):
  #   aes-128-gcm aes-192-gcm aes-256-gcm
  #   aes-128-cfb aes-192-cfb aes-256-cfb
  #   aes-128-ctr aes-192-ctr aes-256-ctr
  #   rc4-md5 chacha20-ietf xchacha20
  #   chacha20-ietf-poly1305 xchacha20-ietf-poly1305
  - name: "ss1"
    type: ss
    server: server
    port: 443
    cipher: chacha20-ietf-poly1305
    password: "password"
    # udp: true
  */

const convertToClashProxy = (proxy: Proxy, name: string) : any => {
    if (proxy instanceof ShadowsocksProxy) {
        return {
            name: name,
            type: "ss",
            server: proxy.host,
            port: proxy.port,
            cipher: proxy.encryptionMethod,
            password: proxy.password,
            udp: proxy.udpRelay
        };
    }
}

export class Clash implements Software {
    constructor() {
    }

    satisfies(proxy: Proxy) : boolean {
        if (proxy instanceof V2rayProxy) {
            return true;
        } else if (proxy instanceof ShadowsocksProxy) {
            return true;
        }
        return false;
    }

    format(proxy: Proxy, name: string) : string {
        return convertToClashProxy(proxy, name);
    }
}