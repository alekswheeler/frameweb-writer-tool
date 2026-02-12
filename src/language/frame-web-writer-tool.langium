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
        (classes+=ClassDef | relations+=RelationDefinition | interfaces+=Interface)*
    '}';

ClassSteriotype returns string:
    'transient' | 'mapped'| 'persistent' // Entity Model
    | 'page' | 'form' | 'binary' // View Model
;

AttributeSteriotype returns string:
    'transient' | 'id' |'persistent' | 'version' | 'lob' | 'embededd';

Model:
    (Page | ClassDef | RelationDefinition | Interface);

Page:
    'Page' name=ID;

// todo: table=name
ClassDef:
    ('@' stereotype=ClassSteriotype)?
    'Class' name=ID ('implements' implements=[Interface: ID])? '{' attributes+=Attribute* methods+=Method* '}' ;

Interface:
    'Interface' name=ID '{' methods+=Method* '}' ;

Attribute:
    ('@' steriotype=AttributeSteriotype)?
    name=ID ':'
    type=TypeRef ( '{' constraints+=AttributeConstraint (',' constraints+=AttributeConstraint)* '}')? ',';

Method:
    name=ID  '(' ( parameters+=ID (',' parameters+=ID)* )? ')'
    ':' 
    type=TypeRef ',';

TypeRef:
    typeName=[ClassDef:QualifiedName];

RelationDefinition: 
    relationType=RelationType name=ID? '{' 
        block=RelationBlock? 
    '}' | 
    inheritance=('Inheritance') '{' 
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

Cardinality:
    (('[' start=(DECIMAL|'*'|'n'|'m') '..' end=(DECIMAL|'*'|'n'|'m') ']') | ('[' self=(DECIMAL|'*'|'n'|'m') ']'))
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

CustomType:
    type=[ClassDef : QualifiedName];

AttributeConstraint:
    name=(ID|'size') ( operator=('='|'>='|'<='|'>'|'<'|'!=') value=(DECIMAL))?
    | name = 'precision' '=' value = ('date' | 'time' | 'timestamp')
    | name = 'generation' '=' value=('auto'|'identity'|'none'|'sequence')
    | name = 'notnull' | name='nullabe'
    | name = 'column' '=' value=ID
    ;

QualifiedName returns string:
    ID ('.' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
// terminal INT returns string: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
// terminal DECIMAL returns number: /('-'?[0-9]+(?:\.[0-9]*)?)/;
terminal DECIMAL returns number: /[+-]?[0-9]+(\.[0-9]+)?/;


hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
