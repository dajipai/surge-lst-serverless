"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { default as providerLoader } from "./provider";
import { ProxyContext } from "./profile";
import { SurgeProfile, SSDSubscription, Subscription, ProxiesInput } from "./input";
import { NodeListInterceptor } from "./interceptor";
import { Result, Ok, Err } from "@usefultools/monads";
import { ValidationError } from "./validator";

const renderUrlTemplate = (template: string, parameters: string[]): ((data: {[key: string]: string}) => string) => {
  return (data: {[key: string]: string}): string => {
    let result = template;
    for (let param of parameters) {
      result = result.replace("${" + param + "}", data[param]);
    }
    return result;
  }
}

function defineHandler<A extends ProxiesInput>(name: string, urlTemplate: string, provider: new () => A): void {
  const resolver = providerLoader.findResolver(name);
  if (resolver === undefined) {
    throw new Error(`cannot find resolver ${name}`);
  }
  const requiredParameters = Array.from(urlTemplate.matchAll(/\${(.*?)}/g)).map((group) => group[1]);
  const urlOnce = renderUrlTemplate(urlTemplate, requiredParameters);
  const handler : Handler<APIGatewayProxyEvent,APIGatewayProxyResult>= async (event) => {
    return await new NodeListInterceptor(name).process(event, async (interceptor, parameters) : Promise<Result<APIGatewayProxyResult, ValidationError>> => {
      for (let rp of requiredParameters) {
        if(interceptor.check(parameters[rp]).isEmpty()) {
          return Err(ValidationError.create(400, `${rp} cannot be empty`));
        }
      }
      if(interceptor.check(parameters.useEmoji).isNotBoolean()) {
        return Err(ValidationError.create(400, "emoji is not type of boolean"));
      }
      const context = new ProxyContext(new provider(), parameters.output);
      const result = await context.handle(urlOnce(parameters), parameters.multiValueQueryStringParameters, resolver, parameters.useEmoji === "true", parameters.sortMethod);
      return Ok({
        statusCode: 200,
        headers: {"content-type": "text/plain", ...context.respHeader},
        body: result
      });
    });
  };
  // runtime export
  module.exports[name.replace("-", "_")] = handler;
}

defineHandler("yoyu", "https://home.yoyu.cc/subscribe/${id}/${token}/sip002/", Subscription)
defineHandler("boslife", "https://api.cn1.info/downloads/conf/${token}.conf", SurgeProfile);
defineHandler("conair", "https://conair.me/link/${token}?mu=6", SurgeProfile);
defineHandler("ytoo", "https://ytoo.xyz/modules/servers/V2raySocks/osubscribe.php?sid=${id}&token=${token}", Subscription);
defineHandler("maying", "https://sub.ssr.sh/link/${token}?mu=1", Subscription);
defineHandler("n3ro", "https://nnn3ro.link/link/${token}?mu=3", SSDSubscription);
defineHandler("ssrpass-ss", "https://ss.blacklist.pw/link/${token}?mu=3", SSDSubscription);
