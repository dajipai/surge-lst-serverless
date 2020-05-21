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
