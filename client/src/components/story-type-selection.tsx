import { storyTypes } from "@/lib/story-types";
import { cn } from "@/lib/utils";

interface StoryTypeSelectionProps {
  selectedStoryType: string;
  onSelectStoryType: (storyType: string) => void;
}

export default function StoryTypeSelection({ selectedStoryType, onSelectStoryType }: StoryTypeSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {storyTypes.map((storyType) => (
        <div
          key={storyType.id}
          onClick={() => onSelectStoryType(storyType.id)}
          className={cn(
            "story-card rounded-3xl p-8 shadow-lg cursor-pointer border-4 transition-all duration-300",
            selectedStoryType === storyType.id 
              ? "transform -translate-y-2 shadow-2xl border-primary-purple" 
              : "border-transparent hover:border-primary-purple",
            storyType.gradient
          )}
        >
          <div className="text-center">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
              storyType.iconBg
            )}>
              <storyType.icon className="text-white text-2xl" />
            </div>
            <h4 className="font-heading text-2xl text-primary-purple mb-3">{storyType.name}</h4>
            <p className="text-gray-600">{storyType.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
