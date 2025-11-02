
classDiagram

namespace HospitalStaff{

class Employee{
+String employeeId
+String hireDate
+String salary
+String workAddress
}
class Doctor{
+String licenseNumber
+String specialization
+String yearsOfExperience
}
class Nurse{
+String certificationLevel
+String department
}
class Administrator{
+String accessLevel
+String department
}
}
Employee <|-- Doctor 
Person <|-- Nurse 
Employee <|-- Nurse 
Person <|-- Administrator 
Employee <|-- Administrator 

<<persistent>> Doctor
