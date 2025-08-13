
classDiagram

namespace Application{

class Person{
+String name
+String age
}
class Car{
+String owner
+String color
}
}
class Dog{
+String owner
+String color
}
Car <|-- Person 
class Home{
+String owner
+String color
}
