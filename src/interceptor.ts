import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import Server from "./server";
import { IValidator, Validator, ValidationError } from "./validator";
import { Result, Ok, Err } from "@usefultools/monads";
import semver from "semver";

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
    output: string
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

export class SurgeNodeListInterceptor extends AbstractLambdaInterceptor<SurgeNodeListLambdaParameters> {
    convert(headers: {[name: string]: string}, queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): Result<SurgeNodeListLambdaParameters, Error> {
        let output = queryStringParameters.output;
        if (output === undefined || !["surge", "quanx"].includes(output)) {
            let userAgent = unescape(headers["User-Agent"].toLowerCase());
            if (userAgent.startsWith("surge")) {
                output = "surge";
                // if (userAgent.includes("x86_64")) {
                //     // macos version
                //     // build 893 is the last stable version of `3.3.0`
                //     let UA = userAgent.match(/^surge\/([\d\.]+)/);
                //     if (UA === null) {
                //         return Err(new Error("invalid user-agent"));
                //     }
                //     if (semver.lt(UA[1], '3.1.1')) {
                //         return Err(new Error("unsupported surge/macos version"));
                //     }
                // } else {
                //     let UA = userAgent.match(/^surge\/(\d+)/);
                //     if (UA === null) {
                //         return Err(new Error("invalid user-agent"));
                //     }
                //     if (parseInt(UA[1]) < 1429) {
                //         return Err(new Error("unsupported surge version"));
                //     }
                // }
            } else if (userAgent.startsWith("quantumult x")) {
                output = "quanx";
                // let UA = userAgent.match(/^quantumult x\/(\d+)/);
                // if (UA === null) {
                //     return Err(new Error("invalid user-agent"));
                // }
                // if (parseInt(UA[1]) < 123) {
                //     return Err(new Error("unsupported quantumult x version"));
                // }
            } else {
                output = "surge";
            }
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