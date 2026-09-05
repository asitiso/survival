export function nextStartScreen(action) {
    switch (action) {
        case 'boot': return 'lobby';
        case 'lobbyContinue': return 'hero';
        case 'heroChosen': return 'trait';
        case 'retrySameHero': return 'trait';
        case 'returnLobby': return 'lobby';
        case 'traitChosen': return 'combat';
    }
}
