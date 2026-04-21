
classDiagram

namespace MyPackage{

class WorkshopServiceImpl{
}
class ReviewServiceImpl{
}
class StudentServiceImpl{
}
class SubmissionServiceImpl{
}
class GradeServiceImpl{
}
class WorkshopService:::interface

class ReviewService:::interface

class StudentService:::interface

class SubmissionService:::interface

class GradeService:::interface

}
WorkshopService  <|-- WorkshopServiceImpl
ReviewService  <|-- ReviewServiceImpl
StudentService  <|-- StudentServiceImpl
SubmissionService  <|-- SubmissionServiceImpl
GradeService  <|-- GradeServiceImpl
%% ==============================================
%% This block is just for styling the classes

classDef interface stroke:#000,stroke-dasharray: 5 5

%% ==============================================
