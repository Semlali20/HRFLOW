import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { UIModule } from '../../shared/ui/ui.module';

import { LoginComponent1 } from './login_v2/login_v2.component';

import { AuthRoutingModule } from './auth-routing';


@NgModule({
  declarations: [LoginComponent1],
  imports: [

    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlertModule.forRoot(),
    UIModule,
    AuthRoutingModule,
    CarouselModule
  ],
})
export class AuthModule { }
