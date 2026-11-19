import { SONGS0 } from "./data/songs";
import { normalizeSong } from "./lib/music";

// ══════════════════════════════════════════════════
//  ÉTAT INITIAL
// ══════════════════════════════════════════════════
export const INIT = {
  members:    { creil:[], lognes:[], toulouse:[] },
  avail:      {},
  dispoSent:  {}, // { memberId: { "YYYY-MM": true } } — dispos transmises à l'admin
  plans:      { creil:{}, lognes:{}, toulouse:{} },
  planStatus: { creil:"draft", lognes:"draft", toulouse:"draft" },
  validatedMonths: { creil:{}, lognes:{}, toulouse:{} },
  planService:{ creil:{}, lognes:{}, toulouse:{} }, // membres sélectionnés pour service
  planLead:   { creil:{}, lognes:{}, toulouse:{} }, // lead 🎤 par date
  // Service technique
  techMembers:  { creil:[], lognes:[], toulouse:[] },
  techPlans:    { creil:{}, lognes:{} },   // { cid: { "YYYY-MM-DD": { memberId: poste } } }
  techAvail:    {},                         // { memberId: { "cid|YYYY-MM-DD": {on,ts} } }
  techDispoSent:{},                         // { memberId: { "cid|YYYY-MM": true } }
  techValidated:{ creil:{}, lognes:{} },    // { cid: { "YYYY-MM": true } }
  // Groupe communication / audiovisuel (même structure)
  comMembers:   { creil:[], lognes:[], toulouse:[] },
  comPlans:     { creil:{} },
  comAvail:     {},
  comDispoSent: {},
  comValidated: { creil:{} },
  notifLog:   [],
  songs:      SONGS0.map(normalizeSong),
  programs:   [],
  repetitions: [], // listes de répétition
  notifSeenMonth: null,
  memberNotifications: [], // notifications aux membres lors de leur création
};
