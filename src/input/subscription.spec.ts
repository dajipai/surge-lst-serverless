import Base64 from "js-base64";
import { ShadowsocksRProxy, ShadowsocksProxy } from "../proxy";
import { V2rayProxy } from "../proxy";
import { parseSSRLink, parseVmessLink, parseSIP002Link } from "./subscription";

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


const exampleJsonVmess = {
    "v": "2",
    "ps": "备注别名",
    "add": "111.111.111.111",
    "port": "32000",
    "id": "1386f85e-657b-4d6e-9d56-78badb75e1fd",
    "aid": "100",
    "net": "tcp",
    "type": "none",
    "host": "www.bbb.com",
    "path": "/",
    "tls": "tls"
};

const exampleMockYtooJsonVmess = {
    "add": "1.5.1.5",
    "host": "appleid.apple.com",
    "id": "1386f85e-657b-4d6e-9d56-78badb75e1fd",
    "net": "ws",
    "path": "\/",
    "port": "2333",
    "ps": "BGP-\u4eac\u5fb7-GIA-A(0.3)",
    "tls": "",
    "v": 2,
    "aid": 1,
    "type": "none"
};

const exampleMockAnrunJsonVmess = {
    "v": "2",
    "ps": "\ud83c\udded\ud83c\uddf0\u4e2d\u56fd\u9999\u6e2fBGP-13-\u5206\u5e03\u63a5\u5165-1.5x",
    "add": "www.example.com",
    "port": 2333,
    "id": "1386f85e-657b-4d6e-9d56-78badb75e1fd",
    "aid": 1,
    "net": "ws",
    "type": "none",
    "host": "",
    "path": "",
    "tls": ""
};

test("decode vmess link from wiki", () => {
    const [name, value] = parseVmessLink("vmess://" + Base64.encode(JSON.stringify(exampleJsonVmess)));
    expect(name).toBe("备注别名");
    expect(value).toBeInstanceOf(V2rayProxy);
    expect(value).toStrictEqual(new V2rayProxy("111.111.111.111", 32000, "1386f85e-657b-4d6e-9d56-78badb75e1fd", false, true, "/", "www.bbb.com"));
});

test("decode fake ytoo link", () => {
    const [name, value] = parseVmessLink("vmess://" + Base64.encode(JSON.stringify(exampleMockYtooJsonVmess)));
    expect(name).toBe("BGP-京德-GIA-A(0.3)");
    expect(value).toBeInstanceOf(V2rayProxy);
    expect(value).toStrictEqual(new V2rayProxy("1.5.1.5", 2333, "1386f85e-657b-4d6e-9d56-78badb75e1fd", true, false, "/", "appleid.apple.com"));
});

test("decode fake anrun link", () => {
    const [name, value] = parseVmessLink("vmess://" + Base64.encode(JSON.stringify(exampleMockAnrunJsonVmess)));
    expect(name).toBe("🇭🇰中国香港BGP-13-分布接入-1.5x");
    expect(value).toBeInstanceOf(V2rayProxy);
    expect(value).toStrictEqual(new V2rayProxy("www.example.com", 2333, "1386f85e-657b-4d6e-9d56-78badb75e1fd", true, false, "", ""));
    expect((value as V2rayProxy).wsPath).toEqual("/");
    expect((value as V2rayProxy).wsHeaders).toEqual({});
    expect((value as V2rayProxy).headers).toEqual("");
});

const SIP002example = "ss://Y2hhY2hhMjAtaWV0ZjpwYXNzd29yZA==@example.yoyu.xyz:12345#BGP%20%E5%8C%97%E4%BA%AC-%E7%BE%8E%E5%9B%BD%2001%20%5B0.3%5D";
const SIP002ExampleOBFS = `ss://${Base64.encode("chacha20-ietf:password")}@ss.example.com:12345?plugin=${encodeURIComponent("simple-obfs;obfs=http;obfs-host=www.baidu.com")}#Example123`;

test("SIP002 without obfs", () => {
    const [name, value] = parseSIP002Link(SIP002example);
    expect(name).toBe("BGP 北京-美国 01 [0.3]");
    expect(value).toBeInstanceOf(ShadowsocksProxy);
    expect(value).toStrictEqual(new ShadowsocksProxy("example.yoyu.xyz", 12345, "password", "chacha20-ietf"));
});

test("SIP002 without obfs", () => {
    const [name, value] = parseSIP002Link(SIP002ExampleOBFS);
    expect(name).toBe("Example123");
    expect(value).toBeInstanceOf(ShadowsocksProxy);
    expect(value).toStrictEqual(new ShadowsocksProxy("ss.example.com", 12345, "password", "chacha20-ietf", "http", "www.baidu.com"));
});
