import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import Server from "./server";
import { IValidator, Validator, ValidationError } from "./validator";
import { Result } from "@usefultools/monads";

export interface Interceptor<T> {
    check(data?: string): IValidator
    process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Promise<APIGatewayProxyResult>
};

type ControllerFunction<T> = (context: Interceptor<T>, parameters: T) => Promise<Result<APIGatewayProxyResult, ValidationError>>;

export interface SurgeNodeListLambdaParameters {
    id?: string
    token: string
    sortMethod: string[]
    multiValueQueryStringParameters: {[name: string]: string[]}
};

export abstract class AbstractLambdaInterceptor<T> implements Interceptor<T> {

    check(data?: string): IValidator {
        return new Validator(data);
    }

    protected abstract convert(queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): T

    async process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Promise<APIGatewayProxyResult> {
        if (!event.queryStringParameters) {
            return {
              statusCode: 400,
              body: "invalid parameters"
            };
        }

        event.multiValueQueryStringParameters =  event.multiValueQueryStringParameters || {};

        const res = await callback(this, this.convert(event.queryStringParameters, event.multiValueQueryStringParameters));
        return res.match({
            ok: val => val,
            err: errVal => ({ statusCode: errVal.code, body: errVal.message, "content-type": "text/plain" })
        });
    }
};

export class SurgeNodeListInterceptor extends AbstractLambdaInterceptor<SurgeNodeListLambdaParameters> {
    convert(queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): SurgeNodeListLambdaParameters {
        return {
            id: queryStringParameters.id,
            token: queryStringParameters.token || "",
            sortMethod: queryStringParameters.sort ? queryStringParameters.sort.split(">").filter(Server.isValidComparator) : ["outbound"],
            multiValueQueryStringParameters
        }
    }
}