import {
  AstNode,
  DefaultDocumentValidator,
  DiagnosticInfo,
  DocumentValidator,
  LangiumCoreServices,
  LangiumDocument,
  LinkingErrorData,
  ValidationOptions,
} from "langium";
import { Diagnostic } from "vscode-languageserver-types";
import { TypeRef } from "./generated/ast.js";

/**
 * Override the Linking error for cross-reference in refernced types (custom types in fwt).
 */

export class FramWebWriterToolDocumentValidator extends DefaultDocumentValidator {
  //#region Override
  protected override processLinkingErrors(
    document: LangiumDocument,
    diagnostics: Diagnostic[],
    _options: ValidationOptions,
  ): void {
    for (const reference of document.references) {
      const linkingError = reference.error;
      if (linkingError) {
        if (linkingError.container.$type == TypeRef) continue;
        const info: DiagnosticInfo<AstNode, string> = {
          node: linkingError.container,
          property: linkingError.property,
          index: linkingError.index,
          data: {
            code: DocumentValidator.LinkingError,
            containerType: linkingError.container.$type,
            property: linkingError.property,
            refText: linkingError.reference.$refText,
          } satisfies LinkingErrorData,
        };
        diagnostics.push(
          super.toDiagnostic("error", linkingError.message, info),
        );
      }
    }
  }
  //#endregion

  //#region Constructor
  constructor(services: LangiumCoreServices) {
    super(services);
  }
  //#endregion
}
