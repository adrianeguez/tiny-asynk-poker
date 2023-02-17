import { Component, OnInit } from '@angular/core';
import {User} from "@angular/fire/auth";
import {ColeccionesEnum} from "../../enums/colecciones.enum";
import {UProyectos} from "../../interfaces/models/u-proyectos";
import {map, Observable} from "rxjs";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {ScrumPokerVoto} from "../../interfaces/models/scrum-poker-voto";
import {ActivatedRoute, Params, RouterOutlet} from "@angular/router";
import {UPSprint} from "../../interfaces/models/u-p-sprint";
import {FormlyFieldConfig} from "@ngx-formly/core";
import {ModalCrearEditarComponent} from "../../componentes/modal-crear-editar/modal-crear-editar.component";
import {MatDialog} from "@angular/material/dialog";
import {arrayUnion, serverTimestamp} from '@angular/fire/firestore'
import {UsuarioFirestoreType} from "../../types/usuario-firestore.type";

@Component({
  selector: 'app-ruta-sprint',
  templateUrl: './ruta-sprint.component.html',
  styleUrls: ['./ruta-sprint.component.scss']
})
export class RutaSprintComponent implements OnInit {

  fields: FormlyFieldConfig[] = [
    {
      key: 'nombre',
      type: 'input',
      props: {
        label: 'Nombre Historia Usuario',
        placeholder: 'Nombre Historia Usuario',
        description: 'Nombre Historia Usuario',
        required: true,
      },
    },
    // {
    //   key: 'linkHU',
    //   type: 'input',
    //   props: {
    //     label: 'URL Historia Usuario',
    //     placeholder: 'URL Historia Usuario',
    //     description: 'URL Historia Usuario',
    //   },
    // },
  ];
  model: {
    nombre: string;
    // linkHU?: string;
  } = {
    nombre: '',
    // linkHU: '',
  }

  scrumPokerVotos!: Observable<UPSprint[]>;
  user?:User;
  params!: { "id":string};

  proyecto!: UProyectos;
  constructor(
    public angularFirestore: AngularFirestore,
    public angularFireAuth: AngularFireAuth,
    public activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    ) { }

  ngOnInit(): void {
    this.angularFireAuth.user.subscribe(
      (user)=>{
        if(user && user.emailVerified){
          this.user = user as User;
          this.activatedRoute.params
            .subscribe(
              (data )=>{
                this.params = data as { "id":string};
                this.cargarProyecto(this.user as User);
                if(user){
                  this.cargarSprints(user as User);
                }
              }
            );
        }
      }
    );
  }

cargarProyecto(user: User){
  this.angularFirestore
    .collection(ColeccionesEnum.Users)
    .doc(user.uid as string)
    .collection(ColeccionesEnum.UProyectos)
    .doc<UProyectos>(this.params.id)
    .valueChanges()
    .subscribe(
      (proyecto: UProyectos | undefined)=>{
        if(proyecto){
          this.proyecto = proyecto;
        }
      }
    )
}

  cargarSprints(user: User) {
    this.model = {
      nombre: '',
    };

    this.scrumPokerVotos = this.angularFirestore
      .collection(ColeccionesEnum.Users)
      .doc(user.uid as string)
      .collection(ColeccionesEnum.UProyectos)
      .doc(this.params.id)
      .collection<UPSprint>(ColeccionesEnum.UPSprint)
      .get()
      .pipe(
        map(
          (data)=>{
            return data.docs.map(d=>{
              return {
                ...d.data(),
                id:d.id
              }
            })
          }
        )
      )
  }


  abrirCrearProyecto() {
    const dialogRef = this.dialog.open(ModalCrearEditarComponent, {
      data: {
        model: this.model,
        fields: this.fields,
      },
    });

    dialogRef.afterClosed().subscribe((result: {
      nombre: string;
      linkHU?: string;
    }) => {
      if (this.user && result) {
        let object = {...result, createdAt: serverTimestamp(), respuestasVoto:{}} as UPSprint;
        this.proyecto.colaboradores.forEach(
          (colaborador)=>{
            object.respuestasVoto[colaborador] = {correo: colaborador};
          }
        )
        this.angularFirestore
          .collection(ColeccionesEnum.Users)
          .doc(this.user.uid)
          .collection(ColeccionesEnum.UProyectos)
          .doc(this.params.id)
          .collection(ColeccionesEnum.UPSprint)
          .add(object)
          .then(
            () => this.cargarSprints(this.user as User)
          )
          .catch();
      }
    });
  }


  fieldsPuntaje: FormlyFieldConfig[] = [
    {
      key: 'puntajeAcordado',
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
  modelPuntaje: {
    puntajeAcordado: number;
  } = {
    puntajeAcordado: 0,
  }
  abrirAcordarPuntaje(scrumPoker:UPSprint){
    const dialogRef = this.dialog.open(ModalCrearEditarComponent, {
      data: {
        model: this.modelPuntaje,
        fields: this.fieldsPuntaje,
      },
    });

    dialogRef.afterClosed().subscribe((result: {
      puntajeAcordado: number;
    }) => {
      if (this.user && result) {
        this.angularFirestore
          .collection(ColeccionesEnum.Users)
          .doc(this.user.uid)
          .collection(ColeccionesEnum.UProyectos)
          .doc(this.params.id)
          .collection(ColeccionesEnum.UPSprint)
          .doc(scrumPoker.id)
          .update({puntajeAcordado:result.puntajeAcordado})
          .then(
            () => this.cargarSprints(this.user as User)
          )
          .catch();
      }
    });
  }
}
