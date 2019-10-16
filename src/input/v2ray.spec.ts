import { parseVmessLinkToSurgeNodeList } from "./v2ray";
import { V2rayProxy } from "../proxy";

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
    "add":"1.5.1.5",
    "host":"appleid.apple.com",
    "id":"1386f85e-657b-4d6e-9d56-78badb75e1fd",
    "net":"ws",
    "path":"\/",
    "port":"2333",
    "ps":"BGP-\u4eac\u5fb7-GIA-A(0.3)",
    "tls":"",
    "v":2,
    "aid":1,
    "type":"none"
};

test("decode vmess link from wiki", () => {
    let [name, value] = parseVmessLinkToSurgeNodeList("vmess://" + Base64.encode(JSON.stringify(exampleJsonVmess)));
    expect(name).toBe("备注别名");
    expect(value).toBeInstanceOf(V2rayProxy);
    expect(value).toStrictEqual(new V2rayProxy("111.111.111.111", 32000, "1386f85e-657b-4d6e-9d56-78badb75e1fd", false, true, "/", "www.bbb.com"));
});

test("decode fake ytoo link", () => {
    let [name, value] = parseVmessLinkToSurgeNodeList("vmess://" + Base64.encode(JSON.stringify(exampleMockYtooJsonVmess)));
    expect(name).toBe("BGP-京德-GIA-A(0.3)");
    expect(value).toBeInstanceOf(V2rayProxy);
    expect(value).toStrictEqual(new V2rayProxy("1.5.1.5", 2333, "1386f85e-657b-4d6e-9d56-78badb75e1fd", true, false, "/", "appleid.apple.com"));
})