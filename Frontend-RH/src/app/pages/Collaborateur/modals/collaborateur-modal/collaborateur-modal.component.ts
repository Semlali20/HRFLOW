import { Component, Input } from '@angular/core';
import { CollaborateurService } from 'src/app/core/services/collaborateur.service';
import { Collaborateur } from 'src/app/core/models/hr.models';
import { ConfirmService } from 'src/app/shared/confirm.service';

@Component({
  selector: 'app-collaborateur-modal',
  templateUrl: './collaborateur-modal.component.html',
  styleUrls: ['./collaborateur-modal.component.scss']
})
export class CollaborateurModalComponent {
  @Input() detailedCollaborateur: any;

  constructor(
    private collaborateurService: CollaborateurService,
    private confirmSvc: ConfirmService,
  ) {}

  viewCollaborateur(collaborateur: Collaborateur) {
    this.collaborateurService.getById(collaborateur.matricule).subscribe({
      next: data => this.showCollaborateurModal(data),
      error: err => console.error('Erreur lors de la récupération des détails du collaborateur :', err)
    });
  }

  async showCollaborateurModal(c: Collaborateur): Promise<void> {
    await this.confirmSvc.alert(
      `<div style="text-align:left">
        <p><strong>Nom :</strong> ${c.nom || ''}</p>
        <p><strong>Prénom :</strong> ${c.prenom || ''}</p>
        <p><strong>Email :</strong> ${c.email || ''}</p>
        <p><strong>Département :</strong> ${(c as any).Département || ''}</p>
        <p><strong>Fonction :</strong> ${(c as any).Fonction || ''}</p>
        <p><strong>Date de naissance :</strong> ${c.date_naissance || ''}</p>
      </div>`,
      'Détails du Collaborateur',
      'info'
    );
  }
}
