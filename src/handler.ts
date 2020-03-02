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
import * as E from "fp-ts/lib/Either";
import { ProxyContext } from "./profile";

const renderUrlTemplate = (template: string) => (callback: (queryStringParameters: unknown, userAgent: unknown) => E.Either<Error, CombinedParameters>) => {
  const requiredParameters = Array.from(template.matchAll(/\${(.*?)}/g)).map((group) => group[1]);
  return (queryStringParameters: unknown, userAgent: unknown): E.Either<Error, CombinedParameters> => {
    let result = template;
    let query = queryStringParameters as {[key: string]: string[]|undefined};
    for (let param of requiredParameters) {
      let queryVal = query[param];
      if (queryVal === undefined || queryVal.length === 0) {
        return E.left(new Error(`required parameter ${param}`));
      } else {
        result = result.replace("${" + param + "}", queryVal[0]);
      }
    }
    // simulate here user input
    query.url = [result];

    return callback(queryStringParameters, userAgent);
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

function serverError(err: Error): H.Middleware<H.StatusOpen, H.ResponseEnded, never, void> {
  return pipe(
    H.status(H.Status.ServerError),
    H.ichain(() => H.closeHeaders()),
    H.ichain(() => H.send(err.message))
  )
}

providerLoader.forEachResolver((name, resolver) => {
  if (resolver.providerTemplates().length < 1) {
    throw new Error(`cannot find available template for ${name}`);
  }
  const [urlTemplate, provider] = resolver.providerTemplates()[0];
  const extractURLAndQuery = renderUrlTemplate(urlTemplate)(extractQuery);
  const handler : Handler<APIGatewayProxyEvent,APIGatewayProxyResult>= toRequestHandler(
    pipe(
      decodeQueryWithHeaders(extractURLAndQuery, "User-Agent"),
      H.ichain<CombinedParameters, H.StatusOpen, H.ResponseEnded, Error, void>((parameters) => 
        pipe(
          H.fromTaskEither(TE.tryCatch(() => 
            (new ProxyContext(new provider(), parameters.software)).handle(parameters.url, parameters, resolver, parameters.emoji, parameters.udpRelay, parameters.sort), 
            (err) => err as Error)),
          H.ichain<string, H.StatusOpen, H.ResponseEnded, Error, void>((result) => 
            pipe(
              H.status(H.Status.OK),
              H.ichain(() => H.header("Content-Type", "text/plain")),
              H.ichain(() => H.closeHeaders()),
              H.ichain(() => H.send(result))
            )
          ),
          H.orElse(serverError)
        )
      ),
      H.orElse(badRequest)
    )
  );
  
  // runtime export
  module.exports[name.replace("-", "_")] = handler;
});
