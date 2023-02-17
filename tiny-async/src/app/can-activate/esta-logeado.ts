import {AngularFireAuth} from "@angular/fire/compat/auth";
import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from "@angular/router";
import {map, Observable} from "rxjs";

@Injectable()
export class EstaLogeado implements CanActivate {
  constructor(
    public angularFireAuth: AngularFireAuth,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.angularFireAuth.user.pipe(map(a => a ? true : false));
  }
}
