import type { ValidationAcceptor, ValidationChecks } from 'langium';
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
    
    //todo verificar o nível que o node pai está para validar se ele está no nível correto
    // Valida se os atributos da classe possuem tabulação correta
    checkAttributeIndentation(attribute: AttributesBlock, accept: ValidationAcceptor, level: number): void {

        attribute.attributes.forEach(x => {
            console.debug(`[${x.$cstNode?.text}]`)
            const text = x.$cstNode?.text;
            
            if (text) {
                const match = text.match(/^\t+/);
                let tabs = match ? match[0].length : 0;
                if(tabs <= level){
                    accept('error', 'Os atributos devem ser indentados com tabulação.', {
                        node: attribute,
                        property: 'name'
                    });
                }
            }
        });
        
    }

}
