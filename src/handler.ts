"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { default as providerLoader } from "./provider";
import * as H from "hyper-ts";
import { toRequestHandler } from 'hyper-ts/lib/lambda';
import { pipe } from "fp-ts/lib/pipeable";
import { LambdaInterceptor, decodeQueryWithHeaders, extractQuery } from "./interceptor";

const renderUrlTemplate = (template: string, parameters: string[]): ((data: {[key: string]: string}) => string) => {
  return (data: {[key: string]: string}): string => {
    let result = template;
    for (let param of parameters) {
      result = result.replace("${" + param + "}", data[param]);
    }
    return result;
  }
}

providerLoader.forEachResolver((name, resolver) => {
  if (resolver.providerTemplates().length < 1) {
    throw new Error(`cannot find available template for ${name}`);
  }
  const [urlTemplate, provider] = resolver.providerTemplates()[0];
  const requiredParameters = Array.from(urlTemplate.matchAll(/\${(.*?)}/g)).map((group) => group[1]);
  const urlOnce = renderUrlTemplate(urlTemplate, requiredParameters);
  const interceptor = new LambdaInterceptor(name);
  const handler : Handler<APIGatewayProxyEvent,APIGatewayProxyResult>= toRequestHandler(
    pipe(
      decodeQueryWithHeaders(extractQuery, "User-Agent"),
      H.ichain((parameters) => 
        pipe(
          H.status(H.Status.OK),
          H.ichain(() => H.json(parameters, (err) => err as Error))
        )
      ),
      H.orElse((err) => 
        pipe(
          H.status(H.Status.BadRequest),
          H.ichain(() => H.closeHeaders()),
          H.ichain(() => H.send(err.message))
        )
      )
    )
  );
  
  // runtime export
  module.exports[name.replace("-", "_")] = handler;
});
