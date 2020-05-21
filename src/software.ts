import * as t from "io-ts";
import semver, { coerce, SemVer } from "semver";
import { Software, QuantumultX, Surge, Clash } from "./softwares";

const AvailableOutput = t.union([t.literal("surge"), t.literal("quanx"), t.literal("clash")]);

export const softwareFromUserAgent = t.string.pipe(new t.Type<Software, string, string>(
    "softwareHeaderCodec",
    (input: unknown): input is Software => !!input && (input as Software).satisfies !== undefined,
    (input, context) => {
        let userAgent = unescape(input.toLowerCase());
        if (userAgent.startsWith("surge")) {
            if (userAgent.includes("x86_64")) {
                // macos version
                // build 893 is the last stable version of `3.3.0`
                let UA = userAgent.match(/^surge\/([\d\.]+)/);
                if (UA === null) {
                    return t.failure(input, context);
                }
                const version = semver.coerce(UA[1]);
                if (version == null) {
                    return t.failure(input, context);
                }
                return t.success(new Surge(version, "macos"));
            } else {
                let UA = userAgent.match(/^surge\/(\d+)/);
                if (UA === null) {
                    return t.failure(input, context);
                }
                return t.success(new Surge(<SemVer>coerce(UA[1]), "ios"));
            }
        } else if (userAgent.startsWith("quantumult x")) {
            let UA = userAgent.match(/^quantumult x\/([\d\.]+)/);
            if (UA === null) {
                return t.failure(input, context);
            }
            if (UA[1].includes(".")) {
                return t.success(new QuantumultX(undefined, UA[1]));
            } else {
                return t.success(new QuantumultX(parseInt(UA[1])));
            }
        } else if (userAgent.includes("clash")) {
            return t.success(new Clash());
        } else {
            return t.success(new Surge());
        }
    },
    (_software) => "TBD"
));

/**
 * Codec to convert "quanx", "clash" and "surge" literals to Software,
 * or encode instances of Software to string
 */
export const softwareFromQuery = AvailableOutput.pipe(new t.Type<Software, t.TypeOf<typeof AvailableOutput>, t.TypeOf<typeof AvailableOutput>>(
    "softwareQueryCodec",
    softwareFromUserAgent.is,
    (input, context) => {
        if (input === "quanx") {
            return t.success(new QuantumultX());
        } else if (input === "surge") {
            return t.success(new Surge());
        } else if (input === "clash") {
            return t.success(new Clash());
        } else {
            return t.failure(input, context);
        }
    },
    (software) => {
        if (software instanceof Surge) {
            return "surge";
        } else if (software instanceof QuantumultX) {
            return "quanx";
        } else {
            return "clash";
        }
    }
));
