import { Component, QueryList, ViewChildren, OnInit, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { CollaborateurService } from '../../../core/services/collaborateur.service';
import { NgbdUserListSortableHeader, SortEvent } from './userlist-sortable.directive';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.scss']
})

/**
 * Contacts user-list component
 */
export class UserlistComponent implements OnInit {
  // bread crumb items
  breadCrumbItems: Array<{}>;

  employees: any[] = [];
  loading = false;
  error: string | null = null;

  createContactForm!: UntypedFormGroup;
  submitted = false;

  @ViewChildren(NgbdUserListSortableHeader) headers!: QueryList<NgbdUserListSortableHeader>;
  @ViewChild('newContactModal', { static: false }) newContactModal?: ModalDirective;
  @ViewChild('removeItemModal', { static: false }) removeItemModal?: ModalDirective;
  deleteId: any;

  constructor(
    private collaborateurService: CollaborateurService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Contacts' }, { label: 'Users List', active: true }];

    this.createContactForm = this.formBuilder.group({
      _backendId: [''],
      prenom: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      email: ['', [Validators.required]],
      Fonction: [''],
      Département: [''],
      status: ['ACTIVE'],
      Type: ['CDI'],
    });

    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = null;
    this.collaborateurService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load employees.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  trackById(index: number, emp: any): any {
    return emp._backendId ?? emp.matricule ?? index;
  }

  // File Upload
  imageURL: string | undefined;
  fileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      document.querySelectorAll('#member-img').forEach((element: any) => {
        element.src = this.imageURL;
      });
    };
    reader.readAsDataURL(file);
  }

  // Save User (create or update)
  saveUser() {
    this.submitted = true;
    if (this.createContactForm.valid) {
      const formData = this.createContactForm.value;
      const id = formData._backendId;

      if (id) {
        // Edit existing employee
        this.collaborateurService.update(id, formData).subscribe({
          next: () => {
            this.loadEmployees();
            this.createContactForm.reset();
            this.submitted = false;
            this.newContactModal?.hide();
          },
          error: (err) => {
            console.error('Update failed:', err);
          }
        });
      } else {
        // Create new employee
        this.collaborateurService.create(formData).subscribe({
          next: () => {
            this.loadEmployees();
            this.createContactForm.reset();
            this.submitted = false;
            this.newContactModal?.hide();
          },
          error: (err) => {
            console.error('Create failed:', err);
          }
        });
      }
    }
  }

  // Edit User
  editUser(index: number) {
    this.submitted = false;
    this.newContactModal?.show();

    const modelTitle = document.querySelector('.modal-title') as HTMLAreaElement;
    if (modelTitle) modelTitle.innerHTML = 'Edit Employee';
    const updateBtn = document.getElementById('addContact-btn') as HTMLAreaElement;
    if (updateBtn) updateBtn.innerHTML = 'Update';

    const emp = this.employees[index];
    this.createContactForm.patchValue({
      _backendId: emp._backendId ?? emp.matricule,
      prenom: emp.prenom,
      nom: emp.nom,
      email: emp.email,
      Fonction: emp.Fonction,
      Département: emp.Département,
      status: emp.status,
      Type: emp.Type,
    });
  }

  // Delete User
  removeUser(index: number) {
    this.deleteId = index;
    this.removeItemModal?.show();
  }

  confirmDelete() {
    const emp = this.employees[this.deleteId];
    const id = emp?._backendId ?? emp?.matricule;
    if (id) {
      this.collaborateurService.delete(id).subscribe({
        next: () => {
          this.loadEmployees();
          this.removeItemModal?.hide();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.removeItemModal?.hide();
        }
      });
    } else {
      this.removeItemModal?.hide();
    }
  }
}
