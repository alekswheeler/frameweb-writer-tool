grammar FrameWebWriterTool

entry Program:
    (imports+=FileImport)*
    (stmts+=Stmt)*
    ;

Stmt: packageDeclaration=PackageDeclaration | model=Model;

FileImport:
    'import' (imports+=ImportSpec (',' personImports+=ImportSpec)*) 'from' file=STRING ';';

ImportSpec:
    className=[ClassDef:ID] ('as' alias=ID)?; 

PackageType returns string:
    'controller'    |
    'service'       |
    'domain'        |
    'view'          |
    'persistence';

PackageDeclaration:
    ('@' pType=PackageType)?
    'Package' name=QualifiedName '{'
        (classes+=ClassDef | relations+=RelationDefinition)*
    '}';

ClassSteriotype returns string:
    'transient' | 'mapped'| 'persistent' // Entity Model
    | 'page' | 'template' | 'form' | 'binary' // View Model
;

AttributeSteriotype returns string:
    'transient' | 'id' |'persistent' | 'version' | 'lob' | 'embededd';

Model:
    (Page | ClassDef | RelationDefinition);

Page:
    'Page' name=ID;

// todo: table=name
ClassDef:
    ('@' stereotype=ClassSteriotype)?
    'Class' name=ID '{' attributes+=Attribute* methods+=Method* '}';

Attribute:
    ('@' steriotype=AttributeSteriotype)?
    name=ID ':'
    type=TypeRef ( '{' constraints+=AttributeConstraint (',' constraints+=AttributeConstraint)* '}')? ',';

Method:
    name=ID  '(' ( parameters+=ID (',' parameters+=ID)* )? ')'
    ':' 
    type=TypeRef ',';

TypeRef:
    PrimitiveType | CustomType;

RelationDefinition: 
    relationType=RelationType name=ID? '{' 
        block=RelationBlock? 
    '}' | 
    'Inheritance' '{' 
        block=InheritanceRelationBlock?
    '}';

RelationBlock:
    (relations+=Relation)+;

Relation: 
	from=CustomType 
    cardinalityFrom=Cardinality?
    ('->' | '--') 
    cardinalityTo=Cardinality?
    to=CustomType 
    ;

Cardinality returns string:
    (('[' (INT|'*'|'n'|'m') '..' (INT|'*'|'n'|'m') ']') | ('[' (INT|'*'|'n'|'m') ']'))
    ;

InheritanceRelation:
	from=CustomType 
    ('->' | 'extends') 
    to=CustomType 
    ;

InheritanceRelationBlock: 
    (relations+=InheritanceRelation)+;    

RelationType:
    associationType=('Association' | 'Agregation' | 'Composition' | 'Dependency');

PrimitiveType:
    type=('number' | 'string' | 'bool');

CustomType:
    type=[ClassDef : QualifiedName];

AttributeConstraint:
    name=ID ('=' value=(ID | INT | STRING))?;

QualifiedName returns string:
    ID ('.' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
