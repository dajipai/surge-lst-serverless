import ServerInfo from "../server";

export interface Formatter {
    format(proxies: ServerInfo[], options: {[key: string]: any}) : string
}