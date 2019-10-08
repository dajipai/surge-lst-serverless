"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import axios from "axios";
import ini from "ini";
import { OrderedMap, List } from "immutable";
import Server, { ServerBuilder } from "./server";
import yoyuResolver from "./yoyu";
import boslifeResolver from "./boslife";
import conairResolver from "./conair";
import { addFlag } from "emoji-append";
import Resolver from "./resolver";

const handle = async (url: string, {
    inbound: inboundFilters = [],
    outbound: outboundFilters = [],
    multiplier: multiplierFilters = [],
    serverType: serverTypeFilters = [],
    // filterNot
    noInbound: noInboundFilters = [],
    noOutbound: noOutboundFilters = [],
    noMultiplier: noMultiplierFilters = [],
    noServerType: noServerTypeFilters = [],
  }: {[name: string]: string[]}, resolver: Resolver, sortMethod: string[]) => {
  let resp = await axios.get(url);
  const config : {[key: string]: Iterable<[string, string]>} = ini.decode(resp.data);
  const proxies: OrderedMap<string,Server> = OrderedMap<string,string>(config.Proxy).map((value, name) => {
    return (new ServerBuilder(name, value)).withResolver(resolver).build();
  }).filter(resolver.defaultFilter());
  return proxies.filter((server) => {
    return List<string>([server.inbound, server.outbound, server.multiplier, server.serverType])
      .zip<string[]>(List([inboundFilters, outboundFilters, multiplierFilters, serverTypeFilters]))
      .every(([property, filter]) => {
        if (filter.length == 0) {
          return true;
        }
        return filter.includes(property);
      });
  }).filterNot((server) => {
    return List<string>([server.inbound, server.outbound, server.multiplier, server.serverType])
      .zip<string[]>(List([noInboundFilters, noOutboundFilters, noMultiplierFilters, noServerTypeFilters]))
      .some(([property, filter]) => {
        if (filter.length == 0) {
          return false;
        }
        return filter.includes(property);
      });
  }).valueSeq().sort((a, b) => {
    return List(sortMethod).map((key) => {
      return <number>(<string>(<any>a)[key]).localeCompare(<string>(<any>b)[key]);
    }).filterNot(x => x === 0).first(a.name.localeCompare(b.name, "pinyin"));
  }).map((server) => {
    return `${addFlag(server.name)} = ${server.value}`
  }).toArray().join("\n");
}

export const yoyu: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  if (!event.queryStringParameters) {
    return {
      statusCode: 400,
      body: "invalid parameters"
    }
  }
  event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {};
  const token = event.queryStringParameters.token;
  const id = event.queryStringParameters.id;
  const sortMethod = event.queryStringParameters.sort ? event.queryStringParameters.sort.split(">").filter(Server.isValidComparator) : ["outbound"];
  const result = await handle(`https://home.yoyu.cc/subscribe/${id}/${token}/surge3/`, event.multiValueQueryStringParameters, yoyuResolver, sortMethod);
  return {
    statusCode: 200,
    headers: {"content-type": "text/plain"},
    body: result
  };
};

export const boslife: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  if (!event.queryStringParameters) {
    return {
      statusCode: 400,
      body: "invalid parameters"
    }
  }
  event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {};
  const token = event.queryStringParameters.token;
  const sortMethod = event.queryStringParameters.sort ? event.queryStringParameters.sort.split(">").filter(Server.isValidComparator) : ["outbound"];
  const result = await handle(`https://api.cn1.info/downloads/conf/${token}.conf`, event.multiValueQueryStringParameters, boslifeResolver, sortMethod);
  return {
    statusCode: 200,
    headers: {"content-type": "text/plain"},
    body: result
  };
}

export const conair: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  if (!event.queryStringParameters) {
    return {
      statusCode: 400,
      body: "invalid parameters"
    }
  }
  event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {};
  const token = event.queryStringParameters.token;
  const sortMethod = event.queryStringParameters.sort ? event.queryStringParameters.sort.split(">").filter(Server.isValidComparator) : ["outbound"];
  const result = await handle(`https://conair.me/link/${token}?mu=6`, event.multiValueQueryStringParameters, conairResolver, sortMethod);
  return {
    statusCode: 200,
    headers: {"content-type": "text/plain"},
    body: result
  };
}