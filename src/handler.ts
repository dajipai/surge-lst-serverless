import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { default as providerLoader } from "./provider";
import {
  middleware,
  Status,
  HeadersOpen,
  StatusOpen,
  ResponseEnded
} from 'hyper-ts';
import * as H from "hyper-ts/lib/Middleware";
import { toRequestHandler } from './middleware';
import { pipe } from "fp-ts/lib/function";
import { decodeQueryWithHeaders, extractQuery, CombinedParameters } from "./interceptor";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { ProxyContext } from "./profile";
import { sequenceT } from "fp-ts/lib/Apply";

const renderUrlTemplate = (template: string) => (callback: (queryStringParameters: unknown, userAgent: unknown) => E.Either<Error, CombinedParameters>) => {
  const requiredParameters = Array.from(template.matchAll(/\${(.*?)}/g)).map((group) => group[1]);
  return (queryStringParameters: unknown, userAgent: unknown): E.Either<Error, CombinedParameters> => {
    let result = template;
    const query = queryStringParameters as {[key: string]: string[] | string | undefined};
    for (const param of requiredParameters) {
      const queryVal = query[param];
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

function multiHeaders(headers: {[key: string]: string}): H.Middleware<HeadersOpen, HeadersOpen, never, void> {
  const headersMiddleware: H.Middleware<HeadersOpen, HeadersOpen, never, void>[] = Object.entries(headers).map(([key, value]) => H.header(key, value));
  return pipe(sequenceT(middleware)(headersMiddleware[0], ...headersMiddleware.slice(1)), H.map(() => {}))
}

// `???`: withMessage(firstOfNonEmptyArray(t.string), () => "??? cannot be null"),

function badRequest(err: Error): H.Middleware<StatusOpen, ResponseEnded, never, void> {
  return pipe(
    H.status(Status.BadRequest),
    H.ichain(() => H.closeHeaders()),
    H.ichain(() => H.send(err.message))
  )
}

function serverError(err: Error): H.Middleware<StatusOpen, ResponseEnded, never, void> {
  return pipe(
    H.status(Status.InternalServerError),
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
      H.ichain<CombinedParameters, StatusOpen, ResponseEnded, Error, void>((parameters) =>
        pipe(
          H.fromTaskEither(TE.tryCatch(() =>
            (new ProxyContext(new provider(), parameters.software)).handle(parameters.url, parameters, resolver, parameters.emoji, parameters.udpRelay, parameters.tfo, parameters.sort),
            (err) => err as Error)),
          H.ichain<[string, {[key: string]: string}], StatusOpen, ResponseEnded, Error, void>(([body, headers]) =>
            pipe(
              H.status(Status.OK),
              H.ichain(() => multiHeaders(Object.assign({}, {"Content-Type": "text/plain;charset=utf-8"}, headers))),
              H.ichain(() => H.closeHeaders()),
              H.ichain(() => H.send(body))
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
