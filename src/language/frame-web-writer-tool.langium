grammar FrameWebWriterTool

entry Program: (stmts+=Stmt)*;

Stmt: Tier; //| (Tier | Model);

Tier: (AppTier | NaviTier | PersTier);

AppTier:
    'Application' NL classes+=ClassDef*;

NaviTier:
    'Navigation' classes+=ClassDef;

PersTier:
    'Persistence' classes+=ClassDef;

Model: (Package | ClassDef);

Package:
    'Page' name=ID;

ClassDef:
    TAB? 'Class' name=ID ':' NL AttributesBlock?;

AttributesBlock: attributes+=Attribute+;

Attribute:
    TAB? name=ID ':' type=ID (NL)*;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal TAB: /\t+/;
terminal NL: /[\r\n]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
