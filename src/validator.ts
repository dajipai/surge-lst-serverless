import validator from "validator";

export interface IValidator {
    isEmpty(): boolean
}

export class ValidationError extends Error {
    readonly code: number;

    private constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }

    static create(code: number, message: string): ValidationError {
        return new ValidationError(code, message)
    }
}

export class Validator implements IValidator {
    value?: string;

    constructor(value?: string) {
        this.value = value;
    }

    isEmpty(): boolean {
        return this.value === undefined || validator.isEmpty(this.value);
    }
}