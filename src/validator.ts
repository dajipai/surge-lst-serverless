import validator from "validator";

export interface IValidator {
    isEmpty(): boolean
    isNotBoolean(): boolean
    isNotIn(values: string[]): boolean
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

    isNotBoolean() : boolean {
        return this.value === undefined || !validator.isBoolean(this.value);
    }

    isNotIn(values: string[]): boolean {
        return this.value === undefined || !validator.isIn(this.value, values);
    }
}