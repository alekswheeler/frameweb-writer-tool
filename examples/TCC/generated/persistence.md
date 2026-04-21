
classDiagram

namespace oldenburg.core.persistence_{

class GradeRepository{
}
class ReviewRepository{
}
class StudentRepository{
}
class SubmissionRepository{
}
class WorkshopRepository{
}
class GradeRepositoryDAO:::interface

class ReviewRepositoryDAO:::interface

class StudentRepositoryDAO:::interface

class SubmissionRepositoryDAO:::interface

class WorkshopRepositoryDAO:::interface

}
GradeRepositoryDAO  <|-- GradeRepository
ReviewRepositoryDAO  <|-- ReviewRepository
StudentRepositoryDAO  <|-- StudentRepository
SubmissionRepositoryDAO  <|-- SubmissionRepository
WorkshopRepositoryDAO  <|-- WorkshopRepository
%% ==============================================
%% This block is just for styling the classes

classDef interface stroke:#000,stroke-dasharray: 5 5

%% ==============================================
