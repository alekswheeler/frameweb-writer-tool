import { Model, ClassDef, PackageDeclaration, Program, InheritanceRelation, RelationBlock, RelationType, RelationDefinition, Page } from '../language/generated/ast.js';
import { expandToNode, joinToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractAstNode, extractDestinationAndName } from './cli-util.js';
import { AstUtils } from 'langium';

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
                if (x.$type === ClassDef) {
                    result += evalClassDefinition(x);
                }
                if (x.$type === RelationDefinition) {
                    result += evalRelationDefinition(x);
                }
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

    if(classDef.steriotype !== undefined){
        classAnotations += `\n<< ${classDef.steriotype}>> ${classDef.name}\n`;
    }

    // console.log("class", element.name);
    classDef.attributes.forEach((att) => {
      result += `+String ${att.name}\n`;
      // console.log(element.name, ": +String",att.name)
    });
    // console.log()
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

            result += `${x.to} ${cardinalityTo} ${relationConnector} ${cardinalityFrom} ${x.from}\n`;

            if (relationName !== undefined) {
                result += ` : ${relationName} \n`;
            }
            });
    }
    return result;
}