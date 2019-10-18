"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { yoyuResolver, boslifeResolver, conairResolver, ytooResolver } from "./provider";
import { ProxyContext } from "./profile";
import { SurgeProfile, SurgeNodeList, Subscription } from "./input";
import { SurgeNodeListInterceptor } from "./interceptor";
import { Result, Ok, Err } from "@usefultools/monads";
import { ValidationError } from "./validator";

export const yoyu: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {output, token, id, sortMethod, useEmoji, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(id).isEmpty()) {
      return Err(ValidationError.create(400, "id cannot be empty"));
    }
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new SurgeNodeList(), output);
    const result = await context.handle(`https://home.yoyu.cc/subscribe/${id}/${token}/node-list/`, multiValueQueryStringParameters, yoyuResolver, sortMethod, useEmoji === "true");
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
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {output, token, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new SurgeProfile(), output);
    const result = await context.handle(`https://api.cn1.info/downloads/conf/${token}.conf`, multiValueQueryStringParameters, boslifeResolver, sortMethod, useEmoji === "true");
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
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {output, token, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) return Err(ValidationError.create(400, "token cannot be empty"));
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new SurgeProfile(), output);
    const result = await context.handle(`https://conair.me/link/${token}?mu=6`, multiValueQueryStringParameters, conairResolver, sortMethod, useEmoji === "true");
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
  return await new SurgeNodeListInterceptor().process(event, async (interceptor, {output, token, id, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(id).isEmpty()) {
      return Err(ValidationError.create(400, "id cannot be empty"));
    }
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new Subscription(), output);
    const result = await context.handle(`https://ytoo.dev/modules/servers/V2raySocks/osubscribe.php?sid=${id}&token=${token}`, multiValueQueryStringParameters, ytooResolver, sortMethod, useEmoji === "true");
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};