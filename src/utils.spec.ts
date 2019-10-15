import { getProxiesFromSurgeProfile, getProxiesFromSurgeNodeList } from "./utils";
import { Direct, HttpProxy, ExternalProxy, Reject, RejectTinyPNG, ShadowsocksProxy, V2rayProxy } from "./proxy";

const mockedProfile = `
#!MANAGED-CONFIG https://example.com/surge.conf interval=86400 strict=true

[General]
// General
http-listen = 0.0.0.0:8888
socks5-listen = 0.0.0.0:8889

external-controller-access = megrez@0.0.0.0:6170

internet-test-url = http://www.qualcomm.cn/generate_204
proxy-test-url = http://www.qualcomm.cn/generate_204

test-timeout = 3
ipv6 = false
show-error-page-for-reject = true

// DNS
dns-server = 117.50.10.10, 223.5.5.5, 114.114.114.114, 119.29.29.29, system

// Advanced
loglevel = notify
skip-proxy = 127.0.0.1, 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 100.64.0.0/10, 17.0.0.0/8, localhost, *.local, *.crashlytics.com
exclude-simple-hostnames = true
use-default-policy-if-wifi-not-primary = false

// Others
allow-wifi-access = true
enhanced-mode-by-rule = false
// network-framework = true

[Replica]
hide-apple-request = true
hide-crashlytics-request = true
hide-udp = false
keyword-filter-type = false

[Proxy]
Direct = direct
# > This is a comment
Local = http, 192.168.99.100, 32209, interface = vboxnet1
; Another comment

      
MAYING = external, exec = "/Users/megrez/Code/bin/clashR-darwin", local-port = 7891
// Also a comment
Ad-Block = reject
Ad-GIF = reject-tinygif

[Proxy Group]
Proxy = select, 🇭🇰 Dler | IPLC, Dler | SG+MO, YoYu, Boslife, RixCloud, Dajipai, MAYING, CONAIR, YTOO
`

const nodeListExample = `
Direct = direct
# > This is a comment
Local = http, 192.168.99.100, 32209, interface = vboxnet1
; Another comment

      
MAYING = external, exec = "/Users/megrez/Code/bin/clashR-darwin", local-port = 7891
// Also a comment
Ad-Block = reject
Ad-GIF = reject-tinygif
`

const ssNodeListExample = `
1 = ss, 1.2.3.4, 443, encrypt-method=aes-128-gcm, password=password
2 = ss, 1.2.3.4, 443, encrypt-method=aes-128-gcm, password=password
3 = ss, 1.2.3.4, 443, encrypt-method=chacha20-ietf-poly1305, password=password, obfs=tls, obfs-host=yunjiasu-cdn.net
4 = ss, 1.2.3.4, 443, encrypt-method=chacha20-ietf-poly1305, password=password, obfs=http, obfs-host=bing.com
`

const customLegacyNodeListExample = `
香港 - 中转 1 - 上海 = custom,1.2.3.4,12345,rc4-md5,password,https://raw.githubusercontent.com/ConnersHua/SSEncrypt/master/SSEncrypt.module
`

const customLegacyNodeListWithUDPRelay = `
專綫-上海-加拿大 = custom,1.2.3.4,12345,aes-128-cfb,password,udp-relay=true
`

const vmessExample = `
BGP-京韩-KT-A(0.2) = vmess, 1.2.3.4, 12345, username=user-name-example-uuid, ws=true, tls=false, ws-path=/
`


test("General Profile", () => {
    let proxies = getProxiesFromSurgeProfile(mockedProfile);
    expect(proxies.length).toBe(5);
    expect(proxies[0][0]).toEqual("Direct");
    expect(proxies[0][1]).toBeInstanceOf(Direct);
    expect(proxies[1][0]).toEqual("Local");
    expect(proxies[1][1]).toBeInstanceOf(HttpProxy);
    expect(proxies[2][0]).toEqual("MAYING");
    expect(proxies[2][1]).toBeInstanceOf(ExternalProxy);
    expect(proxies[3][0]).toEqual("Ad-Block");
    expect(proxies[3][1]).toBeInstanceOf(Reject);
    expect(proxies[4][0]).toEqual("Ad-GIF");
    expect(proxies[4][1]).toBeInstanceOf(RejectTinyPNG);
});

test("NodeList", () => {
    let proxies = getProxiesFromSurgeNodeList(nodeListExample);
    expect(proxies.length).toBe(5);
    expect(proxies[0][0]).toEqual("Direct");
    expect(proxies[0][1]).toBeInstanceOf(Direct);
    expect(proxies[1][0]).toEqual("Local");
    expect(proxies[1][1]).toBeInstanceOf(HttpProxy);
    expect(proxies[2][0]).toEqual("MAYING");
    expect(proxies[2][1]).toBeInstanceOf(ExternalProxy);
    expect(proxies[3][0]).toEqual("Ad-Block");
    expect(proxies[3][1]).toBeInstanceOf(Reject);
    expect(proxies[4][0]).toEqual("Ad-GIF");
    expect(proxies[4][1]).toBeInstanceOf(RejectTinyPNG);
});

test("ssNodeList", () => {
    let proxies = getProxiesFromSurgeNodeList(ssNodeListExample);
    expect(proxies.length).toBe(4);
    expect(proxies[0][0]).toEqual("1");
    expect(proxies[0][1]).toBeInstanceOf(ShadowsocksProxy);
    expect(proxies[0][1]).toStrictEqual(new ShadowsocksProxy("1.2.3.4", 443, "password", "aes-128-gcm"));
    expect(proxies[1][0]).toEqual("2");
    expect(proxies[1][1]).toBeInstanceOf(ShadowsocksProxy);
    expect(proxies[1][1]).toStrictEqual(new ShadowsocksProxy("1.2.3.4", 443, "password", "aes-128-gcm"));
    expect(proxies[2][0]).toEqual("3");
    expect(proxies[2][1]).toBeInstanceOf(ShadowsocksProxy);
    expect(proxies[2][1]).toStrictEqual(new ShadowsocksProxy("1.2.3.4", 443, "password", "chacha20-ietf-poly1305", "tls", "yunjiasu-cdn.net"));
    expect(proxies[3][0]).toEqual("4");
    expect(proxies[3][1]).toBeInstanceOf(ShadowsocksProxy);
    expect(proxies[3][1]).toStrictEqual(new ShadowsocksProxy("1.2.3.4", 443, "password", "chacha20-ietf-poly1305", "http", "bing.com"));
});

test("legacySSNodeList", () => {
    let proxies = getProxiesFromSurgeNodeList(customLegacyNodeListExample);
    expect(proxies.length).toBe(1);
    expect(proxies[0][0]).toEqual("香港 - 中转 1 - 上海");
    expect(proxies[0][1]).toBeInstanceOf(ShadowsocksProxy);
    expect(proxies[0][1]).toStrictEqual(new ShadowsocksProxy("1.2.3.4", 12345, "password", "rc4-md5"));
});

test("legacySSNodeListUDP", () => {
    let proxies = getProxiesFromSurgeNodeList(customLegacyNodeListWithUDPRelay);
    expect(proxies.length).toBe(1);
    expect(proxies[0][0]).toEqual("專綫-上海-加拿大");
    expect(proxies[0][1]).toBeInstanceOf(ShadowsocksProxy);
    expect(proxies[0][1]).toStrictEqual(new ShadowsocksProxy("1.2.3.4", 12345, "password", "aes-128-cfb", undefined, undefined, true));
})

test("legacyVmess", () => {
    let proxies = getProxiesFromSurgeNodeList(vmessExample);
    expect(proxies.length).toBe(1);
    expect(proxies[0][0]).toEqual("BGP-京韩-KT-A(0.2)");
    expect(proxies[0][1]).toBeInstanceOf(V2rayProxy);
    expect(proxies[0][1]).toStrictEqual(new V2rayProxy("1.2.3.4", 12345, "user-name-example-uuid", true, false, "/"));
})