
classDiagram

namespace Form_Navigation{

class Index{
}
class RegistrationForm{
 string : name 
 string : email 
 string : password 
 string : repeatPassword 
}
class Succes{
 string : name 
}
class EmailInUse{
 string : email 
}
}
Index  *--  RegistrationForm 
namespace Controller{

class Author{
 string : name 
 string : email 
 string : password 
}
class RegistrationController{
 Author : author 
 string : repeatPassword 
string : register ()
}
}
RegistrationController  <..  RegistrationForm 
Succes  <..  RegistrationController 
EmailInUse  <..  RegistrationController 

<< page >> Index

<< form >> RegistrationForm

<< page >> Succes

<< page >> EmailInUse
%% ==============================================
%% This block is just for styling the classes

classDef interface stroke:#000,stroke-dasharray: 5 5

%% ==============================================
