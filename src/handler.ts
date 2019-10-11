"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { yoyuResolver, boslifeResolver, conairResolver, ytooResolver } from "./provider";
import { Base64 } from "js-base64";
import { ProxyContext, SurgeProfile, SurgeNodeList } from "./profile";
import { SurgeNodeListInterceptor } from "./interceptor";

export const yoyu: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async ({token, id, sortMethod, multiValueQueryStringParameters}) : Promise<APIGatewayProxyResult> => {
    const context = new ProxyContext(new SurgeNodeList());
    const result = await context.handle(`https://home.yoyu.cc/subscribe/${id}/${token}/node-list/`, multiValueQueryStringParameters, yoyuResolver, sortMethod);
    return {
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    };
  });
};

export const boslife: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async ({token, sortMethod, multiValueQueryStringParameters}) : Promise<APIGatewayProxyResult> => {
    const context = new ProxyContext(new SurgeProfile());
    const result = await context.handle(`https://api.cn1.info/downloads/conf/${token}.conf`, multiValueQueryStringParameters, boslifeResolver, sortMethod);
    return {
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    };
  });
};

export const conair: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async ({token, sortMethod, multiValueQueryStringParameters}) : Promise<APIGatewayProxyResult> => {
    const context = new ProxyContext(new SurgeProfile());
    const result = await context.handle(`https://conair.me/link/${token}?mu=6`, multiValueQueryStringParameters, conairResolver, sortMethod);
    return {
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    };
  });
};

export const ytoo: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async ({id, token, sortMethod, multiValueQueryStringParameters}) : Promise<APIGatewayProxyResult> => {
    const commonSubUrl = `https://ytoo.dev/modules/servers/V2raySocks/osubscribe.php?sid=${id}&token=${token}`
    const commonSubUrlBase64 = Base64.encodeURI(commonSubUrl);
    const context = new ProxyContext(new SurgeNodeList());
    const result = await context.handle(`https://node.ytoo.site/api/v1/subtrans?url=${commonSubUrlBase64}&dest=surgenl`, multiValueQueryStringParameters, ytooResolver, sortMethod);
    return {
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    };
  });
};