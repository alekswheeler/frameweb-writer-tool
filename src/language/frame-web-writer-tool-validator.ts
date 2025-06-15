import { type ValidationAcceptor, type ValidationChecks } from 'langium';
import { ClassDef, FrameWebWriterToolAstType, Model} from './generated/ast.js';
import type { FrameWebWriterToolServices } from './frame-web-writer-tool-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FrameWebWriterToolServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.FrameWebWriterToolValidator;
    const checks: ValidationChecks<FrameWebWriterToolAstType> = {
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class FrameWebWriterToolValidator {
    checkClassStartsWithCapital(classDef: ClassDef, accept: ValidationAcceptor): void {
        if (classDef.name) {
            const firstChar = classDef.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Class name should start with a capital.', { node: classDef, property: 'name' });
            }
        }
    }

    checkClassMembers(attributeBlock: Model, accept: ValidationAcceptor): void {
        // if (attributeBlock.$cstNode) {
        //     console.debug(`class ${attributeBlock.name}`);
        //     for (const attr of attributeBlock.attributes) {
        //         if(attr.name === undefined || attr.name.length === 0){
        //             continue;
        //         }
        //         console.debug(`${attributeBlock.name} : +String ${attr.name}`);
        //     }
        //     console.debug(`\n=========\n`);
        // }
    }
}
