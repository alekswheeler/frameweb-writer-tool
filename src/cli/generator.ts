import { Model, ClassDef, Program, RelationType, RelationDefinition, Page, PrimitiveType, CustomType } from '../language/generated/ast.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';

export function generateJavaScript(model: Model, filePath: string, destination: string | undefined): string {
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

let classAnotations = '';

export function generateMermaidMd(program: Program, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.md`;

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }

    classAnotations = '';
    let result = "\nclassDiagram\n\n";
    program.stmts.forEach(stmt => {
        if(stmt.packageDeclaration){
            result += "namespace " + stmt.packageDeclaration.name + "{\n\n";
        
            let packageDef = stmt.packageDeclaration;
        
            let classesArray = packageDef?.classes;
        
            classesArray?.forEach(element => {
                result += evalClassDefinition(element);
            });
        
            result += '}\n';
            let relationDefArray = packageDef?.relations;
        
            relationDefArray?.forEach(element => {
                result += evalRelationDefinition(element);
            });
        }else{
            if(stmt.model){
                let x = stmt.model;

                if (x.$type === Page) {
                }
                if (x.$type === ClassDef)
                    result += evalClassDefinition(x);
                if (x.$type === RelationDefinition)
                    result += evalRelationDefinition(x);
            }
        }
    });

    result += classAnotations;
    fs.writeFileSync(generatedFilePath, result);
    return result;
}

function evalClassDefinition(classDef: ClassDef): string{
    let result = "";

    result += `class ${classDef.name}{\n`;

    if(classDef.stereotype !== undefined){
        classAnotations += `\n<< ${classDef.stereotype} >> ${classDef.name}\n`;
    }

    // console.log("class", element.name);
    classDef.attributes?.forEach((att) => {
      let attribute = att.type;
      let stereotype = "";

      if(att.steriotype){
        stereotype = `<< ${att.steriotype} >>`
      }

      if(attribute.$type === PrimitiveType){
          result += `${stereotype} ${attribute.type} : ${att.name} `;
      } else if (attribute.$type === CustomType){
          let customType = att.type as CustomType;
          result += `${customType.type.$refText} : ${att.name} `;
      }
    // attribute constraints (if any)
    const constraints = (att as any).constraints as Array<any> | undefined;
    if (constraints && constraints.length > 0) {
        const cs = constraints.map(c => {
            if (c.value === undefined) return `${c.name}`;
            return `${c.name}=${c.value}`;
        }).join(', ');
        result += ` #123; ${cs} #125;\n`;
    } else {
        result += `\n`;
    }
      // console.log(element.name, ": +String",att.name)
    });

    classDef.methods?.forEach((mtd)=>{
        let mtdType = mtd.type;

        if(mtdType.$type === PrimitiveType){
            result += `${mtdType.type} : ${mtd.name} `;
        } else if (mtdType.$type === CustomType){
            let customType = mtd.type as CustomType;
            result += `${customType.type.$refText} : ${mtd.name} `;
        }

        result += '(' + mtd.parameters.join(', ') + ")\n";
    });
    result += "}\n";
    return result;
}

function evalRelationDefinition(association: RelationDefinition): string{
    let result = "";
    if (association.inheritance) {
        const inhetance = association.inheritance;

        const value = `${inhetance.to.ref?.name} <|-- ${inhetance.from.ref?.name} \n`;
        result += value;
    }
    if (association.block) {
        let relation = association;

        let relationName = relation.name;
        let relationType = relation.relationType as RelationType;
        let relationTypeName = relationType.associationType;

        let relations = relation.block?.relations;

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
        default:
            break;
        }

        relations?.forEach((x) => {
            let cardinalityFrom =
                x.cardinalityFrom === undefined
                ? ""
                : x.cardinalityFrom
                    .replace("[", '"')
                    .replace("]", '"');

            let cardinalityTo =
                x.cardinalityTo === undefined
                ? ""
                : x.cardinalityTo
                    .replace("[", '"')
                    .replace("]", '"');

            result += `${x.to} ${cardinalityTo} ${relationConnector} ${cardinalityFrom} ${x.from} `;

            if (relationName !== undefined) result += ` : ${relationName} \n`;
            else result += "\n";
            
        });
    }
    return result;
}