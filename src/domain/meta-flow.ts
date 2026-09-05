export type MetaFlowAction = 'boot' | 'lobbyContinue' | 'heroChosen' | 'retrySameHero' | 'returnLobby' | 'traitChosen';
export type MetaFlowScreen = 'lobby' | 'hero' | 'trait' | 'combat';

export function nextStartScreen(action: MetaFlowAction): MetaFlowScreen {
  switch (action) {
    case 'boot': return 'lobby';
    case 'lobbyContinue': return 'hero';
    case 'heroChosen': return 'trait';
    case 'retrySameHero': return 'trait';
    case 'returnLobby': return 'lobby';
    case 'traitChosen': return 'combat';
  }
}
