import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-collaborateur-modal',
  templateUrl: './collaborateur-modal.component.html',
  styleUrls: ['./collaborateur-modal.component.scss']
})
export class CollaborateurModalComponent {
  constructor(private http: HttpClient) {}
  @Input() detailedCollaborateur: any;

  viewCollaborateur(collaborateur: any) {
    this.http.get<any>(`http://localhost:8090/api/v1/Collaborateurs/${collaborateur.id}`).subscribe({
      next: data => this.showCollaborateurModal(data),
      error: err => console.error('Erreur lors de la récupération des détails du collaborateur :', err)
    });
  }

  showCollaborateurModal(c: any) {
    Swal.fire({
      title: 'Détails du Collaborateur',
      html: `
        <div style="text-align:left">
          <p><strong>Nom :</strong> ${c.nom || ''}</p>
          <p><strong>Prénom :</strong> ${c.prenom || ''}</p>
          <p><strong>Email :</strong> ${c.email || ''}</p>
          <p><strong>Département :</strong> ${c.département || ''}</p>
          <p><strong>Titre :</strong> ${c.titre || ''}</p>
          <p><strong>Date de naissance :</strong> ${c.date_naissance || ''}</p>
        </div>`,
      showCloseButton: true,
      showConfirmButton: false
    });
  }
}
