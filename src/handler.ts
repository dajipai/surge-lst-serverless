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
import { Result, Ok, Err } from "@usefultools/monads";
import { ValidationError } from "./validator";
import { V2raySubscription } from "./formatter/v2ray";

export const yoyu: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {token, id, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(id).isEmpty()) {
      return Err(ValidationError.create(400, "id cannot be empty"));
    }
    const context = new ProxyContext(new SurgeNodeList());
    const result = await context.handle(`https://home.yoyu.cc/subscribe/${id}/${token}/node-list/`, multiValueQueryStringParameters, yoyuResolver, sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};

export const boslife: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {token, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    const context = new ProxyContext(new SurgeProfile());
    const result = await context.handle(`https://api.cn1.info/downloads/conf/${token}.conf`, multiValueQueryStringParameters, boslifeResolver, sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};

export const conair: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {token, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) return Err(ValidationError.create(400, "token cannot be empty"));
    const context = new ProxyContext(new SurgeProfile());
    const result = await context.handle(`https://conair.me/link/${token}?mu=6`, multiValueQueryStringParameters, conairResolver, sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};

export const ytoo: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {token, id, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(id).isEmpty()) {
      return Err(ValidationError.create(400, "id cannot be empty"));
    }
    const context = new ProxyContext(new V2raySubscription());
    const result = await context.handle(`https://ytoo.dev/modules/servers/V2raySocks/osubscribe.php?sid=${id}&token=${token}`, multiValueQueryStringParameters, ytooResolver, sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};