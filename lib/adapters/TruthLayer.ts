export enum TruthLayer {
    WORKER = 1,
    EXECUTIVE = 2,
    ELITE = 3,
    SYSTEM = 4
}

export function determinePlayerTruthLayer(player: any): TruthLayer {
    if (player.jobTitle === 'President' || player.jobTitle?.includes('Director') || player.jobTitle?.includes('Minister') || player.jobTitle?.includes('Advisor')) {
        return TruthLayer.SYSTEM;
    }
    if (player.cash > 100000 || player.jobTitle?.includes('Manager') || player.jobTitle?.includes('Executive')) {
        return TruthLayer.EXECUTIVE;
    }
    return TruthLayer.WORKER;
}
