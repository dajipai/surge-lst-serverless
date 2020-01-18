"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { yoyuResolver, boslifeResolver, conairResolver, ytooResolver, mayingResolver, n3roResolver } from "./provider";
import { ProxyContext } from "./profile";
import { SurgeProfile, SSDSubscription, Subscription } from "./input";
import { NodeListInterceptor } from "./interceptor";
import { Result, Ok, Err } from "@usefultools/monads";
import { ValidationError } from "./validator";

export const yoyu: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new NodeListInterceptor("yoyu").process(event, async (interceptor, {output, token, id, sortMethod, useEmoji, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
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
    const result = await context.handle(`https://home.yoyu.cc/subscribe/${id}/${token}/sip002/`, multiValueQueryStringParameters, yoyuResolver, useEmoji === "true", sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain", ...context.respHeader},
      body: result
    });
  });
};

export const boslife: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new NodeListInterceptor("boslife").process(event, async (interceptor, {output, token, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new SurgeProfile(), output);
    const result = await context.handle(`https://api.cn1.info/downloads/conf/${token}.conf`, multiValueQueryStringParameters, boslifeResolver, useEmoji === "true", sortMethod);
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
  return await new NodeListInterceptor("conair").process(event, async (interceptor, {output, token, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) return Err(ValidationError.create(400, "token cannot be empty"));
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new SurgeProfile(), output);
    const result = await context.handle(`https://conair.me/link/${token}?mu=6`, multiValueQueryStringParameters, conairResolver, useEmoji === "true", sortMethod);
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
  return await new NodeListInterceptor("ytoo").process(event, async (interceptor, {output, token, id, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
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
    const result = await context.handle(`https://ytoo.xyz/modules/servers/V2raySocks/osubscribe.php?sid=${id}&token=${token}`, multiValueQueryStringParameters, ytooResolver, useEmoji === "true", sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain", ...context.respHeader},
      body: result
    });
  });
};

export const maying: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new NodeListInterceptor("maying").process(event, async (interceptor, {output, token, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new Subscription(), output);
    const result = await context.handle(`https://sub.ssr.sh/link/${token}?mu=1`, multiValueQueryStringParameters, mayingResolver, useEmoji === "true", sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};

export const n3ro: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new NodeListInterceptor("n3ro").process(event, async (interceptor, {output, token, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new SSDSubscription(), output);
    const result = await context.handle(`https://nnn3ro.link/link/${token}?mu=3`, multiValueQueryStringParameters, n3roResolver, useEmoji === "true", sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};

export const ssrpass_ss: Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  return await new NodeListInterceptor("ssrpass-ss").process(event, async (interceptor, {output, token, useEmoji, sortMethod, multiValueQueryStringParameters}) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
    if(interceptor.check(token).isEmpty()) {
      return Err(ValidationError.create(400, "token cannot be empty"));
    }
    if(interceptor.check(useEmoji).isNotBoolean()) {
      return Err(ValidationError.create(400, "emoji is not type of boolean"));
    }
    const context = new ProxyContext(new SSDSubscription(), output);
    const result = await context.handle(`https://ss.blacklist.pw/link/${token}?mu=3`, multiValueQueryStringParameters, n3roResolver, useEmoji === "true", sortMethod);
    return Ok({
      statusCode: 200,
      headers: {"content-type": "text/plain"},
      body: result
    });
  });
};