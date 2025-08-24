// language/frame-web-scope-provider.ts
import { AstUtils, DefaultScopeProvider, ReferenceInfo, Scope, URI } from "langium";
import { isFileImport, isInheritanceRelation, Program } from "./generated/ast.js";
import path from "path";
import { FrameWebWriterToolServices } from "./frame-web-writer-tool-module.js";

export class FrameWebScopeProvider extends DefaultScopeProvider {
    

    private services: FrameWebWriterToolServices
    constructor (services: FrameWebWriterToolServices){
        super(services);
        this.services = services;
    }

    override getScope(context: ReferenceInfo): Scope {
        console.log(`\n🔍 ===== SCOPE RESOLUTION =====`);
        console.log(`Context: ${context.container.$type}.${context.property}`);
        console.log(`Reference: ${context.reference?.$refText}`);
        
        const allIndexed = this.indexManager.allElements('ClassDef').toArray();
        console.log('All indexed classes:', allIndexed.map(e => e.name));
        
        // 1. Para referências em herança
        if (context.container.$type === 'ImportSpec') {
            console.log('PROPERTY', context.property);
            if (context.property === 'className') {
                console.log(`🔄 Resolving file import: ${context.reference?.$refText}`);
                return this.getExportedClassesFromGlobalScope(context);
            }
        }
        
        // 2. Para referências em atributos (tipos)
        // if (context.property === 'type') {
        //     console.log(`🔄 Resolving type reference: ${context.reference?.$refText}`);
        //     return this.getImportedClassesFromCurrentFile(context);
        // }
        
        // 3. Para outros casos, usa o escopo padrão
        console.log(`⚡ Using default scope`);
        return super.getScope(context);
    }

    // ✅ Função 1: Pega todas as classes exportadas (global scope)
    private getExportedClassesFromGlobalScope(context: ReferenceInfo): Scope {
        console.log('🌍 Getting exported classes from global scope...');
        
        // get document for current reference
        const document = AstUtils.getDocument(context.container);
        // get model of document
        const model = document.parseResult.value as Program;
        // get URI of current document
        const currentUri = document.uri;
        // get folder of current document
        const currentDir = path.dirname(currentUri.fsPath);
        
        const uris = new Set<string>();
        
        console.log(`📁 Current directory: ${currentDir}`);
        console.log(`📄 Current URI: ${currentUri.toString()}`);
        
        // for all file imports of the current file
        for (const fileImport of model.imports) {
            console.log(`🔗 Processing import: ${fileImport.file}`);
            
            // resolve the file name relatively to the current file
            const cleanPath = fileImport.file.replace(/['"]/g, '');
            const filePath = path.join(currentDir, cleanPath);
            console.log(`   Resolved path: ${filePath}`);
            
            // create back an URI
            const uri = URI.file(filePath);
            console.log(`   URI: ${uri.toString()}`);
            

            // add the URI to URI list
            uris.add(uri.toString());
        }
        
        console.log(`📦 URIs to search: ${uris.size}`);
        uris.forEach(uri => console.log(`   - ${uri}`));
        
        // get all possible classes from these files
        const astNodeDescriptions = this.indexManager.allElements(
            'ClassDef', // Busca apenas classes
            uris
        ).toArray();
        
        console.log(`🎯 Found ${astNodeDescriptions.length} exported classes:`);
        astNodeDescriptions.forEach(desc => {
            console.log(`   - ${desc.name} (${desc.type})`);
        });
        
        // convert them to descriptions inside of a scope
        return this.createScope(astNodeDescriptions);
    }

    // ✅ Função 2: Pega classes importadas no arquivo atual  
    private getImportedClassesFromCurrentFile(context: ReferenceInfo): Scope {
        console.log(`📥 Getting imported classes from current file...`);
        // Implementação seguirá aqui
        return this.createScope([]);
    }
}