import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { LoginComponent1 } from './login_v2/login_v2.component';


const routes: Routes = [
    // {
    //     path: 'login', component: LoginComponent
    // },

    {
      path: 'login', component: LoginComponent1
  },

    // {
    //     path: 'signup',
    //     component: SignupComponent
    // },
    // {
    //     path: 'signup-2',
    //     component: Register2Component
    // },
    // {
    //     path: 'reset-password',
    //     component: PasswordresetComponent
    // },
    // {
    //     path: 'recoverpwd-2',
    //     component: Recoverpwd2Component
    // },
    // {
    //     path: 'login-2',
    //     component: Login2Component
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
