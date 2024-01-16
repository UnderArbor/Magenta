"use client";
import { useEffect, useState } from "react";
import searchName from "../utils/functions/search/searchName";

interface SearchBarProps {
  addCard: (arg: Card) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ addCard }) => {
  const [input, setInput] = useState<string>("");
  const [searchError, setSearchError] = useState<boolean>(false);

  return (
    <input
      className={`border-8  m-16 bg-white ${
        searchError ? "border-red-400" : "border-white"
      }`}
      value={input}
      onChange={(event) => {
        setSearchError(false);
        setInput(event.currentTarget.value);
      }}
      onKeyDown={async (event) => {
        if (event.key === "Enter") {
          searchName(input)
            .then((response: Card | string) => {
              if (typeof response == "object") {
                addCard(response);
                setInput("");
              }
            })
            .catch((response: string) => {
              console.log(response);
              setSearchError(true);
            });
        }
      }}
    ></input>
  );
};

export default SearchBar;
