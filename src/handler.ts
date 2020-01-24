"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { default as providerLoader } from "./provider";
import { ProxyContext } from "./profile";
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

function defineHandler(name: string): void {
  const resolver = providerLoader.findResolver(name);
  if (resolver === undefined) {
    throw new Error(`cannot find resolver for ${name}`);
  }
  if (resolver.providerTemplates().length < 1) {
    throw new Error(`cannot find available template for ${name}`);
  }
  const [urlTemplate, provider] = resolver.providerTemplates()[0];
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

defineHandler("yoyu")
defineHandler("boslife");
defineHandler("conair");
defineHandler("ytoo");
defineHandler("maying");
defineHandler("n3ro");
defineHandler("ssrpass-ss");
