import { Software } from ".";
import { Proxy, V2rayProxy, ShadowsocksProxy } from "../proxy";
import { safeDump } from "js-yaml";
import ServerInfo from "../server";
import { getFlagFromAbbr } from "emoji-append";

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

 # vmess
 # cipher support auto/aes-128-gcm/chacha20-poly1305/none
 - name: "vmess"
   type: vmess
   server: server
   port: 443
   uuid: uuid
   alterId: 32
   cipher: auto
   # udp: true
   # tls: true
   # skip-cert-verify: true
   # network: ws
   # ws-path: /path
   # ws-headers:
   #   Host: v2ray.com
  */

const convertToClashProxy = (proxy: Proxy, name: string) : any => {
    if (proxy instanceof ShadowsocksProxy) {
        const defaultOutput = {
            name: name,
            type: "ss",
            server: proxy.host,
            port: proxy.port,
            cipher: proxy.encryptionMethod,
            password: proxy.password,
            udp: proxy.udpRelay
        };
        if (proxy.obfs) {
            return Object.assign({}, defaultOutput, {
                plugin: "obfs",
                "plugin-opts": {
                    mode: proxy.obfs,
                    host: proxy.obfsHost
                }
            });
        }
        return defaultOutput;
    } else if (proxy instanceof V2rayProxy) {
        const defaultOutput = {
            name: name,
            type: "vmess",
            server: proxy.host,
            port: proxy.port,
            uuid: proxy.username,
            cipher: "auto",
            tls: proxy.tls,
            alterId: 1,
        };
        if (proxy.ws) {
            return Object.assign({}, defaultOutput, {
                network: "ws",
                "ws-path": proxy.wsPath,
                "ws-headers": {
                    "Host": proxy.obfsHost
                }
            });
        }
        return defaultOutput;
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

    format(proxies: ServerInfo[], options: {[key: string]: any}) : string {
        const useEmoji : boolean = options["useEmoji"] ?? true;
        const clashProxies = proxies.map((server) => {
            if (useEmoji) {
                return convertToClashProxy(server.proxy, `${getFlagFromAbbr(server.outbound)} ${server.name}`);
            } else {
                return convertToClashProxy(server.proxy, server.name);
            }
        });
        return safeDump({proxies: clashProxies});
    }
}