import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { Intervention } from '../models/intervention.model';
import { InterventionsService } from '../services/interventions.service';

// Etat de la page rapport d'intervention. On y garde la liste des interventions
// de l'agent, l'id de celle qui est selectionnee (le nom du site et l'adresse en
// sont derives, jamais stockes separement pour eviter toute incoherence), et les
// drapeaux de chargement / erreur.
interface ReportInterventionState {
  interventions: Intervention[];
  selectedId: string | null;
  loading: boolean;
  loadError: boolean;
}

const initialState: ReportInterventionState = {
  interventions: [],
  selectedId: null,
  loading: false,
  loadError: false,
};

export const ReportInterventionStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ interventions, selectedId, loading, loadError }) => ({
    // Intervention actuellement selectionnee (objet complet), ou null. Sert de
    // source unique pour deriver le nom du site ET l'adresse : les deux listes du
    // formulaire pointent donc toujours sur la meme intervention.
    selectedIntervention: computed(
      () => interventions().find((itv) => itv.id === selectedId()) ?? null,
    ),

    // Vrai uniquement quand le chargement est termine, sans erreur, et qu'aucune
    // intervention n'est disponible. Permet d'afficher un etat vide distinct de
    // l'etat de chargement et de l'etat d'erreur (exigence des 4 etats).
    isEmpty: computed(
      () => !loading() && !loadError() && interventions().length === 0,
    ),
  })),

  withMethods((store, api = inject(InterventionsService)) => ({
    // Selectionne une intervention par son id. Appele indifferemment quand
    // l'utilisateur choisit un nom de site OU une adresse : dans les deux cas on
    // ne memorise que l'id, ce qui garantit que site + adresse restent solidaires.
    select(id: string | null): void {
      patchState(store, { selectedId: id });
    },

    // Charge les interventions de l'agent connecte. Passe loading a true et
    // remet loadError a false avant l'appel ; en cas de succes stocke la liste,
    // en cas d'echec leve le drapeau d'erreur. rxMethod annule un chargement
    // precedent encore en vol (switchMap) si la page est re-declenchee.
    load: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, { loading: true, loadError: false });
        }),
        switchMap(() =>
          api.list().pipe(
            tapResponse({
              next: (interventions) => {
                patchState(store, { interventions, loading: false });
              },
              error: () => {
                patchState(store, { loadError: true, loading: false });
              },
            }),
          ),
        ),
      ),
    ),

    // Reinitialise l'etat (interventions conservees, mais selection effacee).
    // Utilise apres un envoi reussi pour repartir sur un formulaire vierge sans
    // recharger inutilement la liste.
    clearSelection(): void {
      patchState(store, { selectedId: null });
    },
  })),
);
