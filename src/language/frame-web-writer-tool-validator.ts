import { type ValidationAcceptor, type ValidationChecks } from "langium";
import {
  Attribute,
  Cardinality,
  ClassDef,
  FrameWebWriterToolAstType,
  PackageDeclaration,
  Relation,
  RelationDefinition,
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
    Relation: [validator.validateCardinality],
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
    let viewStereotype = ["page", "form", "binary"];
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
              if (viewStereotype.includes(pClass.stereotype)) {
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

  private isValidTokenCardinality(token: string): boolean {
    var validTokens = ["*", "n", "m"];
    return validTokens.includes(token);
  }

  //todo: passar o property
  private checkCardinalityProperty(
    token: string,
    node: Relation,
    accept: Function,
  ) {
    let parsedToken = Number.parseFloat(token);
    if (!this.isValidTokenCardinality(token)) {
      if (!Number.isInteger(parsedToken) || parsedToken < 0) {
        accept("error", "Multiplicity of relations must be positive integer.", {
          node,
        });
      }
    }
  }

  validateCardinality(relation: Relation, accept: ValidationAcceptor): void {
    let token: string | undefined;
    let parsedToken: number;

    if (relation.cardinalityFrom) {
      token = relation.cardinalityFrom.self?.toString();
      if (token) {
        this.checkCardinalityProperty(token, relation, accept);
      }
      token = relation.cardinalityFrom.end?.toString();
      if (token) {
        this.checkCardinalityProperty(token, relation, accept);
      }
      token = relation.cardinalityFrom.start?.toString();
      if (token) {
        this.checkCardinalityProperty(token, relation, accept);
      }
    }

    if (relation.cardinalityTo) {
      token = relation.cardinalityTo.self?.toString();
      if (token) {
        this.checkCardinalityProperty(token, relation, accept);
      }
      token = relation.cardinalityTo.end?.toString();
      if (token) {
        this.checkCardinalityProperty(token, relation, accept);
      }
      token = relation.cardinalityTo.start?.toString();
      if (token) {
        this.checkCardinalityProperty(token, relation, accept);
      }
    }
  }
}
