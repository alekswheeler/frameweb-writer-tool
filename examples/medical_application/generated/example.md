
classDiagram

class A{
}
class B{
}
class C{
}
class D{
}
class E{
}
class F{
}
class G{
}
class H{
}


B "*" <-- "1" A  : associacao 


D "1..n" <--o  "m" C  : agregacao 


F "*" <--* "*" E  : composicao 


H  <..  G  : dependencia 
%% ==============================================
%% This block is just for styling the classes

classDef interface stroke:#000,stroke-dasharray: 5 5

%% ==============================================
