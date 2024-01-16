import axios from "axios";
import rateLimit from "axios-rate-limit";

import formats from "../../json/formats.json";

const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 55 });

const searchName = async (cardName: string): Promise<Card | string> => {
  const SCRYFALL_API = "https://api.scryfall.com";

  const cardPromise: Promise<Card> = new Promise(async (resolve, reject) => {
    await http
      .get(`${SCRYFALL_API}/cards/named?exact=${encodeURIComponent(cardName)}`)
      .then(async (json) => {
        const data = json.data;

        if (data.lang !== "en") reject("ERROR: WRONG LANGUAGE");

        const cardData = parseCardData(data);

        if (cardData) {
          resolve(cardData);
        } else {
          throw new Error("CARD NOT FOUND");
        }
      })
      .catch(function (error: string) {
        console.log("error: ", error);
        reject("ERROR: CARD NOT FOUND");
      });
  });

  return cardPromise;
};

const parseCardData = (data: any): Card | null => {
  let card: Card = {
    fullName: "",
    firstName: "",
    originalCMC: [],
    cmc: [],
    cmcIndex: 0,
    manaCost: "",
    manaSymbols: [],
    colors: [],
    producedMana: [],
    originalTypes: [],
    types: [],
    typeIndex: 0,
    oracleText: [],
    flavorText: [],
    tags: [],
    tagIndex: 0,

    cardArt: "",
    normalImage: "",
    smallImage: "",
    largeImage: "",

    doubleSided: false,
    dualCard: false,
    secondCard: null,

    set: {
      setName: "",
      setCode: "",
    },
    artist: "",
    promo: false,
    borderless: false,
    keywords: [],
    scryfallURI: "",
    rulingsURI: "",
    legalities: [],
  };

  //BASIC INFO
  card.fullName = data.name;
  card.firstName = data.name;
  card.cmc = card.originalCMC = [data.cmc];
  card.manaCost = data.mana_cost;
  if (!data.type_line.includes("Land")) card.colors = data.color_identity;
  if (data.produced_mana !== undefined) card.producedMana = data.produced_mana;
  card.oracleText =
    data.oracle_text !== undefined ? data.oracle_text.split(/\r?\n/) : [];
  card.flavorText =
    data.flavor_text !== undefined ? data.flavor_text.split(/\r?\n/) : [];

  const typeLine = data.type_line.split(" // ").filter((n: number) => n);
  if (typeLine.length > 1) {
    card.types = card.originalTypes = parseTypeLine(typeLine[0]);
  } else if (typeLine.lenth === 1) {
    card.types = card.originalTypes = parseTypeLine(typeLine);
  }

  //ART INFO
  if (data.image_uris !== undefined) {
    card.cardArt = data.image_uris.art_crop;
    card.smallImage = data.image_uris.small;
    card.normalImage = data.image_uris.normal;
    card.largeImage = data.image_uris.large;
  } else if (data.card_faces !== undefined) {
    card.cardArt = data.card_faces[0].image_uris.art_crop;
    card.smallImage = data.card_faces[0].image_uris.small;
    card.normalImage = data.card_faces[0].image_uris.normal;
    card.largeImage = data.card_faces[0].image_uris.large;
  } else {
    return null;
  }

  //SECOND CARD
  card.doubleSided = false;
  card.dualCard = false;
  if (data.layout === "modal_dfc" || data.layout === "transform") {
    card.doubleSided = true;
    card.firstName = data.card_faces[0].name;
    card.manaCost = data.card_faces[0].mana_cost;
    card.manaSymbols = parseManaSymbols(data.card_faces[0].mana_cost);

    card.secondCard = parseSecondCardData(data.card_faces[1]);
  } else if (
    data.layout === "split" ||
    data.layout === "adventure" ||
    data.layout === "flip"
  ) {
    card.dualCard = true;
    const nameArray = data.name.split(" // ");
    const costArray = data.mana_cost.split(" // ");

    card.firstName = nameArray[0];
    card.manaCost = costArray[0];
    card.manaSymbols = parseManaSymbols(costArray[0]);

    card.secondCard = {
      secondName: nameArray[1],
      manaCost: costArray[1],
      originalCMC: null,
      cmc: null,
      manaSymbols: parseManaSymbols(costArray[1]),
      originalTypes: parseTypeLine(typeLine[1]) || [],
      types: parseTypeLine(typeLine[1]) || [],
      cardArt: card.cardArt,
      smallImage: card.smallImage,
      normalImage: card.normalImage,
      largeImage: card.largeImage,
    };

    if (card.secondCard.manaSymbols !== null) {
      const secondCMC: number = parseCMC(card.secondCard.manaSymbols);
      card.secondCard.cmc = card.secondCard.originalCMC = [secondCMC];

      if (
        data.keywords.findIndex((keyword: string) => {
          return keyword === "Fuse";
        }) > -1
      ) {
        const difCMC: number = card.cmc[0] - secondCMC;
        card.cmc.unshift(difCMC);
      }
    }
  } else {
    card.manaSymbols = parseManaSymbols(data.mana_cost);
  }

  //CONTAINER INFO
  card.set.setName = data.set_name;
  card.set.setCode = data.set;
  card.artist = data.artist;
  card.promo = data.promo;
  card.borderless = data.oversized;

  //META INFO
  card.keywords = data.keywords;
  card.scryfallURI = data.scryfall_uri;
  card.rulingsURI = data.rulings_uri;
  card.legalities = [];
  for (const [key, value] of Object.entries(data.legalities)) {
    if (value === "legal" && formats.includes(key)) {
      card.legalities.push(key);
    }
  }

  return card;
};

const parseSecondCardData = (data: any): SecondCard => {
  const manaSymbols: string[] = parseManaSymbols(data.mana_cost);

  let secondCard: SecondCard = {
    secondName: data.name,
    manaCost: data.mana_cost,
    originalCMC: [parseCMC(manaSymbols)],
    cmc: [parseCMC(manaSymbols)],
    manaSymbols,
    originalTypes: parseTypeLine(data.type_line),
    types: parseTypeLine(data.type_line),
    cardArt: data.image_uris.art_crop,
    smallImage: data.image_uris.small,
    normalImage: data.image_uris.normal,
    largeImage: data.image_uris.large,
  };

  return secondCard;
};

const parseManaSymbols = (manaCost: string): string[] => {
  const symbols1 = manaCost.split("{");
  let finalSymbols: string[] = [];

  for (let i = 0; i < symbols1.length; ++i) {
    const symbols2 = symbols1[i].split("}");
    for (let j = 0; j < symbols2.length; ++j) {
      if (symbols2[j].length > 0) {
        if (finalSymbols.length == 0) {
          finalSymbols = [symbols2[j]];
        } else {
          finalSymbols.push(symbols2[j]);
        }
      }
    }
  }

  return finalSymbols;
};

const parseCMC = (manaSymbols: string[]): number => {
  let totalCMC = 0;
  for (let i = 0; i < manaSymbols.length; ++i) {
    if (isNaN(+manaSymbols[i])) {
      totalCMC++;
    } else {
      totalCMC += Number(manaSymbols[i]);
    }
  }
  return totalCMC;
};

const parseTypeLine = (types: string): string[] => {
  const typeSplit = types.split(" ");

  let typeArray = [];
  for (let i = 0; i < typeSplit.length; ++i) {
    if (typeSplit[i] == "—") {
      break;
    } else if (
      typeSplit[i].length > 1 &&
      typeSplit[i] !== "Legendary" &&
      typeSplit[i] !== "Tribal" &&
      typeSplit[i] !== "Snow" &&
      typeSplit[i] !== "Basic"
    ) {
      typeArray.push(typeSplit[i]);
    }
  }

  return typeArray;
};

export default searchName;
