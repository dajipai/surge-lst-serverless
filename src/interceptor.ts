import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import Server from "./server";
import { IValidator, Validator, ValidationError } from "./validator";
import { Result, Ok, Err } from "@usefultools/monads";
import semver, { coerce, SemVer } from "semver";
import { Software, Surge, QuantumultX } from "./softwares";

export interface Interceptor<T> {
    check(data?: string): IValidator
    process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Promise<APIGatewayProxyResult>
};

type ControllerFunction<T> = (context: Interceptor<T>, parameters: T) => Promise<Result<APIGatewayProxyResult, ValidationError>>;

export interface SurgeNodeListLambdaParameters {
    id?: string
    useEmoji: string
    token: string
    sortMethod: string[]
    output: Software
    multiValueQueryStringParameters: {[name: string]: string[]}
}

export abstract class AbstractLambdaInterceptor<T> implements Interceptor<T> {

    check(data?: string): IValidator {
        return new Validator(data);
    }

    protected abstract convert(headers: {[name: string]: string}, queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): Result<T, Error>

    async process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Promise<APIGatewayProxyResult> {
        if (!event.queryStringParameters) {
            return {
              statusCode: 400,
              headers: {"content-type": "text/plain"},
              body: "invalid parameters"
            };
        }

        event.multiValueQueryStringParameters =  event.multiValueQueryStringParameters || {};

        let parameters = this.convert(event.headers, event.queryStringParameters, event.multiValueQueryStringParameters);

        if (parameters.is_err()) {
            return ({ statusCode: 403, body: parameters.unwrap_err().message, headers: {"content-type": "text/plain" }})
        }

        const res = await callback(this, parameters.unwrap());
        return res.match({
            ok: val => val,
            err: errVal => ({ statusCode: errVal.code, body: errVal.message, headers: {"content-type": "text/plain" }})
        });
    }
}

export class NodeListInterceptor extends AbstractLambdaInterceptor<SurgeNodeListLambdaParameters> {
    convert(headers: {[name: string]: string}, queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): Result<SurgeNodeListLambdaParameters, Error> {
        let output: Software;
        if (queryStringParameters.output === undefined || !["surge", "quanx"].includes(queryStringParameters.output)) {
            let userAgent = unescape(headers["User-Agent"].toLowerCase());
            if (userAgent.startsWith("surge")) {
                if (userAgent.includes("x86_64")) {
                    // macos version
                    // build 893 is the last stable version of `3.3.0`
                    let UA = userAgent.match(/^surge\/([\d\.]+)/);
                    if (UA === null) {
                        return Err(new Error("invalid user-agent"));
                    }
                    const version = semver.coerce(UA[1]);
                    if (version == null) {
                        return Err(new Error("invalid user-agent"));
                    }
                    output = new Surge(version, "macos");
                } else {
                    let UA = userAgent.match(/^surge\/(\d+)/);
                    if (UA === null) {
                        return Err(new Error("invalid user-agent"));
                    }
                    output = new Surge(<SemVer> coerce(UA[1]), "ios");
                }
            } else if (userAgent.startsWith("quantumult x")) {
                let UA = userAgent.match(/^quantumult x\/(\d+)/);
                if (UA === null) {
                    return Err(new Error("invalid user-agent"));
                }
                output = new QuantumultX(parseInt(UA[1]));
            } else {
                output = new Surge();
            }
        } else if (queryStringParameters.output === "quanx") {
            output = new QuantumultX();
        } else if (queryStringParameters.output === "surge") {
            output = new Surge();
        } else {
            return Err(new Error("invalid output type"));
        }
        return Ok({
            id: queryStringParameters.id,
            token: queryStringParameters.token || "",
            useEmoji: queryStringParameters.emoji || "true",
            sortMethod: queryStringParameters.sort ? queryStringParameters.sort.split(">").filter(Server.isValidComparator) : ["outbound"],
            multiValueQueryStringParameters,
            output,
        });
    }
}