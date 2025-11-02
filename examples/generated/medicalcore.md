
classDiagram

namespace MedicalCore{

class Person{
+String firstName
+String lastName
+String birthDate
+String gender
+String socialSecurityNumber
}
class Address{
+String street
+String city
+String state
+String zipCode
}
class MedicalRecord{
+String recordId
+String createdDate
+String lastUpdated
}
}
