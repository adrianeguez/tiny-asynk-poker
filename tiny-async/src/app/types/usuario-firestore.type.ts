import {User} from "@angular/fire/auth";

export type UsuarioFirestoreType = User & { createdAt: any; nombresProyectos: string[]; };
