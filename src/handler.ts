"use strict";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { default as providerLoader } from "./provider";
import * as H from "hyper-ts";
import { toRequestHandler } from './middleware';
import { pipe } from "fp-ts/lib/pipeable";
import { decodeQueryWithHeaders, extractQuery, CombinedParameters } from "./interceptor";
import * as TE from "fp-ts/lib/TaskEither";
import { ProxyContext } from "./profile";

const renderUrlTemplate = (template: string, parameters: string[]): ((data: {[key: string]: string}) => string) => {
  return (data: {[key: string]: string}): string => {
    let result = template;
    for (let param of parameters) {
      result = result.replace("${" + param + "}", data[param]);
    }
    return result;
  }
}

// `???`: withMessage(firstOfNonEmptyArray(t.string), () => "??? cannot be null"),

function badRequest(err: Error): H.Middleware<H.StatusOpen, H.ResponseEnded, never, void> {
  return pipe(
    H.status(H.Status.BadRequest),
    H.ichain(() => H.closeHeaders()),
    H.ichain(() => H.send(err.message))
  )
}

providerLoader.forEachResolver((name, resolver) => {
  if (resolver.providerTemplates().length < 1) {
    throw new Error(`cannot find available template for ${name}`);
  }
  const [urlTemplate, provider] = resolver.providerTemplates()[0];
  const requiredParameters = Array.from(urlTemplate.matchAll(/\${(.*?)}/g)).map((group) => group[1]);
  const urlOnce = renderUrlTemplate(urlTemplate, requiredParameters);
  const handler : Handler<APIGatewayProxyEvent,APIGatewayProxyResult>= toRequestHandler(
    pipe(
      decodeQueryWithHeaders(extractQuery, "User-Agent"),
      H.ichain<CombinedParameters, H.StatusOpen, H.ResponseEnded, Error, void>((parameters) => 
        pipe(
          H.fromTaskEither(TE.tryCatch(() => 
            (new ProxyContext(new provider(), parameters.software)).handle(parameters.url, parameters, resolver, parameters.useEmoji, parameters.udpRelay, parameters.sortMethod), 
            (err) => err as Error)),
          H.ichain<string, H.StatusOpen, H.ResponseEnded, Error, void>((result) => 
            pipe(
              H.status(H.Status.OK),
              H.ichain(() => H.closeHeaders()),
              H.ichain(() => H.send(result))
            )
          ),
          H.orElse(badRequest)
        )
      ),
      H.orElse(badRequest)
    )
  );
  
  // runtime export
  module.exports[name.replace("-", "_")] = handler;
});
