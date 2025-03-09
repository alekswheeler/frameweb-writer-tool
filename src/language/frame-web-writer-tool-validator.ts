import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { FrameWebWriterToolAstType, Person } from './generated/ast.js';
import type { FrameWebWriterToolServices } from './frame-web-writer-tool-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FrameWebWriterToolServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.FrameWebWriterToolValidator;
    const checks: ValidationChecks<FrameWebWriterToolAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class FrameWebWriterToolValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
