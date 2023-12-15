using { sap.cap as cap } from '../db/schema';
service EmployeeService {
  entity Employee as projection on cap.Employee;
}