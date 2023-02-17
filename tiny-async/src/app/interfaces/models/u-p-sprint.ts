import {ScrumPokerVoto} from "./scrum-poker-voto";

export interface UPSprint {
  id?: string;
  nombre: string;
  createdAt: any;
  puntajeAcordado?: number;
  respuestasVoto: {[key in string]?: ScrumPokerVoto};
  linkHU?: string;
}
