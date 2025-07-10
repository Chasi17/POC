import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { KENDO_GRID, KENDO_GRID_EXCEL_EXPORT, KENDO_GRID_PDF_EXPORT } from '@progress/kendo-angular-grid';
import { Employee } from '../../Interface/Interface';
import { MyServices } from '../../Services/my-services';
import { Router } from '@angular/router';
import { process, State } from '@progress/kendo-data-query';
import { FormsModule } from '@angular/forms';
import { KENDO_LABELS } from '@progress/kendo-angular-label';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { KENDO_TOOLBAR } from "@progress/kendo-angular-toolbar";
import { ExcelExportData } from "@progress/kendo-angular-excel-export";
import { ExportServices } from '../../Services/export-services';
import { GridModule } from '@progress/kendo-angular-grid';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    GridModule,
    KENDO_GRID_EXCEL_EXPORT,
    KENDO_GRID_PDF_EXPORT,
    KENDO_GRID,
    KENDO_TOOLBAR,
    KENDO_LABELS,
    KENDO_INPUTS,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

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
  constructor(private empService: MyServices, private router: Router, private exportService: ExportServices) { }
  ngOnInit() {
    this.empService.getAll().subscribe((list: any) => {
      console.log(list);
      this.userList = list;
      this.exportService.setEmployees(this.userList);
      this.loadGridData();
    });
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

  // allData(): ExcelExportData {

  //   const result: ExcelExportData = {
  //     data: process(this.gridData.data, {
  //       sort: [{ field: "empId", dir: "asc" }],
  //     }).data,
  //   };
  //   console.log(result);

  //   return result;
  // }
  
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


}
