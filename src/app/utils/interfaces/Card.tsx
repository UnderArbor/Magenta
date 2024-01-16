interface Card {
  fullName: string;
  firstName: string;
  originalCMC: number[];
  cmc: number[];
  cmcIndex: number;
  manaCost: string;
  manaSymbols: string[] | null;
  colors: string[];
  producedMana: string[];
  originalTypes: string[];
  types: string[];
  typeIndex: number;
  oracleText: string[];
  flavorText: string[];
  tags: string[];
  tagIndex: number;

  cardArt: string;
  smallImage: string;
  normalImage: string;
  largeImage: string;

  doubleSided: boolean;
  dualCard: boolean;
  secondCard: SecondCard | null;

  set: {
    setName: string;
    setCode: string;
  };
  artist: string;
  promo: boolean;
  borderless: boolean;
  keywords: string[];
  scryfallURI: string;
  rulingsURI: string;
  legalities: string[];
}
