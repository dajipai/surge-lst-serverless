"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import Server from "./server";
import { yoyuResolver, boslifeResolver, conairResolver, ytooResolver } from "./provider";
import { Base64 } from "js-base64";
import { ProxyContext, SurgeProfile, SurgeNodeList } from "./profile";

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
  const context = new ProxyContext(new SurgeNodeList());
  const result = await context.handle(`https://home.yoyu.cc/subscribe/${id}/${token}/node-list/`, event.multiValueQueryStringParameters, yoyuResolver, sortMethod);
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
  const context = new ProxyContext(new SurgeProfile());
  const result = await context.handle(`https://api.cn1.info/downloads/conf/${token}.conf`, event.multiValueQueryStringParameters, boslifeResolver, sortMethod);
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
  const context = new ProxyContext(new SurgeProfile());
  const result = await context.handle(`https://conair.me/link/${token}?mu=6`, event.multiValueQueryStringParameters, conairResolver, sortMethod);
  return {
    statusCode: 200,
    headers: {"content-type": "text/plain"},
    body: result
  };
}

export const ytoo: Handler<
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
  const sid = event.queryStringParameters.id;
  const sortMethod = event.queryStringParameters.sort ? event.queryStringParameters.sort.split(">").filter(Server.isValidComparator) : ["outbound"];
  const commonSubUrl = `https://ytoo.dev/modules/servers/V2raySocks/osubscribe.php?sid=${sid}&token=${token}`
  const commonSubUrlBase64 = Base64.encodeURI(commonSubUrl);
  const context = new ProxyContext(new SurgeNodeList());
  const result = await context.handle(`https://node.ytoo.site/api/v1/subtrans?url=${commonSubUrlBase64}&dest=surgenl`, event.multiValueQueryStringParameters, ytooResolver, sortMethod);
  return {
    statusCode: 200,
    headers: {"content-type": "text/plain"},
    body: result
  };
}