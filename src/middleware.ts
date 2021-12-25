import {
    APIGatewayProxyEvent,
    APIGatewayProxyCallback,
    APIGatewayProxyHandler,
    Context,
    APIGatewayProxyResult
} from 'aws-lambda'
import {
    Connection,
    CookieOptions,
    HeadersOpen,
    ResponseEnded,
    Status
} from 'hyper-ts'
import {
    Middleware,
    execMiddleware
} from 'hyper-ts/lib/Middleware'
import {
    Action
} from 'hyper-ts/lib/express'
import * as L from 'fp-ts-contrib/List'
import { Readable } from 'stream'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/lib/Either'
import * as cookie from 'cookie'
import * as t from 'io-ts'
import { fromArray } from 'fp-ts/lib/NonEmptyArray'
import { IncomingMessage } from 'http'
import { isNonEmpty } from 'fp-ts/lib/Array'
import { either } from 'fp-ts/lib/Either'
import { isNone } from 'fp-ts/lib/Option'

/**
 * @internal
 * just repeat https://github.com/gcanti/hyper-ts/blob/master/src/express.ts#L71
 */
const endResponse: Action = { type: 'endResponse' }

export class ServerlessConnection<S> implements Connection<S> {
    readonly _S!: S
    constructor(
        readonly event: APIGatewayProxyEvent,
        readonly context: Context,
        readonly callback: APIGatewayProxyCallback,
        readonly resp: APIGatewayProxyResult,
        readonly actions: L.List<Action> = L.nil,
        readonly ended: boolean = false
    ) { }

    /**
     * @since 0.5.0
     */
    chain<T>(action: Action, ended: boolean = false): ServerlessConnection<T> {
        return new ServerlessConnection<T>(this.event, this.context, this.callback, this.resp, L.cons(action, this.actions), ended)
    }

    getRequest(): IncomingMessage {
        return (null as unknown) as IncomingMessage
    }

    getBody(): unknown {
        return this.event.body
    }

    getHeader(name: string): string[] | string | undefined {
        return this.event.headers[name] ?? this.event.multiValueHeaders[name]
    }

    getParams(): { [name: string]: string | undefined } {
        if (this.event.pathParameters == null) {
            return {}
        }
        return this.event.pathParameters ?? {}
    }

    getQuery(): { [name: string]: string | string[] | undefined } {
        if (this.event.queryStringParameters == null || this.event.multiValueQueryStringParameters == null) {
            return {}
        }
        return Object.assign({}, this.event.queryStringParameters, this.event.multiValueQueryStringParameters)
    }

    /**
     * https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
     */
    getOriginalUrl(): string {
        return `https://${this.event.headers['Host']}${this.event.requestContext.path}`
    }

    getMethod(): string {
        return this.event.httpMethod
    }

    setCookie(name: string, value: string, options: CookieOptions): ServerlessConnection<HeadersOpen> {
        return this.chain({ type: 'setCookie', name, value, options })
    }

    clearCookie(name: string, options: CookieOptions): ServerlessConnection<HeadersOpen> {
        return this.chain({ type: 'clearCookie', name, options })
    }

    setHeader(name: string, value: string): ServerlessConnection<HeadersOpen> {
        return this.chain({ type: 'setHeader', name, value })
    }

    setStatus(status: Status): ServerlessConnection<HeadersOpen> {
        return this.chain({ type: 'setStatus', status })
    }

    setBody(body: String | Buffer): ServerlessConnection<ResponseEnded> {
        return this.chain({ type: 'setBody', body }, true)
    }

    endResponse(): ServerlessConnection<ResponseEnded> {
        return this.chain(endResponse, true)
    }

    pipeStream(stream: NodeJS.ReadableStream): ServerlessConnection<ResponseEnded> {
        return this.chain({ type: 'pipeStream', stream }, true)
    }
}

function parseCookie(res: APIGatewayProxyResult): { [key: string]: string } {
    if (res.headers === undefined) {
        res.headers = {}
    }
    return cookie.parse(res.headers['Set-Cookie'] as string ?? '')
}

function setCookie(res: APIGatewayProxyResult, newCookie: string): void {
    if (res.headers === undefined) {
        res.headers = {}
    }
    if (res.headers.hasOwnProperty('Set-Cookie')) {
        res.headers['Set-Cookie'] += `; ${newCookie}`
    } else {
        res.headers['Set-Cookie'] = newCookie
    }
}

function setCookies(res: APIGatewayProxyResult, cookies: { [key: string]: string }): void {
    if (res.headers === undefined) {
        res.headers = {}
    }
    res.headers['Set-Cookie'] = Object.keys(cookies).map((key) => `${key} = ${cookies[key]}`).join('; ')
}

function run(res: APIGatewayProxyResult, action: Action): APIGatewayProxyResult {
    switch (action.type) {
        case 'clearCookie':
            let cookieInHeader = parseCookie(res)
            delete cookieInHeader[action.name]
            setCookies(res, cookieInHeader)
            return res
        case 'endResponse':
            return res
        case 'setBody':
            res.body = action.body as string
            return res
        case 'setCookie':
            setCookie(res, cookie.serialize(action.name, action.value, action.options))
            return res
        case 'setHeader':
            if (res.headers === undefined) res.headers = {}
            res.headers[action.name] = action.value
            return res
        case 'setStatus':
            res.statusCode = action.status
            return res
        case 'pipeStream':
            return res
    }
}

const errorHanlder = (callback: APIGatewayProxyCallback) => (err?: any) => {
    callback(err)
}

function exec<I, O, E>(
    middleware: Middleware<I, O, E, void>,
    event: APIGatewayProxyEvent,
    context: Context,
    callback: APIGatewayProxyCallback,
    resp: APIGatewayProxyResult
): Promise<void> {
    return execMiddleware(middleware, new ServerlessConnection<I>(event, context, callback, resp))().then(e =>
        pipe(
            e,
            E.fold(errorHanlder(callback), c => {
                const { actions: list, resp, ended } = c as ServerlessConnection<O>
                const len = list.length
                const actions = L.toArray(list)
                for (let i = 0; i < len; i++) {
                    run(resp, actions[i])
                }
                if (!ended) {
                    errorHanlder(callback)(new Error('unexpected middleware status: no response generated!'))
                } else {
                    callback(null, resp)
                }
            })
        )
    )
}

export function toRequestHandler<I, O, E>(middleware: Middleware<I, O, E, void>): APIGatewayProxyHandler {
    return (event, context, callback) => {
        // create default response here
        exec(middleware, event, context, callback, {
            statusCode: 200,
            body: ''
        }).catch((err: Error) => callback(err))
    }
}

// where `t.Mixed = t.Type<any, any, unknown>`
export interface FirstOfNonEmptyArrayC<C extends t.Mixed>
    extends t.Type<t.TypeOf<C>, t.OutputOf<C>, unknown> { }

export function firstOfNonEmptyArray<C extends t.Mixed>(
    codec: C,
    name: string = `FirstOfNonEmptyArray<${codec.name}>`
): FirstOfNonEmptyArrayC<C> {
    const arr = t.array(codec)
    return new t.Type(
        name,
        (u): u is t.TypeOf<C> => arr.is(u) && isNonEmpty(u) && codec.is(u[0]),
        (u, c) =>
            either.chain(arr.validate(u, c), as => {
                const onea = fromArray(as)
                return isNone(onea) ? t.failure(u, c) : t.success(onea.value[0])
            }),
        nea => nea
    )
}