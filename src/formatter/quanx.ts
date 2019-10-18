import { Formatter } from ".";
import { Proxy, ShadowsocksProxy, V2rayProxy, ShadowsocksRProxy } from "../proxy";


// refer to: https://github.com/ConnersHua/Profiles/blob/master/Quantumult/X/Pro.conf
export class QuantumultXFormatter implements Formatter {
    format(proxy: Proxy, name: string) : string {
        if (proxy instanceof ShadowsocksProxy) {
            // shadowsocks=ss-a.example.com:80, method=chacha20, password=pwd, obfs=http, obfs-host=bing.com, obfs-uri=/resource/file, fast-open=false, udp-relay=false, server_check_url=http://www.apple.com/generate_204, tag=Sample-A
            let res = `shadowsocks=${proxy.host}:${proxy.port},method=${proxy.encryptionMethod},password=${proxy.password}`;
            if (proxy.obfs !== undefined) {
               res += `,obfs=${proxy.obfs},obfs-host=${proxy.obfsHost}`;
            }
            if (proxy.udpRelay) {
                res += ",udp-relay=true";
            }
            res += `,fast-open=false,tag=${name}`
            return res;
        } else if (proxy instanceof V2rayProxy) {
            let obfs = "";
            if (proxy.tls && proxy.ws) {
                obfs = "wss";
            } else if (proxy.tls) {
                obfs = "over-tls";
            } else if (proxy.ws) {
                obfs = "ws";
            } else {
                return `vmess=${proxy.host}:${proxy.port},method=${proxy.method},password=${proxy.username},fast-open=false,udp-relay=false,tag=${name}`;
            }
            return `vmess=${proxy.host}:${proxy.port},method=${proxy.method},password=${proxy.username},obfs-host=${proxy.obfsHost},obfs=${obfs},obfs-uri=${proxy.wsPath},fast-open=false,udp-relay=false,tag=${name}`;
        } else if (proxy instanceof ShadowsocksRProxy) {
            // shadowsocks=ssr-a.example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, ssr-protocol-param=def, obfs=tls1.2_ticket_fastauth, obfs-host=bing.com, tag=Sample-D
            let res = `shadowsocks=${proxy.host}:${proxy.port},method=${proxy.encryptionMethod},password=${proxy.password},ssr-protocol=${proxy.protocol},obfs=${proxy.obfs}`;
            if (proxy.obfsParameter) {
                res += `,obfs-host=${proxy.obfsParameter}`;
            }
            if (proxy.protoParameter) {
                res += `,ssr-protocol-param=${proxy.protoParameter}`;
            }
            res += `,tag=${name}`;
            return res;
        }
        throw new Error("the proxy type is not supported by Quantumult");
    }
}