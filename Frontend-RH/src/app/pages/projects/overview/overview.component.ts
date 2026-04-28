import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

interface UserDetails { label: string; value: string; }
interface SocialLink { icon: string; handle: string; }

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  stagiaireId: string;
  Stagiaires: any = {};
  breadCrumbItems: Array<{}>;
  validDocuments: Array<any> = [];
  notValidDocuments: Array<any> = [];

  Nom: string = '';
  prenom: string = '';
  cin: string = '';
  departement: string = '';
  sujetDeStage: string = '';
  universite: string = '';
  typeDeStage: string = '';
  startDate: string = '';
  nomencdr: string = '';
  status: string = '';
  userName: string = 'John Doe';
  userStatus: string = 'Online';
  userRole: string = 'Admin';
  memberSince: string = 'Jan 2012';
  orders: number = 456;
  posts: number = 828;
  tasksDone: number = 1024;
  stars: Array<string> = ['fa-star', 'fa-star', 'fa-star', 'fa-star', 'fa-star-o'];

  userDetails: UserDetails[] = [
    { label: 'First Name', value: 'John' },
    { label: 'Last Name', value: 'Doe' },
    { label: 'Address', value: '10880 Malibu Point, Malibu, Calif., 90265' },
    { label: 'Email', value: 'john.doe@example.com' },
    { label: 'Phone number', value: '011 223 344 556 677' }
  ];

  userSocials: SocialLink[] = [
    { icon: 'fa-twitter-square', handle: '@johndoe' },
    { icon: 'fa-linkedin-square', handle: 'John Doe' },
    { icon: 'fa-facebook-square', handle: 'John Doe' },
    { icon: 'fa-skype', handle: 'john_skype' },
    { icon: 'fa-instagram', handle: 'johndoe_ig' }
  ];

  filteredStagiaires: any[];

  constructor(private sanitizer: DomSanitizer, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Projects' }, { label: 'Projects Overview', active: true }];
    this.route.queryParams.subscribe(params => {
      this.stagiaireId = params['id'];
      if (this.stagiaireId) this.fetchStagiaire();
    });
  }

  getImagePath(base64Data: string): string {
    return base64Data;
  }

  fetchStagiaire(): void {
    this.http.get<any>(`http://localhost:8090/api/v1/stagiares/${this.stagiaireId}`).subscribe({
      next: data => { this.Stagiaires = data; this.processDocuments(); },
      error: err => console.error('Error fetching data:', err)
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Terminé': return 'grey';
      case 'Complete': return 'green';
      case 'En progression': return 'orange';
      default: return 'grey';
    }
  }

  processDocuments(): void {
    const documentKeys = [
      { key: 'attestationAssurance', name: 'Attestation d\'Assurance' },
      { key: 'carteNationale', name: 'Carte Nationale' },
      { key: 'ficheAnthropométrique', name: 'Fiche Anthropométrique' },
      { key: 'copieCertifiéeDiplômes', name: 'Copie Certifiée des Diplômes' },
      { key: 'relevéIdentitéBancaire', name: 'Relevé d\'Identité Bancaire' },
      { key: 'cv', name: 'CV' },
      { key: 'conventionStage', name: 'Convention de Stage' },
      { key: 'ficheÉvaluation', name: 'Fiche d\'Évaluation' },
      { key: 'charteEngagement', name: 'Charte d\'Engagement' },
      { key: 'attestationStage', name: 'Attestation de Stage' }
    ];
    this.validDocuments = [];
    this.notValidDocuments = [];
    documentKeys.forEach(doc => {
      if (this.Stagiaires[doc.key]) this.validDocuments.push({ name: doc.name });
      else this.notValidDocuments.push({ name: doc.name });
    });
  }
}
