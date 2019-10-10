export const getProxiesFromSurgeProfile = (content: string): Array<[string, string]> => {
    let proxies: Array<[string, string]> = [];
    const lines = content.split('\n');
    let inProxyContext = false;
    for (let line of lines) {
        line = line.trim();
        if (line === "") {
            // empty line
            continue;
        }

        if (line.startsWith(";") || line.startsWith("//") || line.startsWith("#")) {
            // comment
            continue;
        }

        if (line.startsWith("[") && line.endsWith("]")) {
            if (line === "[Proxy]") {
                inProxyContext = true;
            } else {
                inProxyContext = false;
            }
        }

        if (inProxyContext) {
            let pos = line.indexOf("=");
            if (pos < 0) {
                continue;
            }
            proxies.push([line.substr(0, pos).trimRight(), line.substr(pos + 1).trimLeft()]);
        }
    }
    return proxies;
}

export const getProxiesFromSurgeNodeList = (content: string): Array<[string, string]> => {
    return <Array<[string,string]>> (content.split('\n').filter((line) => {
        return !(line.trim() === "" || line.trim().startsWith(";") || line.trim().startsWith("//") || line.trim().startsWith("#"));
    }).map((line): [string,string]|null => {
        let pos = line.indexOf("=");
        if (pos < 0) {
            return null;
        }
        return [line.substr(0, pos).trimRight(), line.substr(pos + 1).trimLeft()];
    }).filter(ele => ele !== null) || []);
}