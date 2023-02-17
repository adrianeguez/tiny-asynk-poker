import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Router} from "@angular/router";
import {AuthProvider} from "ngx-auth-firebaseui";

@Component({
  selector: 'app-ruta-login',
  templateUrl: './ruta-login.component.html',
  styleUrls: ['./ruta-login.component.scss']
})
export class RutaLoginComponent implements OnInit {

  authProviderEnum = AuthProvider;
  constructor(
    public angularFireAuth: AngularFireAuth,
    public router: Router
  ) {
  }

  ngOnInit(): void {
  }

  dirigirARutaAsyncPoker() {
    // const subscription = this.angularFireAuth.user.subscribe(
    //   {
    //     next: (data) => {
    //       if (data) {
    //         this.router.navigate(['']);
    //       }
    //     },
    //     error: (error) => {
    //       console.error(error);
    //     },
    //     complete:()=>{
    //       subscription.unsubscribe();
    //     }
    //   }
    // );
  }

}
