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
Subject "*" <-- "1..*" Student : subscribedIn 
Car undefined <-- "*" Person : Owner 
