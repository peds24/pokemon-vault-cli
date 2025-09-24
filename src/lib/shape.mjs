export function shapeCard(card) {
  return {
    id: card.id ?? '',
    name: card.name ?? '',
    number: card.number ?? '',
    printedTotal: card.set?.printedTotal ?? null,
    setName: card.set?.name ?? '',
    setId: card.set?.id ?? '',
    setSeries: card.set?.series ?? '',
    releaseDate: card.set?.releaseDate ?? '',
    rarity: card.rarity ?? '',
    artist: card.artist ?? '',
    supertype: card.supertype ?? '',
    subtypes: Array.isArray(card.subtypes) ? card.subtypes.join('|') : '',
    smallImage: card.images?.small ?? '',
    largeImage: card.images?.large ?? '',
    tcgplayerUrl: card.tcgplayer?.url ?? '',
  };
}
