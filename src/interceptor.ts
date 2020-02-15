import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import Server, { AllowSortedKeys } from "./server";
import { IValidator, Validator, ValidationError } from "./validator";
import semver, { coerce, SemVer } from "semver";
import * as E from 'fp-ts/lib/Either';
import * as TE from "fp-ts/lib/TaskEither"
import * as Task from "fp-ts/lib/Task"
import { flow, identity, Lazy } from 'fp-ts/lib/function'
import { pipe } from 'fp-ts/lib/pipeable'
import { Software, Surge, QuantumultX } from "./softwares";
import { Clash } from "./softwares/clash";

const AVAILABLE_OUTPUTS = ["surge", "quanx", "clash"];

export interface Interceptor<T> {
    check(data?: string): IValidator
    process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Task.Task<APIGatewayProxyResult>
};

type ControllerFunction<T> = (context: Interceptor<T>, parameters: T) => Promise<APIGatewayProxyResult>;

export interface NodeListLambdaParameters {
    [key: string]: any
    id?: string
    useEmoji: boolean
    token: string
    udpRelay? : boolean
    sortMethod?: AllowSortedKeys[]
    output: Software
    multiValueQueryStringParameters: {[name: string]: string[]}
}

export abstract class AbstractLambdaInterceptor<T> implements Interceptor<T> {
    protected readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    check(data?: string): IValidator {
        return new Validator(data);
    }

    protected abstract convert(headers: {[name: string]: string}, queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): E.Either<Error, T>

    process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Task.Task<APIGatewayProxyResult> {
        if (!event.queryStringParameters) {
            return Task.of({
                statusCode: 400,
                headers: {"content-type": "text/plain"},
                body: "invalid parameters"
            });
        }

        event.multiValueQueryStringParameters =  event.multiValueQueryStringParameters ?? {};

        if (event.headers === undefined) {
            return Task.of({
                statusCode: 400,
                headers: {"content-type": "text/plain"},
                body: "invalid headers"
            });
        }

        const onError = (err : Error|ValidationError) : Task.Task<APIGatewayProxyResult> => {
            return Task.of({ statusCode: err instanceof ValidationError ? err.code : 403, body: err.message, headers: {"content-type": "text/plain" }})
        }

        const ctx = this;

        return pipe<E.Either<Error, T>, Task.Task<APIGatewayProxyResult>>(
            this.convert(event.headers, event.queryStringParameters, event.multiValueQueryStringParameters),
            E.fold<Error, T, Task.Task<APIGatewayProxyResult>>(
                onError,
                flow(
                    (parameters: T) => TE.tryCatch(() => callback(ctx, parameters), (reason: unknown) => reason as ValidationError),
                    TE.getOrElse(onError)
                )
            )
        );
    }
}

export class NodeListInterceptor extends AbstractLambdaInterceptor<NodeListLambdaParameters> {
    convert(headers: {[name: string]: string}, queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): E.Either<Error, NodeListLambdaParameters> {
        let output: Software;
        if (queryStringParameters.output === undefined || !AVAILABLE_OUTPUTS.includes(queryStringParameters.output)) {
            let userAgent = unescape(headers["User-Agent"].toLowerCase());
            if (userAgent.startsWith("surge")) {
                if (userAgent.includes("x86_64")) {
                    // macos version
                    // build 893 is the last stable version of `3.3.0`
                    let UA = userAgent.match(/^surge\/([\d\.]+)/);
                    if (UA === null) {
                        return E.left(new Error("invalid user-agent"));
                    }
                    const version = semver.coerce(UA[1]);
                    if (version == null) {
                        return E.left(new Error("invalid user-agent"));
                    }
                    output = new Surge(version, "macos");
                } else {
                    let UA = userAgent.match(/^surge\/(\d+)/);
                    if (UA === null) {
                        return E.left(new Error("invalid user-agent"));
                    }
                    output = new Surge(<SemVer> coerce(UA[1]), "ios");
                }
            } else if (userAgent.startsWith("quantumult x")) {
                let UA = userAgent.match(/^quantumult x\/(\d+)/);
                if (UA === null) {
                    return E.left(new Error("invalid user-agent"));
                }
                output = new QuantumultX(parseInt(UA[1]));
            } else if (userAgent.toLocaleLowerCase().includes("clash")) {
                output = new Clash();
            } else {
                output = new Surge();
            }
        } else if (queryStringParameters.output === "quanx") {
            output = new QuantumultX();
        } else if (queryStringParameters.output === "surge") {
            output = new Surge();
        } else if (queryStringParameters.output === "clash") {
            output = new Clash();
        } else {
            return E.left(new Error("invalid output type"));
        }
        return E.right({
            id: queryStringParameters.id,
            token: queryStringParameters.token ?? "",
            useEmoji: queryStringParameters.emoji ? queryStringParameters.emoji === "true" : true,
            sortMethod: queryStringParameters.sort?.split(">").filter(Server.isValidComparator),
            udpRelay: queryStringParameters.udpRelay === "true",
            multiValueQueryStringParameters,
            output,
        });
    }
}