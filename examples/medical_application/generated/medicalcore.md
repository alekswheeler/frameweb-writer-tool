
classDiagram

namespace MedicalCore{

class Person{
 string : firstName 
 string : lastName 
 string : birthDate 
 string : gender 
<< id >> string : socialSecurityNumber  #123; notnull #125;
}
class Address{
 string : street 
 string : city 
 string : state 
 string : zipCode 
}
class MedicalRecord{
<< id >> number : recordId  #123; notnull #125;
 string : createdDate 
 string : lastUpdated 
}
}
%% ==============================================
%% This block is just for styling the classes

classDef interface stroke:#000,stroke-dasharray: 5 5

%% ==============================================
