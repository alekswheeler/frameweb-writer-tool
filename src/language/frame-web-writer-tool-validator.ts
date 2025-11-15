import { type ValidationAcceptor, type ValidationChecks } from 'langium';
import { ClassDef, FrameWebWriterToolAstType, Model, PackageDeclaration} from './generated/ast.js';
import type { FrameWebWriterToolServices } from './frame-web-writer-tool-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FrameWebWriterToolServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.FrameWebWriterToolValidator;
    const checks: ValidationChecks<FrameWebWriterToolAstType> = {
        ClassDef: [validator.checkClassStartsWithCapital],
        PackageDeclaration: [validator.checkClassStereotype] 
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
    checkClassStereotype(packageDef: PackageDeclaration, accept: ValidationAcceptor): void{
        let domainStereotype = ['transient', 'mapped', 'persistent'];
        let viewStereotype = ['page', 'template', 'form', 'binary'];
        if(packageDef.pType){
            let pClasses = packageDef.classes;
            pClasses.forEach(pClass => {
                if(pClass.stereotype) {
                    switch (packageDef.pType){
                        case 'domain':
                            if(!domainStereotype.includes(pClass.stereotype)){
                                accept('error', 'Invalid stereotype.', { node: pClass, property: 'stereotype' });
                            }
                            break;
                        case 'view':
                            if(!viewStereotype.includes(pClass.stereotype)){
                                accept('error', 'Invalid stereotype.', { node: pClass, property: 'stereotype' });
                            }
                            break;
                        case 'controller':
                        case 'service':
                        case 'persistence':
                            break;
                        default: break;
                    }
                }
            });
        }
    }
}
