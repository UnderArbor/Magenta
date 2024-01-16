import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full w-full bg-purple-900">
      <Link href={"/test-deck"} className="bg-yellow-400 font-bold text-white">
        Go to Test Deck
      </Link>
    </div>
  );
}
