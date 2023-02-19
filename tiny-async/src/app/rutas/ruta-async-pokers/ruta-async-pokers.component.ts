import {Component, OnInit} from '@angular/core';
import {AngularFirestore, QuerySnapshot} from "@angular/fire/compat/firestore";
import {AngularFireAuth} from "@angular/fire/compat/auth";
import {User} from "@angular/fire/auth";
import {ColeccionesEnum} from "../../enums/colecciones.enum";
import {UProyectos} from "../../interfaces/models/u-proyectos";
import {map, mergeMap, Observable, of} from "rxjs";
import {FormlyFieldConfig} from "@ngx-formly/core";
import {MatDialog} from "@angular/material/dialog";
import {ModalCrearEditarComponent} from "../../componentes/modal-crear-editar/modal-crear-editar.component";
import {arrayUnion, serverTimestamp, arrayRemove} from '@angular/fire/firestore'
import {UsuarioFirestoreType} from "../../types/usuario-firestore.type";
import {CrearEditarParametrosType} from "../../types/crear-editar-parametros.type";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-ruta-async-pokers',
  templateUrl: './ruta-async-pokers.component.html',
  styleUrls: ['./ruta-async-pokers.component.scss']
})
export class RutaAsyncPokersComponent implements OnInit {

  formFiltrarProyectos = new FormGroup({});
  fieldsFiltrarProyectos!: FormlyFieldConfig[];
  modelFiltrarProyectos: {
    nombre: string;
  } = {
    nombre: ''
  }
  fields: FormlyFieldConfig[] = [
    {
      key: 'nombre',
      type: 'input',
      props: {
        label: 'Nombre',
        placeholder: 'Nombre',
        description: 'Nombre',
        required: true,
      },
    },
    {
      key: 'nombreSprint',
      type: 'input',
      props: {
        label: 'Nombre Sprint',
        placeholder: 'Nombre Sprint',
        description: 'Nombre Sprint',
        required: true,
      },
    },
    {
      key: 'url',
      type: 'input',
      props: {
        label: 'URL milestone',
        placeholder: 'URL milestone',
        description: 'URL milestone',
      },
    },
    {
      key: 'codigo',
      type: 'input',
      props: {
        label: 'Codigo',
        placeholder: 'Codigo',
        description: 'Codigo',
      },
    },
  ];
  model: {
    nombre: string;
    url?: string;
    codigo?: string;
    nombreSprint: string;
  } = {
    nombre: '',
    nombreSprint: '',
  }

  fieldsColaborador: FormlyFieldConfig[] = [
    {
      key: 'correo',
      type: 'input',
      props: {
        label: 'Correo',
        placeholder: 'Correo',
        description: 'Correo',
        required: true,
        type: 'email'
      },
    }
  ];
  modelColaborador: {
    correo: string;
  } = {
    correo: '',
  }
  proyectos: UProyectos[] = [];
  coleccionUsers = ColeccionesEnum.Users;
  coleccionProyectos = ColeccionesEnum.UProyectos;
  user?: User;
  snapshotProyecto: any;
  usuarioFirestore?: UsuarioFirestoreType;
  noHayMasDatos = false;

  limit = 3;
  constructor(
    public angularFirestore: AngularFirestore,
    public angularFireAuth: AngularFireAuth,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.angularFireAuth.user.subscribe(
      (user) => {
        if (user && user.emailVerified) {
          this.user = user as User;
          this.cargarUsuario(this.user);
        }
      }
    );
  }

  cargarUsuario(user: User) {

    const refUsers = this.angularFirestore
      .collection(ColeccionesEnum.Users)
      .doc<UsuarioFirestoreType>(user.uid)

    refUsers
      .valueChanges()
      .subscribe(
        (usuario) => {
          this.fieldsFiltrarProyectos = [
            {
              key: 'nombre',
              type: 'select',
              props: {
                label: 'Proyecto',
                placeholder: 'Filtre proyecto',
                description: 'Filtre proyecto',
                required: true,
                options: usuario ? usuario.nombresProyectos.map(
                  (nombre) => {
                    return {
                      value: nombre,
                      label: nombre
                    }
                  }
                ) : [],
              },
            },
          ];
          this.usuarioFirestore = undefined;
          setTimeout(
            () => {
              this.usuarioFirestore = usuario;
            },
            1
          );
        }
      )
  }

  async cargarProyectos(user: User, reinicio = false) {
    if(reinicio){
      this.snapshotProyecto = undefined;
      this.proyectos = [];
    }
    this.modelColaborador = {
      correo: '',
    };
    this.model = {
      nombre: '',
      nombreSprint: '',
    };
    const refUsers = this.angularFirestore
      .collection(ColeccionesEnum.Users)
      .doc<UsuarioFirestoreType>(user.uid)
    const refProyecto = refUsers
      .collection<UProyectos>(ColeccionesEnum.UProyectos,
        ref => {
          let refPaginacion = ref
            .where('nombre', '==', this.modelFiltrarProyectos.nombre)
            .orderBy('createdAt', 'desc')
            .limit(this.limit)
          if (this.snapshotProyecto) {
            return refPaginacion.startAfter(this.snapshotProyecto)
          }
          return refPaginacion
        }
      )
    refProyecto
      .get()
      .pipe(
        map(
          (data) => {
            if (data.docs) {
              if (data.docs.length > 0) {
                this.snapshotProyecto = data.docs[data.docs.length - 1];
              } else {
                this.noHayMasDatos = true
              }
            }
            return [
              ...this.proyectos,
              ...data.docs.map(d => {
                return {
                  ...d.data(),
                  id: d.id
                }
              }) as UProyectos[]
            ];
          }
        )
      )
      .subscribe(
        (arreglo) => {
          this.proyectos = arreglo;
        }
      );
  }

  abrirCrearProyecto() {
    const dialogRef = this.dialog.open<ModalCrearEditarComponent, CrearEditarParametrosType>(ModalCrearEditarComponent, {
      data: {
        model: this.model,
        fields: this.fields,
        arregloNombres: this.usuarioFirestore?.nombresProyectos,
      },
    });

    dialogRef.afterClosed().subscribe((result: {
      nombre: string;
      url?: string;
      codigo?: string;
      nombreSprint: string;
    }) => {
      if (this.user && result) {
        this.angularFirestore
          .collection(ColeccionesEnum.Users)
          .doc(this.user.uid)
          .collection(ColeccionesEnum.UProyectos)
          .add({
            ...result,
            createdAt: serverTimestamp(),
            nombre: result.nombre.toUpperCase(),
            correoUsuarioEncargado: this.user.email
          })
          .then(
            () => this.cargarProyectos(this.user as User)
          )
          .catch();
        this.angularFirestore
          .collection(ColeccionesEnum.Users)
          .doc(this.user.uid)
          .update({
            nombresProyectos: arrayUnion(result.nombre.toUpperCase())
          })
          .then()
          .catch()
      }
    });
  }

  abrirCrearColaborador(proyecto: UProyectos) {
    const dialogRef = this.dialog.open<ModalCrearEditarComponent, CrearEditarParametrosType>(ModalCrearEditarComponent, {
      data: {
        model: this.modelColaborador,
        fields: this.fieldsColaborador
      },
    });

    dialogRef.afterClosed().subscribe((result: {
      correo: string;
    }) => {
      if (this.user && result) {
        this.angularFirestore
          .collection(ColeccionesEnum.Users)
          .doc(this.user.uid)
          .collection(ColeccionesEnum.UProyectos)
          .doc(proyecto.id)
          .update({
            colaboradores: arrayUnion(this.modelColaborador.correo)
          })
          .then(
            () => this.cargarProyectos(this.user as User, true)
          )
          .catch();
      }
    });
  }

  removeItem(proyecto: UProyectos, colaborador: string){
    if (this.user) {
      this.angularFirestore
        .collection(ColeccionesEnum.Users)
        .doc(this.user.uid)
        .collection(ColeccionesEnum.UProyectos)
        .doc(proyecto.id)
        .update({
          colaboradores: arrayRemove(colaborador)
        })
        .then(
          () => this.cargarProyectos(this.user as User, true)
        )
        .catch();
    }
  }

}
