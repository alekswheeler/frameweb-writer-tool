import {
  Model,
  ClassDef,
  Program,
  RelationType,
  RelationDefinition,
  Page,
  Relation,
} from "../language/generated/ast.js";
import * as fs from "node:fs";
import * as path from "node:path";
import { extractDestinationAndName } from "./cli-util.js";

export function generateJavaScript(
  model: Model,
  filePath: string,
  destination: string | undefined,
): string {
  // const data = extractDestinationAndName(filePath, destination);
  // const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

  // const fileNode = expandToNode`
  //     "use strict";

  //     ${joinToNode(model.greetings, greeting => `console.log('Hello, ${greeting.person.ref?.name}!');`, { appendNewLineIfNotEmpty: true })}
  // `.appendNewLineIfNotEmpty();

  // if (!fs.existsSync(data.destination)) {
  //     fs.mkdirSync(data.destination, { recursive: true });
  // }
  // fs.writeFileSync(generatedFilePath, toString(fileNode));
  // return generatedFilePath;
  return "";
}

let classAnotations = "";

export function generateMermaidMd(
  program: Program,
  filePath: string,
  destination: string | undefined,
): string {
  const data = extractDestinationAndName(filePath, destination);
  const generatedFilePath = `${path.join(data.destination, data.name)}.md`;

  if (!fs.existsSync(data.destination)) {
    fs.mkdirSync(data.destination, { recursive: true });
  }

  classAnotations = "";
  let result = "\nclassDiagram\n\n";
  program.stmts.forEach((stmt) => {
    if (stmt.packageDeclaration) {
      result += "namespace " + stmt.packageDeclaration.name + "{\n\n";

      let packageDef = stmt.packageDeclaration;

      let classesArray = packageDef?.classes;

      classesArray?.forEach((element) => {
        result += evalClassDefinition(element);
      });

      result += "}\n";
      let relationDefArray = packageDef?.relations;

      relationDefArray?.forEach((element) => {
        result += evalRelationDefinition(element);
      });
    } else {
      if (stmt.model) {
        let x = stmt.model;

        if (x.$type === Page) {
        }
        if (x.$type === ClassDef) result += evalClassDefinition(x);
        if (x.$type === RelationDefinition) result += evalRelationDefinition(x);
      }
    }
  });

  result += classAnotations;
  fs.writeFileSync(generatedFilePath, result);
  return result;
}

function evalClassDefinition(classDef: ClassDef): string {
  let result = "";

  result += `class ${classDef.name}{\n`;

  if (classDef.stereotype !== undefined) {
    classAnotations += `\n<< ${classDef.stereotype} >> ${classDef.name}\n`;
  }

  // console.log("class", element.name);
  classDef.attributes?.forEach((att) => {
    let attribute = att.type;
    let stereotype = "";

    if (att.steriotype) {
      stereotype = `<< ${att.steriotype} >>`;
    }

    result += `${stereotype} ${att.type.typeName.$refText} : ${att.name} `;

    // attribute constraints (if any)
    const constraints = (att as any).constraints as Array<any> | undefined;
    if (constraints && constraints.length > 0) {
      const cs = constraints
        .map((c) => {
          if (c.value === undefined) return `${c.name}`;
          return `${c.name} ${c.operator ?? "="} ${c.value}`;
        })
        .join(", ");
      result += ` #123; ${cs} #125;\n`;
    } else {
      result += `\n`;
    }
    // console.log(element.name, ": +String",att.name)
  });

  classDef.methods?.forEach((mtd) => {
    let mtdType = mtd.type;

    result += `${mtd.type.typeName.$refText} : ${mtd.name} `;

    result += "(" + mtd.parameters.join(", ") + ")\n";
  });
  result += "}\n";
  return result;
}

function evalRelationDefinition(association: RelationDefinition): string {
  let result = "";

  if (association.relationType) {
    let relation = association;

    let relationName = relation.name;
    let relationType = relation.relationType as RelationType;
    let relationTypeName = relationType.associationType;

    let relations = relation.block?.relations as Relation[];

    let relationConnector = "";

    switch (relationTypeName) {
      case "Composition":
        relationConnector = "*--";
        break;
      case "Agregation":
        relationConnector = "o--";
        break;
      case "Association":
        relationConnector = "<--";
        break;
      case "Dependency":
        relationConnector = "<..";
        break;
      default:
        break;
    }

    relations?.forEach((x) => {
      let cardinalityFrom =
        x.cardinalityFrom === undefined
          ? ""
          : x.cardinalityFrom.$cstNode?.text
              .replace("[", '"')
              .replace("]", '"');

      let cardinalityTo =
        x.cardinalityTo === undefined
          ? ""
          : x.cardinalityTo.$cstNode?.text.replace("[", '"').replace("]", '"');

      result += `${x.to.type.$refText} ${cardinalityTo} ${relationConnector} ${cardinalityFrom} ${x.from.type.$refText} `;

      if (relationName !== undefined) result += ` : ${relationName} \n`;
      else result += "\n";
    });
  } else {
    let relations = association.block?.relations;
    relations?.forEach((x) => {
      result += `${x.to.type.$refText}  <|-- ${x.from.type.$refText}\n`;
    });
  }
  return result;
}
