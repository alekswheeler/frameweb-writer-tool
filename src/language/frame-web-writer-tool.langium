grammar FrameWebWriterTool

entry Program: (stmts+=Stmt)*;

Stmt: Tier | (Tier | Model);

Tier: (AppTier | NaviTier | PersTier);

AppTier:
    'Application' NL (TAB classes+=ClassDef)*;

NaviTier:
    'Navigation' NL (TAB classes+=ClassDef)*;

PersTier:
    'Persistence' NL (TAB classes+=ClassDef)*;

Model: (Package | ClassDef);

Package:
    'Page' name=ID;

ClassDef:
    'Class' name=ID ':'? NL (TAB attributes+=Attribute (',' attributes+=Attribute)*)?;

Attribute:
    name=ID ':' type=ID;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/;
terminal TAB: /\t+/;
terminal NL: /[\r\n]+/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
