import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.scss']
})
export class UploadsComponent implements OnInit {
  breadCrumbItems: Array<{}>;
  files: File[] = [];

  constructor(private router: Router, private http: HttpClient) {}

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
    const formData = new FormData();
    formData.append('file', this.files[0]);
    this.http.post('http://localhost:8090/api/v1/Collaborateurs/import', formData).subscribe({
      next: () => Swal.fire('Success', 'File uploaded successfully', 'success').then(() => this.router.navigate(['/collaborateur'])),
      error: () => Swal.fire('Error', 'There was an error uploading the file', 'error')
    });
  }
}
