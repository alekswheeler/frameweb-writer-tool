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
    'package' name=QualifiedName '{'
        (classes+=ClassDef | relations+=RelationDefinition | interfaces+=Interface)*
    '}';

ClassStereotype returns string:
    'transient' | 'mapped'| 'persistent'
    | 'page' | 'form' | 'binary'
;

AttributeStereotype returns string:
    'transient' | 'id' |'persistent' | 'version' | 'lob' | 'embedded';

Model:
    (Page | ClassDef | RelationDefinition | Interface);

Page:
    'page' name=ID;

ClassDef:
    ('@' stereotype=ClassStereotype)?
    'class' name=ID 
    ('extends' superClass=[ClassDef:ID])?
    ('implements' interfaces+=[Interface:ID] (',' interfaces+=[Interface:ID])*)?
    '{' attributes+=Attribute* methods+=Method* '}' ;

Interface:
    'interface' name=ID ('extends' implements=[ClassDef: ID] )? '{' methods+=Method* '}' ;

Attribute:
    ('@' stereotype=AttributeStereotype)?
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
    (('[' start=(INT|'*'|'n'|'m') '..' end=(INT|'*'|'n'|'m') ']') | ('[' self=(INT|'*'|'n'|'m') ']'))
    ;

RelationType:
    associationType=('association' | 'aggregation' | 'composition' | 'dependency');

CustomType:
    type=[ClassDef : QualifiedName];

AttributeConstraint:
    name = 'size' '=' value=INT
    | name = 'precision' '=' value = ('date' | 'time' | 'timestamp')
    | name = 'generation' '=' value=('auto'|'identity'|'none'|'sequence')
    | name='nullabe'
    | name = 'column' '=' value=ID
    | name=ID (operator=('='|'>='|'<='|'>'|'<'|'!=') value=ID)?
    ;

QualifiedName returns string:
    ID ('.' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns string: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
