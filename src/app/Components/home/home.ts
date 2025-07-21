import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { KENDO_GRID, KENDO_GRID_EXCEL_EXPORT, KENDO_GRID_PDF_EXPORT } from '@progress/kendo-angular-grid';
import { Employee } from '../../Interface/Interface';
import { MyServices } from '../../Services/my-services';
import { Router } from '@angular/router';
import { process, State } from '@progress/kendo-data-query';
import { FormsModule,FormGroup,FormBuilder,ReactiveFormsModule} from '@angular/forms';
import { KENDO_LABELS } from '@progress/kendo-angular-label';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { KENDO_TOOLBAR } from "@progress/kendo-angular-toolbar";
import { ExcelExportData } from "@progress/kendo-angular-excel-export";
import { ExportServices } from '../../Services/export-services';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogModule } from '@progress/kendo-angular-dialog';
import * as XLSX from 'xlsx';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    GridModule,
    DialogModule,
    KENDO_GRID_EXCEL_EXPORT,
    KENDO_GRID_PDF_EXPORT,
    KENDO_GRID,
    KENDO_TOOLBAR,
    KENDO_LABELS,
    KENDO_INPUTS,
    MultiSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

bulkEditForm!: FormGroup;

showBulkEditModal: boolean = false;

designations: string[] = [];
locations: string[] = [];
skills: string[] = [];
projects: string[] = [];
managers: string[] = [];


  gridData: { data: Employee[], total: number } = {
    data: [],
    total: 0
  };


  displayModal: boolean = false;

  gridState: State = {
    skip: 0,
    take: 7,
    sort: [],
    filter: {
      logic: 'and',
      filters: []
    }
  };

  userList: Employee[] = [];
  constructor(private fb : FormBuilder , private empService: MyServices, private router: Router, private exportService: ExportServices) { }
  ngOnInit() {
    this.empService.getAll().subscribe((list: any) => {
      console.log(list);
      this.userList = list;
      this.exportService.setEmployees(this.userList);
      this.loadGridData();
    });

    this.bulkEditForm = this.fb.group({
      designation: [''],
      location: [''],
      billable: [''],
      skill: [[]],        // multiselect
      project: [[]],
      ReportingTo: [[]],
      doj: [''],
      remarks: ['']
    });

    this.loadInitialData();

  }

onBulkEdit() {
  this.bulkEditForm.reset();
  this.loadInitialData();
  this.showBulkEditModal = true;
}


  closeBulkEditModal() {
    this.showBulkEditModal = false;
  }

  loadGridData() {
    const processed = process(this.userList, this.gridState);
    this.gridData.data = processed.data;
    this.gridData.total = processed.total;
  }

  onDataStateChange(state: State): void {
    this.gridState = state;
    this.loadGridData();
  }

  onEdit(employee: Employee) {
    debugger
    console.log("Employee", employee);
    this.empService.setSelectedEmployee(employee)
    this.router.navigate(['/Edit', employee.empId]);
  }
  onMore(employee: Employee) {
    this.empService.setSelectedEmployee(employee)
    this.router.navigate(['/Details', employee.empId]);
  }

  onDel(empId: number) {
    const delConfirm = confirm('Are you sure you want to delete?')
    if (delConfirm) {
      this.empService.delete(empId).subscribe(() => {
        this.empService.setSelectedEmployee(null)
        this.userList = this.userList.filter(u => u.empId !== empId);
        this.loadGridData(); // Refresh grid
        this.DeleteResource();
      });
    }
  }

  onDeleteMultiple() {
    const delConfirm = confirm('Are you sure you want to delete?')
    if (delConfirm) {
      this.selectedKeys.forEach((empId: number) => {
        this.empService.delete(empId).subscribe(() => {
          this.userList = this.userList.filter(u => u.empId !== empId);
          this.loadGridData(); // Refresh grid
          this.DeleteResource();
        });
      });
    }
  }

  DeleteResource() {
    this.displayModal = true;
  }

  
  requireSelectOrCtrlKeys: boolean = false;

  selectedKeys: any = [];

  onSelectionChange(event: any): void {
    const newLySelectedRows = event.selectedRows.map((row: any) => row.dataItem.empId);
    const newLyDeSelectedRows: Array<number> = event.deselectedRows.map((row: any) => row.dataItem.empId);

    this.selectedKeys = this.selectedKeys.filter((empId: number) => !newLyDeSelectedRows.includes(empId));

    newLySelectedRows.forEach((newLySelectedId: number) => {
      if (!this.selectedKeys.includes(newLySelectedId)) {
        this.selectedKeys.push(newLySelectedId);
      }
    })

    console.log(this.selectedKeys);
    console.log("Selected Rows Data:", event.selectedRows.map((row: any) => row.dataItem));
  }

  onAddNew() {
  this.router.navigate(['/form']); // Route without empId
  this.empService.setSelectedEmployee(null); // Clear context
}

loadInitialData() {
  this.empService.getDesignations().subscribe(d => this.designations = d);
  this.empService.getLocations().subscribe(l => this.locations = l);
  this.empService.getSkills().subscribe(s => this.skills = s); // ✅ Ensure API exists
  this.empService.getProjects().subscribe(p => this.projects = p);
  this.empService.getManagers().subscribe(m => this.managers = m);
}


onBulkEditSubmit() {
  const formData = this.bulkEditForm.value;

  const payload : any= {
    designation: formData.designation,
    location: formData.location,
    billable: formData.billable === 'yes',
    skill: (formData.skill || []).join(','),
    project: (formData.project || []).join(','),
    ReportingTo: (formData.ReportingTo || []).join(','),
    doj: formData.doj !== '' ? new Date(formData.doj).toISOString().split('T')[0] : null,
    remarks: formData.remarks
  };
  

  const updateObservables = this.selectedKeys.map((empId: number) => {
    const employee: any = this.userList.find(u => u.empId === empId);
    if (!employee) return;

    const updated: any = {
      ...employee,
      ...payload,
      empId: empId // explicitly set to match backend expectations
    };

    for(const key in payload) {
      if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
        updated[key] = employee[key]; // Remove keys with empty values
      }
    }
    
    return this.empService.update(empId, updated);
  }).filter(Boolean); // remove undefined

  Promise.all(updateObservables.map((obs:any) => obs.toPromise()))
    .then(() => {
      alert('Bulk update successful');
      this.closeBulkEditModal();
      this.empService.getAll().subscribe((list: any) => {
        this.userList = list;
        this.loadGridData();
      });
    })
    .catch(error => {
      console.error('Bulk update failed', error);
      alert('Bulk update failed. Please try again.');
    });
}


onImportExcel() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx';

  input.onchange = async (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt: any) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

const employees = jsonData.map((row: any): any => ({
  name: row["name"] || '',
  email: row["email"] || '',
  designation: row["designation"] || '',
  reportingTo: (row["reportingTo"] || '').split(',').map((s: string) => s.trim()).filter((s: string) => s),
  billable: (row["billable"] || '').toLowerCase() === 'yes',
  skill: (row["skill"] || '').split(',').map((s: string) => s.trim()).filter((s: string) => s),
  project: (row["project"] || '').split(',').map((s: string) => s.trim()).filter((s: string) => s),
  location: row["location"] || '',
  doj: row["doj"] ? new Date(row["doj"]).toISOString().split('T')[0] : null,
  remarks: row["remarks"] || ''
}));


const transformedEmployees = employees.map(emp => ({
  ...emp,
  reportingTo: Array.isArray(emp.reportingTo) ? emp.reportingTo.join(', ') : '',
  skill: Array.isArray(emp.skill) ? emp.skill.join(', ') : '',
  project: Array.isArray(emp.project) ? emp.project.join(', ') : ''
}));

this.empService.bulkAddEmployees(transformedEmployees).subscribe(() => {
        alert("Employees added successfully");
        this.empService.getAll().subscribe((list: any) => {
          this.userList = list;
          this.loadGridData();
        });
      });
    };

    reader.readAsArrayBuffer(file);
  };

  input.click();
}

}
