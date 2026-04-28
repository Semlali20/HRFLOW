import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  constructor(private authService: AuthenticationService, private http: HttpClient) {}
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  userRole: string;
  typeDeStageOptions: any;
  ageDesCollaborateursOptions: any;

  ngOnInit() {
    const user = this.authService.getAuthenticatedUser();
    if (user) {
      this.firstName = user.firstname;
      this.lastName = user.lastname;
      this.email = user.email;
      this.title = user.title;
      this.userRole = this.authService.getUserRole();
    }
    this.loadStagiaresData();
    this.loadCollaborateursData();
  }

  isAdmin(): boolean {
    this.userRole = this.authService.getUserRole();
    return String(this.userRole).toUpperCase() === 'ADMIN';
  }

  shouldShowStageChart(): boolean {
    this.userRole = this.authService.getUserRole();
    return this.userRole === 'ADMIN' || this.userRole === 'STAGIAIRE_RH';
  }

  shouldShowCollaboratorsChart(): boolean {
    this.userRole = this.authService.getUserRole();
    return this.userRole === 'ADMIN' || this.userRole === 'COLLABORATEUR_RH';
  }

  loadStagiaresData() {
    this.http.get<any[]>('http://localhost:8090/api/v1/stagiares').subscribe({
      next: stagiares => {
        const typeDeStageCounts = {
          "Stage d'observation": 0,
          "Stage de pfa": 0,
          "stage de projet fin d etude (PFE)": 0
        };
        const normalizeType = (type: string): string => type.trim().toLowerCase().replace(/\s+/g, ' ');
        stagiares.forEach(stagiaire => {
          const normalizedType = normalizeType(stagiaire.typeDeStage);
          for (const key in typeDeStageCounts) {
            if (normalizeType(key) === normalizedType) { typeDeStageCounts[key]++; break; }
          }
        });
        this.typeDeStageOptions = {
          series: [{ name: 'Nombre', data: [typeDeStageCounts["Stage d'observation"], typeDeStageCounts["Stage de pfa"], typeDeStageCounts["stage de projet fin d etude (PFE)"]] }],
          chart: { type: 'bar', height: 350 },
          title: { text: "Type de Stage", align: 'left' },
          plotOptions: { bar: { horizontal: false, columnWidth: '40%' } },
          xaxis: { categories: ["Stage d'observation", "Stage de pfa", "stage de projet fin d etude (PFE)"] },
          yaxis: { title: { text: 'Nombre' } }
        };
      },
      error: err => console.error('Error fetching stagiaires:', err)
    });
  }

  loadCollaborateursData() {
    this.http.get<any[]>('http://localhost:8090/api/v1/Collaborateurs').subscribe({
      next: collaborateurs => {
        const ageGroups = { "20-30": 0, "30-40": 0, "40-50": 0, "50-60": 0 };
        collaborateurs.forEach(c => {
          const age = c.age;
          if (age >= 20 && age < 30) ageGroups["20-30"]++;
          else if (age >= 30 && age < 40) ageGroups["30-40"]++;
          else if (age >= 40 && age < 50) ageGroups["40-50"]++;
          else if (age >= 50 && age < 60) ageGroups["50-60"]++;
        });
        this.ageDesCollaborateursOptions = {
          series: [{ name: 'Nombre', data: [ageGroups["20-30"], ageGroups["30-40"], ageGroups["40-50"], ageGroups["50-60"]] }],
          chart: { type: 'bar', height: 350 },
          title: { text: "Âge des Collaborateurs", align: 'left' },
          xaxis: { categories: ["20-30", "30-40", "40-50", "50-60"] },
          yaxis: { title: { text: 'Nombre' } }
        };
      },
      error: err => console.error('Error fetching collaborateurs:', err)
    });
  }

  createUser() {
    Swal.fire({
      title: 'Créer un utilisateur',
      html: `
      <style>
        .swal2-input, .swal2-select { margin-bottom: 15px; font-size: 1rem; padding: 10px; border: 1px solid #dcdcdc; border-radius: 4px; width: 100%; }
        .swal2-label { display: block; margin-bottom: 5px; font-weight: bold; }
      </style>
      <label class="swal2-label" for="firstName">Prénom</label>
      <input id="firstName" class="swal2-input" placeholder="Prénom">
      <label class="swal2-label" for="lastName">Nom</label>
      <input id="lastName" class="swal2-input" placeholder="Nom">
      <label class="swal2-label" for="email">Email</label>
      <input id="email" class="swal2-input" placeholder="Email">
      <label class="swal2-label" for="title">Titre</label>
      <input id="title" class="swal2-input" placeholder="Titre">
      <label class="swal2-label" for="userRole">Rôle</label>
      <select id="userRole" class="swal2-select">
        <option value="ADMIN">ADMIN</option>
        <option value="STAGIAIRE_RH">STAGIAIRE_RH</option>
        <option value="COLLABORATEUR_RH">COLLABORATEUR_RH</option>
      </select>`,
      focusConfirm: false,
      preConfirm: () => {
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const title = (document.getElementById('title') as HTMLInputElement).value;
        const userRole = (document.getElementById('userRole') as HTMLSelectElement).value;
        if (!firstName || !lastName || !email || !title || !userRole) {
          Swal.showValidationMessage('Veuillez remplir tous les champs'); return;
        }
        return { firstName, lastName, email, title, userRole };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const { firstName, lastName, email, title, userRole } = result.value;
        this.http.post('http://localhost:8090/api/v1/auth/register', { firstName, lastName, email, title, userRole }).subscribe({
          next: () => Swal.fire('Succès', 'Utilisateur créé avec succès', 'success'),
          error: () => Swal.fire('Erreur', 'User with this email already exists', 'error')
        });
      }
    });
  }

  editPassword() {
    Swal.fire({
      title: 'Modifier le mot de passe',
      html: `
        <style>
          .input-container { position: relative; margin-bottom: 1rem; }
          .swal2-input { width: 100%; padding-right: 2.5em; box-sizing: border-box; }
          .input-container .toggle-password { position: absolute; top: 70%; right: 0px; transform: translateY(-50%); cursor: pointer; color: #888; }
          .input-label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
        </style>
        <div class="input-container">
          <label class="input-label" for="oldPassword">Ancien mot de passe</label>
          <input id="oldPassword" type="password" class="swal2-input" placeholder="Ancien mot de passe">
          <i class="toggle-password fas fa-eye" id="toggleOldPassword"></i>
        </div>
        <div class="input-container">
          <label class="input-label" for="newPassword">Nouveau mot de passe</label>
          <input id="newPassword" type="password" class="swal2-input" placeholder="Nouveau mot de passe">
          <i class="toggle-password fas fa-eye" id="toggleNewPassword"></i>
        </div>
        <div class="input-container">
          <label class="input-label" for="confirmPassword">Confirmer le mot de passe</label>
          <input id="confirmPassword" type="password" class="swal2-input" placeholder="Confirmer le mot de passe">
          <i class="toggle-password fas fa-eye" id="toggleConfirmPassword"></i>
        </div>`,
      focusConfirm: false,
      didOpen: () => {
        const togglePasswordVisibility = (inputId: string, toggleId: string) => {
          const input = document.getElementById(inputId) as HTMLInputElement;
          const toggle = document.getElementById(toggleId) as HTMLElement;
          toggle.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
          });
        };
        togglePasswordVisibility('oldPassword', 'toggleOldPassword');
        togglePasswordVisibility('newPassword', 'toggleNewPassword');
        togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');
      },
      preConfirm: () => {
        const oldPassword = (document.getElementById('oldPassword') as HTMLInputElement).value;
        const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement).value;
        if (!oldPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage('Veuillez remplir tous les champs'); return;
        }
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('Les nouveaux mots de passe ne correspondent pas'); return;
        }
        return { oldPassword, newPassword };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const { oldPassword, newPassword } = result.value;
        this.authService.editPassword(oldPassword, newPassword).subscribe({
          next: () => Swal.fire('Succès', 'Le mot de passe a été changé avec succès', 'success'),
          error: err => {
            const msg = err?.error === 'Old password does not match.'
              ? 'L\'ancien mot de passe ne correspond pas.'
              : 'Une erreur s\'est produite lors du changement de mot de passe';
            Swal.fire('Erreur', msg, 'error');
          }
        });
      }
    });
  }
}
