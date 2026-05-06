import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})
export class UploadsComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  files: File[] = [];

  constructor(private router: Router, private collaborateurService: CollaborateurService) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Form File Upload', active: true }];
  }

  onSelect(event: any) {
    const file = event.addedFiles[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (file && validTypes.includes(file.type)) {
      this.files.push(file);
    } else {
      Swal.fire('Invalid file type', 'Please upload an Excel or CSV file.', 'error');
    }
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onUpload() {
    if (this.files.length === 0) {
      Swal.fire('No files selected', 'Please select a file to upload.', 'error');
      return;
    }
    this.collaborateurService.importFromExcel(this.files[0]).subscribe({
      next: () => Swal.fire('Success', 'File uploaded successfully', 'success').then(() => this.router.navigate(['/collaborateur'])),
      error: () => Swal.fire('Error', 'There was an error uploading the file', 'error')
    });
  }
}
