interface SecondCardData {
  artist: string;
  artist_id: string;
  colors: string[];
  flavor_text: string;
  illustration_id: string;
  image_uris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  mana_cost: string;
  name: string;
  object: string;
  oracle_text: string;
  power: string;
  toughness: string;
  loyalty: string;
  type_line: string;
}

export default SecondCardData;
