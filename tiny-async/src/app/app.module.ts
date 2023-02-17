import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {environment} from '../environments/environment';
import {provideAuth, getAuth} from '@angular/fire/auth';
import {provideFirestore, getFirestore} from '@angular/fire/firestore';
import {RutaLoginComponent} from './rutas/ruta-login/ruta-login.component';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {RutaAsyncPokersComponent} from './rutas/ruta-async-pokers/ruta-async-pokers.component';
import {RutaSprintComponent} from './rutas/ruta-sprint/ruta-sprint.component';
import {RutaSprintVotacionComponent} from './rutas/ruta-sprint-votacion/ruta-sprint-votacion.component';
import {AbstractControl, ReactiveFormsModule, ValidationErrors} from "@angular/forms";
import {FormlyModule} from "@ngx-formly/core";
import {FormlyMaterialModule} from "@ngx-formly/material";
import {ModalCrearEditarComponent} from './componentes/modal-crear-editar/modal-crear-editar.component';
import {MatButtonModule} from "@angular/material/button";
import {MatDialogModule} from "@angular/material/dialog";
import {EstaLogeado} from "./can-activate/esta-logeado";
import {MatCardModule} from "@angular/material/card";

export function asyncPokerValidator(control: AbstractControl): ValidationErrors | null {
  const isEqual = control.value === 0 ||
    control.value === 1 ||
    control.value === 2 ||
    control.value === 3 ||
    control.value === 5 ||
    control.value === 8 ||
    control.value === 13 ||
    control.value === 20 ||
    control.value === 40 ||
    control.value === 100 ||
    control.value === 0.5;
  return isEqual ? null : {'asyncPoker': true} as ValidationErrors;
}

@NgModule({
  declarations: [
    AppComponent,
    RutaLoginComponent,
    RutaAsyncPokersComponent,
    RutaSprintComponent,
    RutaSprintVotacionComponent,
    ModalCrearEditarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    NgxAuthFirebaseUIModule.forRoot({
        projectId: 'tiny-async-poker',
        appId: '1:742053084873:web:eec740ff081f8a57f6d718',
        storageBucket: 'tiny-async-poker.appspot.com',
        apiKey: 'AIzaSyCkf2OK7Z2HCdtgGmErqz0N1_hoYN-Dg68',
        authDomain: 'tiny-async-poker.firebaseapp.com',
        messagingSenderId: '742053084873',
        databaseURL: 'tiny-async-poker',
      },
      () => 'your_app_name_factory',
      {
        enableFirestoreSync: true, // enable/disable autosync users with firestore
        toastMessageOnAuthSuccess: true, // whether to open/show a snackbar message on auth success - default : true
        toastMessageOnAuthError: true, // whether to open/show a snackbar message on auth error - default : true
        passwordMaxLength: 60, // `min/max` input parameters in components should be within this range.
        passwordMinLength: 8, // Password length min/max in forms independently of each componenet min/max.
        // Same as password but for the name
        nameMaxLength: 50,
        nameMinLength: 2,
        // If set, sign-in/up form is not available until email has been verified.
        // Plus protected routes are still protected even though user is connected.
        guardProtectedRoutesUntilEmailIsVerified: true,
        enableEmailVerification: true, // default: true
        useRawUserCredential: true, // If set to true outputs the UserCredential object instead of firebase.User after login and signup - Default: false
      }),
    ReactiveFormsModule,
    FormlyModule.forRoot({
      validators: [
        {name: 'asyncPoker', validation: asyncPokerValidator},
      ],
      validationMessages: [
        {name: 'asyncPoker', message: 'Ingrese estos numeros: 0/1/2/3/5/8/13/20/40/100'}
      ]
    }),
    FormlyMaterialModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule
  ],
  providers: [ EstaLogeado ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
