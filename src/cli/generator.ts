import { Model, ClassDef, PackageDeclaration, Program, InheritanceRelation, RelationBlock, RelationType } from '../language/generated/ast.js';
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

export function generateMermaidMd(program: Program, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.md`;

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }

    let result = "classDiagram\n\n";

    result += "namespace " + program.stmts[0].name + '{\n\n';

    let classesArray = program.stmts[0].classes;

    classesArray.forEach(element => {
        result += `class ${element.name}{\n`;
        // console.log("class", element.name);
        element.attributes.forEach(att => {
            result += `+String ${att.name}\n`;
            // console.log(element.name, ": +String",att.name)
        });
        // console.log()
        result += "}\n";
    });

    
    result += '}\n';
    let relationDefArray = program.stmts[0].relations;

    relationDefArray.forEach(element => {
        if(element.$type === InheritanceRelation){
            const inhetance = element as InheritanceRelation;
            const value = `${inhetance.to} <|-- ${inhetance.from}`;
            result += value;
        }
        if(element.$type === RelationBlock){
            let relationName = element.name;
            let relationType = element.relationType as RelationType;
            let relationTypeName = relationType.associationType;
            
            let relation = element as RelationBlock;
            let relations = relation.relations;


            if(relationTypeName === 'Composition'){
                relations.forEach(x => {
                    result += `${x.to} "${x.fromN}"  *-- "${x.toN}" ${x.from}`;
                    if(relationName !== undefined){
                        result += ` : ${relationName} \n`;
                    }
                });
            }

            if(relationTypeName === 'Agregation'){
                relations.forEach(x => {
                    result += `${x.to} "${x.fromN}" o-- "${x.toN}" ${x.from}`;
                    if(relationName !== undefined){
                        result += ` : ${relationName} \n`;
                    }
                });
            }

            if(relationTypeName === 'Association'){
                relations.forEach(x => {
                    result += `${x.to} "${x.fromN}" <-- "${x.toN}" ${x.from}`;
                    if(relationName !== undefined){
                        result += ` : ${relationName} \n`;
                    }
                });
            } 
        }

    });


    fs.writeFileSync(generatedFilePath, result);
    return result;
}