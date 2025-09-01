import { DefaultDocumentBuilder, URI } from "langium";
import { LangiumSharedServices } from "langium/lsp";
import fs from "fs";
import path from "path";
import { FileSystemProvider } from "vscode";

// workspace-initializer.ts
export class FrameWebWorkspaceInitializer {

    constructor(
        private documentBuilder: DefaultDocumentBuilder,
        private fileSystemProvider: FileSystemProvider
    ) {}

	static async initialize(services: LangiumSharedServices, rootPath: string) {
		const files = this.findFrameworkFiles(rootPath);
		
		for (const file of files) {
			const uri = URI.file(file);
			await services.workspace.LangiumDocuments.getOrCreateDocument(uri);
		}
		
		await services.workspace.DocumentBuilder.build(
			services.workspace.LangiumDocuments.all.toArray()
		);
		
		// console.log(`🎯 Workspace initialized with ${files.length} files`);
	}

	/**
     * Encontra todos os arquivos de framework (.fww, .fwt, .frameweb) recursivamente
     */
    static findFrameworkFiles(rootPath: string): string[] {
        const frameworkFiles: string[] = [];
        
        // console.log(`🔍 Searching for framework files in: ${rootPath}`);
        
        const findFilesRecursively = (currentPath: string): void => {
            try {
                // Verifica se o diretório existe
                if (!fs.existsSync(currentPath)) {
                    // console.log(`   📂 Directory does not exist: ${currentPath}`);
                    return;
                }
                
                const stats = fs.statSync(currentPath);
                
                // Se for arquivo, verifica se é do framework
                if (stats.isFile()) {
                    const ext = path.extname(currentPath).toLowerCase();
                    if (ext === '.fwt') {
                        frameworkFiles.push(currentPath);
                        // console.log(`   ✅ Found: ${path.basename(currentPath)}`);
                    }
                    return;
                }
                
                // Se for diretório, busca recursivamente (ignorando node_modules e diretórios ocultos)
                if (stats.isDirectory()) {
                    const dirName = path.basename(currentPath);
                    
                    // Ignora node_modules e diretórios ocultos
                    if (dirName === 'node_modules' || dirName.startsWith('.')) {
                        // console.log(`   ⏭️  Skipping: ${dirName}`);
                        return;
                    }
                    
                    // console.log(`   📂 Entering: ${dirName}`);
                    
                    const items = fs.readdirSync(currentPath);
                    
                    for (const item of items) {
                        const fullPath = path.join(currentPath, item);
                        findFilesRecursively(fullPath);
                    }
                }
                
            } catch (error) {
                console.error(`   ❌ Error accessing ${currentPath}:`, error);
            }
        };
        
        // Inicia a busca recursiva
        findFilesRecursively(rootPath);
        
        // console.log(`📦 Total framework files found: ${frameworkFiles.length}`);
        return frameworkFiles;
    }
}