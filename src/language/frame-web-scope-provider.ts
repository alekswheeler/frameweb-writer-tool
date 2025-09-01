// language/frame-web-scope-provider.ts
import { AstNodeDescription, AstUtils, DefaultScopeProvider, ReferenceInfo, Scope, URI } from "langium";
import path from "path";
import { FrameWebWriterToolServices } from "./frame-web-writer-tool-module.js";
import { Program } from "./generated/ast.js";

export class FrameWebScopeProvider extends DefaultScopeProvider {
    
    constructor (services: FrameWebWriterToolServices){
        super(services);
    }

    override getScope(context: ReferenceInfo): Scope {
        // Para referências em herança
        if (context.container.$type === 'ImportSpec') {
            if (context.property === 'className') {
                const r = this.getExportedClassesFromGlobalScope(context); 
                return r;
            }
        }
        
        if (context.property === 'from') {
            const r = this.getImportedClassesFromCurrentFile(context); 
            return r;
        }
        
        return super.getScope(context);
    }

    private getExportedClassesFromGlobalScope(context: ReferenceInfo): Scope {
        // console.log(' Getting exported classes from global scope...');
        
        const document = AstUtils.getDocument(context.container);
        const model = document.parseResult.value as Program;
        const currentUri = document.uri;
        const currentDir = path.dirname(currentUri.fsPath);
        
        const uris = new Set<string>();
        
        // console.log(`Current directory: ${currentDir}`);
        // console.log(`Current URI: ${currentUri.toString()}`);
        

        for (const fileImport of model.imports) {
            
            const cleanPath = fileImport.file.replace(/['"]/g, '');
            const filePath = path.join(currentDir, cleanPath);
            
            const uri = URI.file(filePath);

            uris.add(uri.toString());
        }
        
        // console.log(`URIs to search: ${uris.size}`);
        // uris.forEach(uri => console.log(`   - ${uri}`));

        // const allIndexed = this.indexManager.allElements('ClassDef').toArray();
        // console.log('All indexed classes:', allIndexed.map(e => e.name));
        
        const astNodeDescriptions = this.indexManager.allElements(
            'ClassDef', // Busca apenas classes
            uris
        ).toArray();
        
        return this.createScope(astNodeDescriptions);
    }

    // ✅ Função 2: Pega classes importadas no arquivo atual  
    private getImportedClassesFromCurrentFile(context: ReferenceInfo): Scope {
        const document = AstUtils.getDocument(context.container);
        const model = document.parseResult.value as Program;
        
        if (!model.imports) {
            return this.createScope([]);
        }
    
        const descriptions = model.imports.flatMap(fileImport => 
            fileImport.imports.map(importSpec => {
                
                if (importSpec.className?.ref) {

                    return this.descriptions.createDescription(
                        importSpec.className.ref,          // ✅ A CLASSE REAL
                        importSpec.alias || importSpec.className.ref.name  // ✅ Nome ou alias
                    );
                }
                
                return undefined;
            }).filter((d): d is AstNodeDescription => d !== undefined)
        );
        
        return this.createScope(descriptions);
    }
}