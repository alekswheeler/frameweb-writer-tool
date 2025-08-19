import { DefaultScopeComputation, LangiumDocument, AstNodeDescription } from "langium";
import { LangiumServices } from "langium/lsp";
import { isPackageDeclaration, isModel, isClassDef, isPage, isRelationDefinition, Program } from "./generated/ast.js";


export class FrameWebScopeComputation extends DefaultScopeComputation {
  constructor(services: LangiumServices) {
    super(services);
  }

  override async computeExports(
    document: LangiumDocument
  ): Promise<AstNodeDescription[]> {
    const program = document.parseResult.value as Program;
    const descriptions: AstNodeDescription[] = [];

    // Processa todas as declarações do programa
    for (const stmt of program.stmts) {
      if (
        stmt.packageDeclaration &&
        isPackageDeclaration(stmt.packageDeclaration)
      ) {
        // Adiciona o próprio pacote
        descriptions.push(
          this.createDescription(
            stmt.packageDeclaration,
            stmt.packageDeclaration.name
          )
        );

        // Processa classes dentro do pacote
        for (const classDef of stmt.packageDeclaration.classes) {
          descriptions.push(
            this.createDescription(
              classDef,
              this.getQualifiedName(classDef.name, stmt.packageDeclaration.name)
            )
          );
        }

        // Processa relações dentro do pacote
        for (const relation of stmt.packageDeclaration.relations) {
          if (relation.name) {
            descriptions.push(
              this.createDescription(
                relation,
                this.getQualifiedName(
                  relation.name,
                  stmt.packageDeclaration.name
                )
              )
            );
          }
        }
      } else if (stmt.model && isModel(stmt.model)) {
        // Processa elementos de nível superior (global scope)
        if (isClassDef(stmt.model)) {
          descriptions.push(
            this.createDescription(stmt.model, stmt.model.name)
          );
        } else if (isPage(stmt.model)) {
          descriptions.push(
            this.createDescription(stmt.model, stmt.model.name)
          );
        } else if (isRelationDefinition(stmt.model) && stmt.model.name) {
          descriptions.push(
            this.createDescription(stmt.model, stmt.model.name)
          );
        }
      }
    }

    // DEBUG: Mostra o que está sendo exportado
    console.log("=== Exported Elements ===");
    console.log(`File: ${document.uri.fsPath}`);
    descriptions.forEach((desc) => {
      console.log(`- ${desc.name} (${desc.type})`);
    });
    console.log("=========================");

    return descriptions;
  }

  private createDescription(node: any, name: string): AstNodeDescription {
    return this.descriptions.createDescription(node, name);
  }

  private getQualifiedName(name: string, packageName: string): string {
    return `${packageName}.${name}`;
  }
}
