import {
    APIGatewayProxyResult,
} from "aws-lambda";
import { serverInfoSortableKeyCodec } from "./server";
import * as E from 'fp-ts/lib/Either';
import * as TE from "fp-ts/lib/TaskEither";
import * as Task from "fp-ts/lib/Task";
import { flow } from 'fp-ts/lib/function';
import { pipe } from 'fp-ts/lib/pipeable';
import { Software } from "./softwares";
import { softwareFromUserAgent, softwareFromQuery } from "./software";
import { fromConnection, Middleware, StatusOpen } from "hyper-ts";
import { Either } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { serverFilters } from "./profile";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { withMessage } from 'io-ts-types/lib/withMessage';
import { withFallback } from 'io-ts-types/lib/withFallback'

type ControllerFunction = (context: LambdaInterceptor, parameters: CombinedParameters) => Promise<APIGatewayProxyResult>;

export const nodeListParameters = t.intersection([t.type({
    id: withMessage(t.string, () => "id cannot be null"),
    useEmoji: withFallback(BooleanFromString, true),
    token: withMessage(t.string, () => "token cannot be null"),
    udpRelay: withFallback(BooleanFromString, false),
    // never failed
    sortMethod: withFallback(serverInfoSortableKeyCodec, [])
}), serverFilters]);

type CombinedParameters = t.TypeOf<typeof nodeListParameters> & {software: Software};

export class LambdaInterceptor {
    protected readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    process(parameters: CombinedParameters, callback: ControllerFunction): Task.Task<APIGatewayProxyResult> {
        const onError = (err : Error) : Task.Task<APIGatewayProxyResult> => {
            return Task.of({ statusCode: 400, body: err.message, headers: {"content-type": "text/plain" }})
        }

        const ctx = this;

        return pipe(
            parameters,
            flow(
                (parameters) => TE.tryCatch(() => callback(ctx, parameters), (reason: unknown) => reason as Error),
                TE.getOrElse(onError)
            )
        );
    }
}

function flattenQuery(query: {[key: string]: string|string[]|undefined}, ...keys: string[]) {
    for (let key of keys) {
        let value = query[key];
        if (value === undefined || !Array.isArray(value)) {
            continue
        }
        query[key] = value[0];
    }
}

export function extractQuery(queryStringParameters: unknown, userAgent: unknown): E.Either<Error, CombinedParameters> {
    let query = queryStringParameters as {[key: string]: string[]|undefined};
    flattenQuery(query, "id", "token", "useEmoji", "udpRelay", "sortMethod");
    return pipe(
        softwareFromQuery.decode(query.output),
        E.orElse((_err) => softwareFromUserAgent.decode(userAgent)),
        E.chain((software) => {
            return E.either.chain(nodeListParameters.decode(query), p => t.success(Object.assign({}, p, {software})))
        }),
        E.orElse(err => {
            return E.left(new Error(err[0].message ?? "invalid user input"));
        })
    );
}

export function decodeQueryWithHeaders<E, A>(f: (query: unknown, ...headerValues: unknown[]) => Either<E, A>, ...headers: string[]): Middleware<StatusOpen, StatusOpen, E, A>{
    return fromConnection((c) => f(c.getQuery(), ...headers.map((key) => c.getHeader(key))));
}
