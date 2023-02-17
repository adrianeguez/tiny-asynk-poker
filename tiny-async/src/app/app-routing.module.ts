import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RutaLoginComponent} from "./rutas/ruta-login/ruta-login.component";
import {RutaAsyncPokersComponent} from "./rutas/ruta-async-pokers/ruta-async-pokers.component";
import {RutaSprintComponent} from "./rutas/ruta-sprint/ruta-sprint.component";
import {RutaSprintVotacionComponent} from "./rutas/ruta-sprint-votacion/ruta-sprint-votacion.component";
import {EstaLogeado} from "./can-activate/esta-logeado";

const routes: Routes = [
  {
    path: 'login',
    component: RutaLoginComponent,
  },
  {
    path: 'mis-async-pokers',
    children:[
      {
        path:'',
        component: RutaAsyncPokersComponent,
      },
      {
        path: ':id/sprint',
        component: RutaSprintComponent
      },
      {
        path: ':idUsuario/:id/sprint/:idSprint',
        component: RutaSprintVotacionComponent
      }
    ],
    canActivate: [
      EstaLogeado
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
