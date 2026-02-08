import { type ValidationAcceptor, type ValidationChecks } from "langium";
import {
  Attribute,
  ClassDef,
  FrameWebWriterToolAstType,
  PackageDeclaration,
} from "./generated/ast.js";
import type { FrameWebWriterToolServices } from "./frame-web-writer-tool-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FrameWebWriterToolServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.FrameWebWriterToolValidator;
  const checks: ValidationChecks<FrameWebWriterToolAstType> = {
    ClassDef: [validator.checkClassStartsWithCapital],
    PackageDeclaration: [validator.checkClassStereotype],
    Attribute: [validator.checkCustomType],
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class FrameWebWriterToolValidator {
  private services: FrameWebWriterToolServices;

  constructor(services: FrameWebWriterToolServices) {
    this.services = services;
  }

  checkClassStartsWithCapital(
    classDef: ClassDef,
    accept: ValidationAcceptor,
  ): void {
    if (classDef.name) {
      const firstChar = classDef.name.substring(0, 1);
      if (firstChar.toUpperCase() !== firstChar) {
        accept("warning", "Class name should start with a capital.", {
          node: classDef,
          property: "name",
        });
      }
    }
  }
  checkClassStereotype(
    packageDef: PackageDeclaration,
    accept: ValidationAcceptor,
  ): void {
    let domainStereotype = ["transient", "mapped", "persistent"];
    let viewStereotype = ["page", "template", "form", "binary"];
    if (packageDef.pType) {
      let pClasses = packageDef.classes;
      pClasses.forEach((pClass) => {
        if (pClass.stereotype) {
          switch (packageDef.pType) {
            case "domain":
              if (!domainStereotype.includes(pClass.stereotype)) {
                accept("error", "Invalid stereotype.", {
                  node: pClass,
                  property: "stereotype",
                });
              }
              break;
            case "view":
              if (!viewStereotype.includes(pClass.stereotype)) {
                accept("error", "Invalid stereotype.", {
                  node: pClass,
                  property: "stereotype",
                });
              }
              break;
            case "controller":
            case "service":
            case "persistence":
              if (!viewStereotype.includes(pClass.stereotype)) {
                accept("error", "Invalid stereotype.", {
                  node: pClass,
                  property: "stereotype",
                });
              }
              break;
            default:
              break;
          }
        }
      });
    } else {
      let pClasses = packageDef.classes;
      pClasses.forEach((pClass) => {
        if (pClass.stereotype) {
          accept("error", "You must define a package stereotype", {
            node: pClass,
            property: "stereotype",
          });
        }
      });
    }
  }

  checkCustomType(attribute: Attribute, accept: ValidationAcceptor): void {
    try {
      const typesArray: string[] =
        this.services.configuration.FrameWebWriterToolConfig.getTypes();
      if (typesArray.length > 0) {
        if (!attribute.type.typeName.$nodeDescription) {
          if (!typesArray.includes(attribute.type.typeName.$refText)) {
            accept(
              "error",
              `Type ${attribute.type.typeName.$refText} isnt defined`,
              {
                node: attribute,
                property: "type",
              },
            );
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}
