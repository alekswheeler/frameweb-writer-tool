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

// something here to show
PackageType returns string:
    'controller'    |
    'service'       |
    'domain'        |
    'view'          |
    'persistence';

PackageDeclaration:
    ('@' pType=PackageType)?
    'Package' name=QualifiedName '{'
        classes+=ClassDef*
        relations+=RelationDefinition*
    '}';

// Estereótipos gerais (*podem não ser tão gerais assim)

ClassSteriotype returns string:
    'transient' | 'mapped'| 'persistent';

AttributeSteriotype returns string:
    'transient' | 'id' |'persistent' | 'version' | 'lob' | 'embededd';

Model:
    (Page | ClassDef | RelationDefinition);

Page:
    'Page' name=ID;

ClassDef:
    ('@' steriotype=ClassSteriotype)?
    'Class' name=ID '{' attributes+=Attribute* '}';

Attribute:
//    ('<<' steriotype=AttributeSteriotype '>>')?
   name=ID ':' type=TypeRef ',';

TypeRef:
    PrimitiveType | CustomType;

RelationDefinition: 
    relationType=RelationType name=ID? '{' 
        block=RelationBlock? 
    '}' | 
    'Inheritance' '{' 
        inheritance=InheritanceRelation
    '}';

RelationBlock:
    (relations+=Relation)+;

Relation: 
	from=QualifiedName 
    cardinalityFrom=Cardinality?
    ('->' | '--') 
    cardinalityTo=Cardinality?
    to=QualifiedName 
    ;

Cardinality returns string:
    (('[' (INT|'*'|'n'|'m') '..' (INT|'*'|'n'|'m') ']') | ('[' (INT|'*'|'n'|'m') ']'))
    ;

InheritanceRelation:
    from=[ClassDef:QualifiedName] ('->' | 'extends') to=[ClassDef:QualifiedName];

RelationType:
    associationType=('Association' | 'Agregation' | 'Composition');

PrimitiveType:
    type=('number' | 'string' | 'bool');

CustomType:
    type=[ClassDef : QualifiedName];

QualifiedName returns string:
    ID ('.' ID)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
