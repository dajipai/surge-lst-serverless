import { parseSSRLink } from "./ssr";
import { ShadowsocksRProxy } from "../proxy";

// https://github.com/shadowsocksr-backup/shadowsocks-rss/wiki/SSR-QRcode-scheme
const ExampleSSR = "ssr://MTI3LjAuMC4xOjEyMzQ6YXV0aF9hZXMxMjhfbWQ1OmFlcy0xMjgtY2ZiOnRsczEuMl90aWNrZXRfYXV0aDpZV0ZoWW1KaS8_b2Jmc3BhcmFtPVluSmxZV3QzWVRFeExtMXZaUSZyZW1hcmtzPTVyV0w2Sy1WNUxpdDVwYUg";

const MayingHeaderSSR = "ssr://d3d3Lmdvb2dsZS5jb206MTphdXRoX2NoYWluX2E6Y2hhY2hhMjA6dGxzMS4yX3RpY2tldF9hdXRoOlluSmxZV3QzWVd4cy8_b2Jmc3BhcmFtPSZwcm90b3BhcmFtPSZyZW1hcmtzPTVZbXA1TDJaNXJXQjZZZVA3N3lhT1RrdU1UUWxJRGM1TXk0eE9FZEMmZ3JvdXA9NmEyRjViMng1cDZCNllDZg";

test("ssr example", () => {
    let [remark, server] = parseSSRLink(ExampleSSR);
    expect(remark).toBe("测试中文");
    expect(server).toStrictEqual(new ShadowsocksRProxy("127.0.0.1", 1234, "aaabbb", "aes-128-cfb", "auth_aes128_md5", "tls1.2_ticket_auth", undefined, "breakwa11.moe"));
});

test("maying header", () => {
    let [remark, server] = parseSSRLink(MayingHeaderSSR);
    expect(remark).toBe("剩余流量：99.14% 793.18GB");
    expect(server).toStrictEqual(new ShadowsocksRProxy("www.google.com", 1, "breakwall", "chacha20", "auth_chain_a", "tls1.2_ticket_auth", "魅影极速", "", ""));
});