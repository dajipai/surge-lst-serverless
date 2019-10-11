import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import Server from "./server";

export interface Interceptor<T> {
    process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Promise<APIGatewayProxyResult>
};

type ControllerFunction<T> = (parameters: T) => Promise<APIGatewayProxyResult>;

export interface SurgeNodeListLambdaParameters {
    id?: string
    token: string
    sortMethod: string[]
    multiValueQueryStringParameters: {[name: string]: string[]}
};

export abstract class AbstractLambdaInterceptor<T> implements Interceptor<T> {

    protected abstract convert(queryStringParameters: {[name: string]: string}, multiValueQueryStringParameters: {[name: string]: string[]}): T

    async process(event: APIGatewayProxyEvent, callback: ControllerFunction<T>): Promise<APIGatewayProxyResult> {
        if (!event.queryStringParameters) {
            return {
              statusCode: 400,
              body: "invalid parameters"
            };
        }

        event.multiValueQueryStringParameters =  event.multiValueQueryStringParameters || {};

        return await callback(this.convert(event.queryStringParameters, event.multiValueQueryStringParameters));
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