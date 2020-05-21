import { softwareFromQuery } from './software';
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
