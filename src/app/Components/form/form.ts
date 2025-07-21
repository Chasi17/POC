import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MyServices } from '../../Services/my-services';
import { MapUserFormToResource } from '../../UtilityFunctions/utilityFunctions';
import deepEqual from 'fast-deep-equal';
import { Employee } from '../../Interface/Interface';
import { HostListener } from '@angular/core';


@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form.html',
  styleUrl: './form.scss'
})

export class Form {
  userform!: FormGroup;
  empId?: number;
  isEditMode = false;
  private originalFormData: any;
  selectedEmpID?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private empservices: MyServices
  ) { }

  designations: any[] = [];
  locations: any[] = [];
  skills: any[] = [];
  projects: any[] = [];
  managers: any[] = [];
 
  selectedSkills: string[] = [];
  showDropdown = false;

  // For Project
  selectedProjects: string[] = [];
  showProjectDropdown = false;

  // For Reporting To
  selectedManagers: string[] = [];
  showManagerDropdown = false;



  ngOnInit() {
    debugger

    this.loadDropdowns();


    this.initForm();

    this.empservices.getSelectedEmployee().subscribe((employee) => {
      if (employee) {
        this.userform.patchValue(employee);
      }
    })

    this.route.params.subscribe((val) => {
      this.empId = val["empId"];
      this.isEditMode = !!this.empId;

      if (this.isEditMode) {
        this.empservices.get(this.empId!).subscribe((emp: any) => {
          debugger
          if (emp.doj) {
            emp.doj = this.formatDateForInput(emp.doj);
          }
          console.log(emp);

          emp.project = emp.project?.split(',') ?? [];
          emp.skill = emp.skill?.split(',') ?? [];
          emp.reportingTo = emp.reportingTo?.split(',') ?? [];

          if (emp.billable) {
            emp.billable = "yes"
          } else {
            emp.billable = "no"
          }

          const { empId, ...rest } = emp;
          this.originalFormData = JSON.parse(JSON.stringify(rest));



          this.userform.patchValue(emp);
          debugger
          this.selectedProjects = emp.project;
          this.selectedSkills = emp.skill
          this.selectedManagers = emp.reportingTo;

        });
      } else {
        this.originalFormData = this.userform.value;
      }
    });
  }

  private formatDateForInput(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // returns yyyy-MM-dd
  }


  loadDropdowns() {
    this.empservices.getDesignations().subscribe({
      next: (data) => {
        this.designations = data;
        console.log("DESIGNATIONS", data);
      },
      error: (err) => {
        console.error('Error fetching designations', err);
      }
    });

    this.empservices.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        console.log("LOCATIONS", data);
        
      },
      error: (err) => {
        console.error('Error fetching locations', err);
      }
    });

    this.empservices.getSkills().subscribe({
      next: (data) => {
        this.skills = data;
        console.log("SKILLS", data);

      },
      error: (err) => {
        console.error('Error fetching skills', err);
      }
    });

    this.empservices.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        console.log("PROJECTS", data);
        
      },
      error: (err) => {
        console.error('Error fetching projects', err);
      }
    });

    this.empservices.getManagers().subscribe({
      next: (data) => {
        this.managers = data;
        console.log("MANAGERS", data);
        
      },
      error: (err) => {
        console.error('Error fetching managers', err);
      }
    });
  }




  initForm() {
    // this.userform = this.fb.group({
    //   name: ['', [Validators.required, Validators.minLength(4)]],
    //   email: ['', [Validators.required, Validators.email]],
    //   designation: ['', Validators.required],
    //   reportingTo: ['', Validators.required],
    //   billable: ['', Validators.required],
    //   skill: ['', Validators.required],
    //   project: ['', Validators.required],
    //   location: ['', Validators.required],
    //   doj: ['', Validators.required],
    //   remarks: ['']
    // });

    this.userform = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      designation: ['', Validators.required],
      reportingTo: [[]], // multi-select
      billable: ['', Validators.required],
      skill: [[]],       // multi-select
      project: [[]],     // multi-select
      location: ['', Validators.required], // single select
      doj: ['', Validators.required],
      remarks: ['']
    });

  }

  get name() { return this.userform.get('name')!; }
  get email() { return this.userform.get('email')!; }

  onSubmit() {
    if (this.userform.valid) {
      // Only confirm if in edit mode and form has been modified
      if (this.isEditMode && this.userform.dirty) {
        const confirmed = window.confirm("Are you sure you want to update the employee details?");
        if (!confirmed) {
          // Reset the form to original values
          this.userform.reset(this.originalFormData);
          return;
        }
      }

      let requestbody = MapUserFormToResource(this.userform.value);
      requestbody = { ...requestbody, empId: this.selectedEmpID };
      console.log('requestbody', requestbody);

      const obs = this.isEditMode
        ? this.empservices.update(this.empId!, requestbody)
        : this.empservices.add(requestbody);

      console.log('request made');

      obs.subscribe((response) => {
        debugger
        console.log('response', response);
        this.userform.reset()
        this.router.navigate(['/home']);
      });
    }

    const formData = this.userform.value;
    formData.skill = (formData.skill || []).join(',');  // Comma-separated string
    formData.project = (formData.project || []).join(',');
    formData.reportingTo = (formData.reportingTo || []).join(',');


    const action = this.isEditMode ? 'update' : 'add';
  }


  onResetClick() {
    debugger
    const confirmed = window.confirm("Are you sure you want to reset the form?");
    if (confirmed) {
      if (this.isEditMode && !deepEqual(this.originalFormData, this.userform.value)) {
        debugger
        this.selectedSkills = this.selectedSkills.filter(skill => this.originalFormData.skill.includes(skill))
        this.selectedManagers = this.selectedManagers.filter(manager => this.originalFormData.reportingTo.includes(manager))
        this.selectedProjects = this.selectedProjects.filter(project => this.originalFormData.project.includes(project))
        this.userform.reset(this.originalFormData);
        
      } else {
        this.userform.get("skill")?.value
        this.userform.reset();
        this.selectedSkills.length = 0
        this.selectedManagers.length = 0
        this.selectedProjects.length = 0
        this.userform.get("skill")?.value
        this.empservices.setSelectedEmployee(null)
      }
    }
  }




  onSkillChange(event: Event): void {
    debugger
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (input.checked) {
      this.selectedSkills.push(value);
      console.log("Selected Skills", this.selectedSkills);

    } else {
      this.selectedSkills = this.selectedSkills.filter(skill => skill !== value);
    }

    // Sync with form
    this.originalFormData
    this.userform.get('skill')?.setValue(this.selectedSkills);
    this.userform.get('skill')?.markAsTouched();
  }

  onProjectChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (input.checked) {
      this.selectedProjects.push(value);
    } else {
      this.selectedProjects = this.selectedProjects.filter(p => p !== value);
    }

    this.userform.get('project')?.setValue(this.selectedProjects);
    this.userform.get('project')?.markAsTouched();
  }

  onManagerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (input.checked) {
      this.selectedManagers.push(value);
    } else {
      this.selectedManagers = this.selectedManagers.filter(m => m !== value);
    }

    this.userform.get('reportingTo')?.setValue(this.selectedManagers);
    this.userform.get('reportingTo')?.markAsTouched();
  }


  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    setTimeout(() => {
      this.showDropdown = false;
    }, 200); // delay so checkbox click doesn't get cut off
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-multiselect')) {
      this.showDropdown = false;
      this.showProjectDropdown = false;
      this.showManagerDropdown = false;
    }
  }

}

