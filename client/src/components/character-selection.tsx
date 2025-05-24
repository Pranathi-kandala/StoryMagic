import { characters } from "@/lib/characters";
import { cn } from "@/lib/utils";

interface CharacterSelectionProps {
  selectedCharacter: string;
  onSelectCharacter: (character: string) => void;
}

export default function CharacterSelection({ selectedCharacter, onSelectCharacter }: CharacterSelectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {characters.map((character) => (
        <div
          key={character.id}
          onClick={() => onSelectCharacter(character.id)}
          className={cn(
            "character-card bg-white rounded-3xl p-6 text-center shadow-lg border-4 cursor-pointer transition-all duration-300",
            selectedCharacter === character.id 
              ? "border-primary-yellow bg-yellow-50" 
              : "border-transparent hover:border-primary-yellow"
          )}
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-yellow-100 flex items-center justify-center text-4xl">
            {character.emoji}
          </div>
          <h4 className="font-heading text-lg text-primary-purple">{character.name}</h4>
        </div>
      ))}
    </div>
  );
}
