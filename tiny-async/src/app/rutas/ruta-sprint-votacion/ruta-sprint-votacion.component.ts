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
import {UProyectos} from "../../interfaces/models/u-proyectos";

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
  sprints: UPSprint[] = [];
  scrumPokerVoto!: UPSprint;
  scrumPokersubscription: any;
  scrumPokerVotoMostrar!: UPSprint;
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
                this.params = {...data} as { "id": string; idSprint: string; idUsuario: string; };
                if (user) {
                  this.cargarSprint();
                  this.cargarSprintIndividual();
                }
              }
            );
        }
      }
    );
  }

  cargarSprintIndividual(scrumPoker?: UPSprint) {
    if (scrumPoker) {
      this.params.idSprint = scrumPoker.id as string;
      this.scrumPokersubscription.unsubscribe();
    }
    const refInvidiual = this.angularFirestore
      .collection(ColeccionesEnum.Users)
      .doc(this.params.idUsuario)
      .collection(ColeccionesEnum.UProyectos)
      .doc(this.params.id)
      .collection(ColeccionesEnum.UPSprint)
      .doc<UPSprint>(this.params.idSprint);
    refInvidiual
      .get()
      .subscribe(
        (value) => {
          if (value) {
            this.scrumPokerVoto = {
              ...value.data(),
              id: value.id
            } as UPSprint;
          }
        }
      );
    this.scrumPokersubscription = refInvidiual
      .valueChanges()
      .subscribe(
        (data) => {
          if (data) {
            this.scrumPokerVotoMostrar = data;
            if (this.scrumPokerVotoMostrar.respuestasVoto) {
              this.usuariosVotado = Object.keys(
                this.scrumPokerVotoMostrar.respuestasVoto as { [key in string]?: ScrumPokerVoto }
              )
                .map(rV => this.scrumPokerVotoMostrar.respuestasVoto[rV]) as ScrumPokerVoto[];
            }
          }
        }
      );

  }

  cargarSprint() {
    this.angularFirestore
      .collection(ColeccionesEnum.Users)
      .doc(this.params.idUsuario)
      .collection(ColeccionesEnum.UProyectos)
      .doc(this.params.id)
      .collection<UPSprint>(ColeccionesEnum.UPSprint)
      .get()
      .subscribe(
        (sprints) => {
          console.log(sprints);
          this.sprints = [
            ...sprints.docs.map((d) => {
              return {
                ...d.data(),
                id: d.id
              }
            })
          ]
        }
      )
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
        console.log()
        this.angularFirestore
          .collection(ColeccionesEnum.Users)
          .doc(this.params.idUsuario)
          .collection(ColeccionesEnum.UProyectos)
          .doc(this.params.id)
          .collection(ColeccionesEnum.UPSprint)
          .doc(this.params.idSprint)
          .update({
            respuestasVoto: {
              ...this.scrumPokerVotoMostrar.respuestasVoto,
              [this.user.email as string]: {
                correo: this.user.email,
                nombre: this.user.displayName as string,
                puntaje: result.puntaje
              } as ScrumPokerVoto
            }
          })
          .then()
          .catch();
      }
    });
  }

}
