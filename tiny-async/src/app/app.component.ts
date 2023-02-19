import {Component} from '@angular/core';
import {AngularFireAuth} from "@angular/fire/compat/auth";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tiny-async';
  logeado = false;

  constructor(
    public angularFireAuth: AngularFireAuth
  ) {
    this.angularFireAuth
      .authState
      .subscribe(
        (user) => {
          if (user) {
            this.logeado = true;
          } else {
            this.logeado = false;
          }
        }
      )
  }

}
