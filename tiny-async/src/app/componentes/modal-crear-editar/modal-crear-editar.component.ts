import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormlyFieldConfig} from "@ngx-formly/core";
import {FormGroup} from "@angular/forms";
import {CrearEditarParametrosType} from "../../types/crear-editar-parametros.type";

@Component({
  selector: 'app-modal-crear-editar',
  templateUrl: './modal-crear-editar.component.html',
  styleUrls: ['./modal-crear-editar.component.scss']
})
export class ModalCrearEditarComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: CrearEditarParametrosType
  ) {
  }

  ngOnInit(): void {
  }

  form = new FormGroup({});
  model = this.data.model;
  fields: FormlyFieldConfig[] = this.data.fields;

  onSubmit(model: any) {
    this.dialogRef.close(model);
  }

}
