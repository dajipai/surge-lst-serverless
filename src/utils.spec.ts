import { getProxiesFromSurgeProfile, getProxiesFromSurgeNodeList } from "./utils";

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


test("Profile", () => {
    let proxies = getProxiesFromSurgeProfile(mockedProfile);
    expect(proxies.length).toBe(5);
    expect(proxies[0]).toStrictEqual(["Direct", "direct"]);
    expect(proxies[1]).toStrictEqual(["Local", "http, 192.168.99.100, 32209, interface = vboxnet1"]);
    expect(proxies[2]).toStrictEqual(["MAYING", "external, exec = \"/Users/megrez/Code/bin/clashR-darwin\", local-port = 7891"]);
    expect(proxies[3]).toStrictEqual(["Ad-Block", "reject"]);
    expect(proxies[4]).toStrictEqual(["Ad-GIF", "reject-tinygif"]);
});

test("NodeList", () => {
    let proxies = getProxiesFromSurgeNodeList(nodeListExample);
    expect(proxies.length).toBe(5);
    expect(proxies[0]).toStrictEqual(["Direct", "direct"]);
    expect(proxies[1]).toStrictEqual(["Local", "http, 192.168.99.100, 32209, interface = vboxnet1"]);
    expect(proxies[2]).toStrictEqual(["MAYING", "external, exec = \"/Users/megrez/Code/bin/clashR-darwin\", local-port = 7891"]);
    expect(proxies[3]).toStrictEqual(["Ad-Block", "reject"]);
    expect(proxies[4]).toStrictEqual(["Ad-GIF", "reject-tinygif"]);
});