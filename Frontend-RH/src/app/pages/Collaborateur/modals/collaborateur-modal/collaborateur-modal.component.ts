import { Component, Input } from '@angular/core';
import Swal from 'sweetalert2';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { Collaborateur } from 'src/app/core/models/hr.models';

@Component({
  selector: 'app-collaborateur-modal',
  templateUrl: './collaborateur-modal.component.html',
  styleUrls: ['./collaborateur-modal.component.scss']
})
export class CollaborateurModalComponent {
  @Input() detailedCollaborateur: any;

  constructor(private collaborateurService: CollaborateurService) {}

  viewCollaborateur(collaborateur: Collaborateur) {
    this.collaborateurService.getById(collaborateur.matricule).subscribe({
      next: data => this.showCollaborateurModal(data),
      error: err => console.error('Erreur lors de la récupération des détails du collaborateur :', err)
    });
  }

  showCollaborateurModal(c: Collaborateur) {
    Swal.fire({
      title: 'Détails du Collaborateur',
      html: `
        <div style="text-align:left">
          <p><strong>Nom :</strong> ${c.nom || ''}</p>
          <p><strong>Prénom :</strong> ${c.prenom || ''}</p>
          <p><strong>Email :</strong> ${c.email || ''}</p>
          <p><strong>Département :</strong> ${c.Département || ''}</p>
          <p><strong>Fonction :</strong> ${c.Fonction || ''}</p>
          <p><strong>Date de naissance :</strong> ${c.date_naissance || ''}</p>
        </div>`,
      showCloseButton: true,
      showConfirmButton: false
    });
  }
}
