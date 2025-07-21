import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TabStripComponent, TabStripModule } from '@progress/kendo-angular-layout';
import { MyServices } from '../../Services/my-services';
import { Employee } from '../../Interface/Interface';
import { ExportServices } from '../../Services/export-services';

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [CommonModule, TabStripModule,RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './parent.html',
  styleUrl: './parent.scss'
})

export class Parent implements OnInit {
  currentRoute: string = '';
  isAnyEmployeeSelected: boolean = false
  selectedEmployeeId ?: number

  constructor(private exportService: ExportServices, private router: Router, private myService: MyServices) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }
  
  ngOnInit(): void {
    this.myService.getSelectedEmployee().subscribe((employee) => {
      if(employee){
        this.isAnyEmployeeSelected = true
        this.selectedEmployeeId = employee.empId
      }else{
        this.isAnyEmployeeSelected = false
      }
    })
  }

  exportCSV() {
    this.exportService.exportToCSV();
  }

  routeToEditOrAddForm(){
    this.selectedEmployeeId ?  this.router.navigate(['/Edit', this.selectedEmployeeId]) : this.router.navigate(['/Edit'])
  }

  isHome(): boolean {
    return this.currentRoute.includes('/Home');
  }
}


