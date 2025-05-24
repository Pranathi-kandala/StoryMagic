import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Story } from "@shared/schema";

export default function SavedStories() {
  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const savedStories = stories?.filter(story => story.isSaved) || [];

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-heading text-3xl text-primary-purple">My Story Collection</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (savedStories.length === 0) {
    return (
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-heading text-3xl text-primary-purple">My Story Collection</h3>
        </div>
        <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
          <div className="text-6xl mb-4">📚</div>
          <h4 className="font-heading text-2xl text-primary-purple mb-2">No Saved Stories Yet</h4>
          <p className="text-gray-600">Create and save your first magical story!</p>
        </div>
      </section>
    );
  }

  const getStoryEmoji = (character: string, storyType: string) => {
    const emojiMap: Record<string, string> = {
      princess: "👑",
      knight: "⚔️",
      dragon: "🐉",
      wizard: "🧙‍♂️",
      fairy: "🧚‍♀️",
      pirate: "🏴‍☠️",
      "fairy-tale": "🏰",
      adventure: "🗺️",
      mystery: "🔍",
      friendship: "❤️",
      space: "🚀",
      animals: "🐾",
    };
    return emojiMap[character] || emojiMap[storyType] || "📖";
  };

  const getBorderColor = (storyType: string) => {
    const colorMap: Record<string, string> = {
      "fairy-tale": "border-purple-400",
      adventure: "border-primary-yellow",
      mystery: "border-accent-orange",
      friendship: "border-green-400",
      space: "border-blue-400",
      animals: "border-pink-400",
    };
    return colorMap[storyType] || "border-primary-yellow";
  };

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-heading text-3xl text-primary-purple">My Story Collection</h3>
        {savedStories.length > 3 && (
          <Button variant="ghost" className="text-primary-purple hover:text-purple-600 font-medium">
            View All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedStories.slice(0, 3).map((story) => (
          <div
            key={story.id}
            className={`bg-white rounded-3xl p-6 shadow-lg border-l-4 ${getBorderColor(story.storyType)} hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-heading text-xl text-primary-purple mb-2 line-clamp-2">
                  {story.title}
                </h4>
                <p className="text-gray-500 text-sm">
                  {story.storyType.charAt(0).toUpperCase() + story.storyType.slice(1).replace('-', ' ')} • {" "}
                  {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-2xl">
                {getStoryEmoji(story.character, story.storyType)}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {story.content.substring(0, 150)}...
            </p>
            <Button 
              variant="ghost"
              className="text-primary-purple hover:text-purple-600 font-medium text-sm p-0"
            >
              Read Again
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
