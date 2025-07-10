import { Injectable } from '@angular/core';
import { Employee } from '../Interface/Interface';

@Injectable({ providedIn: 'root' })
export class ExportServices {
private originalEmployees: Employee[] = [];
employees: Employee[] = [];
setEmployees(data: Employee[]) {
  this.originalEmployees = [...data];
  this.employees = [...data];
}

resetEmployees() {
  this.employees = [...this.originalEmployees];
}

getEmployees(): Employee[] {
  return this.employees;
}


  // Export to CSV
  exportToCSV(): void {
    debugger
    if (!this.employees.length) return;

    const headers = ['EMP ID', 'Name', 'Role', 'Project'];
    const rows = this.employees.map(emp => [
      `E${emp.empId}`,
      emp.name,
      emp.designation,
      emp.project
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employees.csv';
    link.click();
  }
}

