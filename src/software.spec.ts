import { softwareFromQuery, softwareFromUserAgent } from './software';
import { Either, isRight, isLeft, Right} from 'fp-ts/lib/Either';
import { Software, Clash, QuantumultX, Surge } from './softwares';
import { Errors } from 'io-ts';

test("input clash string", () => {
    let result: Either<Errors, Software> = softwareFromQuery.decode("clash");
    expect(isRight(result)).toBe(true);
    expect((result as Right<Software>).right).toStrictEqual(new Clash());
});

test("input quanx string", () => {
    let result: Either<Errors, Software> = softwareFromQuery.decode("quanx");
    expect(isRight(result)).toBe(true);
    expect((result as Right<Software>).right).toStrictEqual(new QuantumultX());
});

test("input surge string", () => {
    let result: Either<Errors, Software> = softwareFromQuery.decode("surge");
    expect(isRight(result)).toBe(true);
    expect((result as Right<Software>).right).toStrictEqual(new Surge());
});

test("input surge macos version 4 string", () => {
    let result: Either<Errors, Software> = softwareFromUserAgent.decode("Surge/1191 CFNetwork/1207.2 Darwin/20.1.0");
    expect(isRight(result)).toBe(true);
    expect((result as Right<Surge>).right.platform).toEqual("universal");
});

test("input surge macos legacy version string", () => {
    let result: Either<Errors, Software> = softwareFromUserAgent.decode("Surge/3.3.1 Darwin/19.0.0(x86_64)");
    expect(isRight(result)).toBe(true);
    expect((result as Right<Surge>).right.platform).toEqual("macos");
});

test("input unknown string", () => {
    let result: Either<Errors, Software> = softwareFromQuery.decode("surgex");
    expect(isLeft(result)).toBe(true);
});

test("legacy quanx header", () => {
    let result = softwareFromUserAgent.decode("Quantumult X/123  CFNetwork/1107.1 Darwin/19.0.0");
    expect(isRight(result)).toBe(true);
    expect((result as Right<Software>).right).toStrictEqual(new QuantumultX(123));
});

test("new quanx header", () => {
    let result = softwareFromUserAgent.decode("Quantumult%20X/1.0.10 (iPhone10,3; iOS 13.5)");
    expect(isRight(result)).toBe(true);
    expect((result as Right<QuantumultX>).right.legacyBuild).toBe(undefined)
    expect((result as Right<QuantumultX>).right.version).toEqual("1.0.10");
});
