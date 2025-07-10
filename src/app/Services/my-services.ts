import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CreateEmployeeRequest, Employee } from '../Interface/Interface';
import { Environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyServices {

  private baseUrl = Environment.URI;

  selectedTabIndex$ = new BehaviorSubject<number>(0)
  selectedEmployee$ = new BehaviorSubject<Employee | null>(null)



  // getSelectedTabIndex() {
  //   return this.selectedTabIndex$.asObservable()
  // }

  getSelectedEmployee() {
    return this.selectedEmployee$.asObservable()
  }

  // setSelectedTabIndex(value: number) {
  //   this.selectedTabIndex$.next(value)
  // }

  setSelectedEmployee(employee: Employee | null = null) {
    this.selectedEmployee$.next(employee)
  }


  constructor(private http: HttpClient) { }
  getAll(): Observable<Employee[]> { return this.http.get<Employee[]>(this.baseUrl + 'GetAll'); }
  get(empId: number): Observable<Employee> { return this.http.get<Employee>(`${this.baseUrl}${empId}`); }
  add(emp: any): Observable<Employee> { return this.http.post<Employee>(this.baseUrl + 'AddEmployee', emp); }
  update(empId: number, emp: CreateEmployeeRequest): Observable<Employee> { return this.http.put<Employee>(`${this.baseUrl}${empId}`, emp); }
  delete(empId: number): Observable<void> { return this.http.delete<void>(`${this.baseUrl}Delete/${empId}`); }
  getDesignations(): Observable<string[]> {
  return this.http.get<string[]>(this.baseUrl + 'designations');
}

getLocations(): Observable<string[]> {
  return this.http.get<string[]>(this.baseUrl + 'locations');
}

getSkills(): Observable<string[]> {
  return this.http.get<string[]>(this.baseUrl + 'skills');
}

getProjects(): Observable<string[]> {
  return this.http.get<string[]>(this.baseUrl + 'projects');
}

getManagers(): Observable<string[]> {
  return this.http.get<string[]>(this.baseUrl + 'managers');
}


};
