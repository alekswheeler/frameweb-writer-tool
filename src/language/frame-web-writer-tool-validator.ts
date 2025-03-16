import { type ValidationAcceptor, type ValidationChecks } from 'langium';
import { AttributesBlock, ClassDef, FrameWebWriterToolAstType} from './generated/ast.js';
import type { FrameWebWriterToolServices } from './frame-web-writer-tool-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FrameWebWriterToolServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.FrameWebWriterToolValidator;
    const checks: ValidationChecks<FrameWebWriterToolAstType> = {
        ClassDef: [validator.checkClassIndentation, validator.checkClassStartsWithCapital],
        AttributesBlock: validator.checkAttributeIndentation
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class FrameWebWriterToolValidator {

    static countLeadingTabs(text: string): number {
        const match = text.match(/^\t+/); // Captura apenas TABs no início
        return match ? match[0].length : 0;
    }
    

    checkClassStartsWithCapital(classDef: ClassDef, accept: ValidationAcceptor): void {
        if (classDef.name) {
            const firstChar = classDef.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Class name should start with a capital.', { node: classDef, property: 'name' });
            }
        }
    }

    // Valida se a definição da classe começa com TAB
    checkClassIndentation(classDef: ClassDef, accept: ValidationAcceptor): void {
        const text = classDef.$cstNode?.text;

        if (text && !text.startsWith('\t')) {
            // const match = text.match(/^\t+/);
            // let tabs = match ? match[0].length : 0;
            accept('error', 'A definição da classe deve começar com uma tabulação.', {
                node: classDef
            });
        }
    }

    checkAttributeIndentation(attributeBlock: AttributesBlock, accept: ValidationAcceptor): void {
        const classText = attributeBlock.$cstNode?.text ?? "";
        const classIndentation = FrameWebWriterToolValidator.countLeadingTabs(classText); // TABs antes da 'Class'
        
        if (attributeBlock.$cstNode) {
            for (const attr of attributeBlock.attributes) {
                const attrText = attr.$cstNode?.text ?? "";
                const attrIndentation = FrameWebWriterToolValidator.countLeadingTabs(attrText); // TABs antes do atributo
    
                console.debug(`Class "${attributeBlock.name}" tem ${classIndentation} TABs.`);
                console.debug(`Atributo "${attr.name}" tem ${attrIndentation} TABs.`);
    
                if (attrIndentation <= classIndentation) {
                    accept('error', 'Os atributos devem estar pelo menos um nível mais indentados que a classe.', {
                        node: attr,
                        property: 'name'
                    });
                }
            }
        }
    }
    

}
