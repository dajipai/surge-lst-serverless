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

type ControllerFunction = (context: LambdaInterceptor, parameters: CombinedParameters) => Promise<APIGatewayProxyResult>;

export const nodeListParameters = t.type({
    id: t.string,
    useEmoji: t.boolean,
    token: t.string,
    udpRelay: t.boolean,
    // never failed
    sortMethod: serverInfoSortableKeyCodec,
    filters: serverFilters
});

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

export function extractQuery(queryStringParameters: unknown, userAgent: unknown): E.Either<Error, CombinedParameters> {
    let query = queryStringParameters as {[key: string]: string|string[]|undefined};
    return pipe(
        softwareFromQuery.decode(query.output),
        E.orElse((_err) => softwareFromUserAgent.decode(userAgent)),
        E.chain((software) => {
            return E.either.chain(nodeListParameters.decode(query), parameter => t.success(Object.assign({}, parameter, {software})))
        }),
        E.orElse(err => E.left(new Error(err[0].message ?? "invalid user input")))
    );
}

export function decodeQueryWithHeaders<E, A>(f: (query: unknown, ...headerValues: unknown[]) => Either<E, A>, ...headers: string[]): Middleware<StatusOpen, StatusOpen, E, A>{
    return fromConnection((c) => f(c.getQuery(), ...headers.map((key) => c.getHeader(key))));
}
