"use client";
import { useState } from "react";
import SearchBar from "./searchbar";
import Image from "next/image";

import type Card from "../interfaces/Card";

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);

  const addCard = (card: Card): void => {
    setCards([...(cards ?? []), card]);
  };

  return (
    <div>
      <SearchBar addCard={addCard} />
      {cards.length == 0
        ? null
        : cards.map((card: Card, index) => (
            <li key={index}>
              <h1 className="text-2xl font-bold text-white">{card.fullName}</h1>
              <Image src={card.normalImage} alt={card.fullName} />
            </li>
          ))}
    </div>
  );
}
