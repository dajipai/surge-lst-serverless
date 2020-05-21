import { serverInfoSortableKeyCodec } from "./server";
import * as E from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { Software } from "./softwares";
import { softwareFromUserAgent, softwareFromQuery } from "./software";
import { fromConnection, Middleware, StatusOpen } from "hyper-ts";
import { Either } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { serverFilters } from "./profile";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { withMessage } from 'io-ts-types/lib/withMessage';
import { withFallback } from 'io-ts-types/lib/withFallback';
import { firstOfNonEmptyArray } from "./middleware";

export const nodeListParameters = t.intersection([t.type({
    url: withMessage(firstOfNonEmptyArray(t.string), () => "cannot assemble url"),
    emoji: withFallback(firstOfNonEmptyArray(BooleanFromString), true),
    udpRelay: withFallback(firstOfNonEmptyArray(BooleanFromString), false),
    // never failed
    sort: withFallback(serverInfoSortableKeyCodec, [])
}), serverFilters]);

export type CombinedParameters = t.TypeOf<typeof nodeListParameters> & {software: Software};

export function extractQuery(queryStringParameters: unknown, userAgent: unknown): E.Either<Error, CombinedParameters> {
    let query = queryStringParameters as {[key: string]: string[]|undefined};
    return pipe(
        softwareFromQuery.decode(query.output ? query.output[0] : ""),
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
