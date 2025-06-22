grammar FrameWebWriterTool

entry Program: (stmts+=Stmt)*;

Stmt: Tier;

Tier: (PackageDeclaration);

PackageDeclaration:
    'Package' name=QualifiedName '{'
        classes+=ClassDef*
        relations+=RelationDefinition*
    '}';


// AppTier:
//     'Application' '{' 
//         classes+=ClassDef*
//         relations+=RelationDefinition*
//     '}';

// NaviTier:
//     'Navigation' classes+=ClassDef;

// PersTier:
//     'Persistence' classes+=ClassDef;

// ==================================

Model: (Package | ClassDef);

Package:
    'Page' name=ID;

ClassDef:
    'Class' name=ID '{'  attributes+=Attribute+  '}';

Attribute:
   name=ID ':' type=TypeRef ',';

TypeRef:
    PrimitiveType | CustomType;

RelationDefinition: 
    relationType=RelationType name=ID? '{' 
        RelationBlock? 
    '}' | 
    'Inheritance' '{' 
        InheritanceRelation
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
    (('"' (INT|'*'|'n'|'m') '..' (INT|'*'|'n'|'m') '"') | ('"' (INT|'*'|'n'|'m') '"'))
    ;

InheritanceRelation:
	from=QualifiedName ('->' | 'extends') to=QualifiedName;

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
