"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda"
import axios from "axios";
import ini from "ini";
import { OrderedMap, List } from "immutable";
import Server, { ServerBuilder } from "./server";
import yoyuResolver from "./yoyu";
import boslifeResolver from "./boslife";
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
  }: {[name: string]: string[]}, resolver: Resolver) => {
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
  }).valueSeq().map((server) => {
    return `${addFlag(server.name)} = ${server.value}`
  }).sort((a, b) => {
    return a.localeCompare(b, "pinyin");
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
  event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {}
  const token = event.queryStringParameters.token;
  const id = event.queryStringParameters.id;
  const result = await handle(`https://home.yoyu.cc/subscribe/${id}/${token}/surge3/`, event.multiValueQueryStringParameters, yoyuResolver);
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
  event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {}
  const token = event.queryStringParameters.token;
  const result = await handle(`https://api.cn1.info/downloads/conf/${token}.conf`, event.multiValueQueryStringParameters, boslifeResolver);
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
  event.multiValueQueryStringParameters = event.multiValueQueryStringParameters || {}
  const token = event.queryStringParameters.token;
  const result = await handle(`https://conair.me/link/${token}?mu=6`, event.multiValueQueryStringParameters, boslifeResolver);
  return {
    statusCode: 200,
    headers: {"content-type": "text/plain"},
    body: result
  };
}