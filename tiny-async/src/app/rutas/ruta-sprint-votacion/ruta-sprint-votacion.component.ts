import {Component, OnInit} from '@angular/core';
import {User} from "@angular/fire/auth";
import {ColeccionesEnum} from "../../enums/colecciones.enum";
import {UPSprint} from "../../interfaces/models/u-p-sprint";
import {map, Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {ActivatedRoute} from "@angular/router";
import {ScrumPokerVoto} from "../../interfaces/models/scrum-poker-voto";
import {FormlyFieldConfig} from "@ngx-formly/core";
import {ModalCrearEditarComponent} from "../../componentes/modal-crear-editar/modal-crear-editar.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-ruta-sprint-votacion',
  templateUrl: './ruta-sprint-votacion.component.html',
  styleUrls: ['./ruta-sprint-votacion.component.scss']
})
export class RutaSprintVotacionComponent implements OnInit {

  fields: FormlyFieldConfig[] = [
    {
      key: 'puntaje',
      type: 'input',
      props: {
        label: 'Puntaje: 0/1/2/3/5/8/13/20/40/100',
        placeholder: 'Nombre',
        description: 'Nombre',
        required: true,
        type: 'number',
        min: 0,
        max: 100,
        step: 0.5,
      },
      validators: {
        validation: ['asyncPoker'],
      }

    },
  ];
  model: {
    puntaje: number;
  } = {
    puntaje: 0,
  }
  scrumPokerVoto!: UPSprint;
  usuariosVotado: ScrumPokerVoto[] = [];

  user?: User;
  params!: { "id": string; idSprint: string; idUsuario: string; };

  mostrarVoto = false;

  constructor(
    public angularFirestore: AngularFirestore,
    public angularFireAuth: AngularFireAuth,
    public activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {

    this.angularFireAuth.user.subscribe(
      (user) => {
        if (user && user.emailVerified) {
          this.user = user as User;
          this.activatedRoute.params
            .subscribe(
              (data) => {
                this.params = data as { "id": string; idSprint: string;idUsuario: string; };
                if (user) {
                  this.angularFirestore
                    .collection(ColeccionesEnum.Users)
                    .doc(this.params.idUsuario)
                    .collection(ColeccionesEnum.UProyectos)
                    .doc(this.params.id)
                    .collection(ColeccionesEnum.UPSprint)
                    .doc<UPSprint>(this.params.idSprint)
                    .valueChanges()
                    .subscribe(
                      (value) => {
                        if (value) {
                          this.scrumPokerVoto = value;
                          if(this.scrumPokerVoto.respuestasVoto){
                            this.usuariosVotado = Object.keys(
                              this.scrumPokerVoto.respuestasVoto as {[key in string]?: ScrumPokerVoto}
                            )
                              .map(rV => this.scrumPokerVoto.respuestasVoto[rV]) as ScrumPokerVoto[];
                          }
                        }
                      }
                    )
                }
              }
            );
        }
      }
    );
  }


  abrirCrearVotacion() {
    const dialogRef = this.dialog.open(ModalCrearEditarComponent, {
      data: {
        model: this.model,
        fields: this.fields,
      },
    });

    dialogRef.afterClosed().subscribe((result: {
      puntaje: number;
    }) => {
      if (this.user && result) {
        this.angularFirestore
          .collection(ColeccionesEnum.Users)
          .doc(this.params.idUsuario)
          .collection(ColeccionesEnum.UProyectos)
          .doc(this.params.id)
          .collection(ColeccionesEnum.UPSprint)
          .doc(this.params.idSprint)
          .update({
            respuestasVoto:{
              ...this.scrumPokerVoto.respuestasVoto,
              [this.user.email as string]: {
                correo: this.user.email,
                nombre: this.user.displayName as string,
                puntaje: result.puntaje
              }as ScrumPokerVoto
            }
          })
          .then()
          .catch();
      }
    });
  }

}
