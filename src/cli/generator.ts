import { Model, ClassDef, PackageDeclaration, Program } from '../language/generated/ast.js';
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

    let classesArray = program.stmts[0].classes;

    classesArray.forEach(element => {
        result += `class ${element.name}\n`;
        // console.log("class", element.name);
        element.attributes.forEach(att => {
            result += `${element.name} : +String ${att.name}\n`;
            // console.log(element.name, ": +String",att.name)
        });
        // console.log()
        result += "\n";
    });

    fs.writeFileSync(generatedFilePath, result);
    return result;
}