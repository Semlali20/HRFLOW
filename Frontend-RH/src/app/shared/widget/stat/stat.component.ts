import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-stat',
    templateUrl: './stat.component.html',
    styleUrls: ['./stat.component.scss']
})
export class StatComponent implements OnInit {

    @Input() title: string;
    @Input() value: string;
    @Input() icon: string;

    totalCollaborateurs = 0;
    totalStagiares = 0;

    constructor(private router: Router, private http: HttpClient) {}

    ngOnInit(): void {
        this.http.get<any[]>('http://localhost:8090/api/v1/Collaborateurs').subscribe({
            next: data => this.totalCollaborateurs = data.length,
            error: err => console.error('Error fetching collaborateurs count:', err)
        });
        this.http.get<any[]>('http://localhost:8090/api/v1/stagiares').subscribe({
            next: data => this.totalStagiares = data.length,
            error: err => console.error('Error fetching interns count:', err)
        });
    }

    navigateToCollaborateur(): void {
        this.router.navigate(['/dashboard']);
    }
}
