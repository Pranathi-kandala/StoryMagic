import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Volume2, Bookmark, Share2, WandSparkles } from "lucide-react";
import type { Story } from "@shared/schema";

interface StoryDisplayProps {
  story: Story;
  onCreateAnother: () => void;
}

export default function StoryDisplay({ story, onCreateAnother }: StoryDisplayProps) {
  const [isReading, setIsReading] = useState(false);
  const { toast } = useToast();

  const saveStoryMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/stories/${story.id}/save`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story Saved!",
        description: "Added to your story collection!",
      });
    },
  });

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(story.content);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        utterance.onend = () => setIsReading(false);
        speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    } else {
      toast({
        title: "Not Available",
        description: "Text-to-speech is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: `Check out this magical story: ${story.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(story.content);
      toast({
        title: "Story Copied!",
        description: "Story text copied to clipboard.",
      });
    }
  };

  return (
    <section id="story-result" className="mb-16">
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        {/* Story illustration */}
        {story.imageUrl && (
          <div className="mb-8 text-center">
            <img 
              src={story.imageUrl} 
              alt={`Illustration for ${story.title}`}
              className="mx-auto rounded-2xl shadow-lg max-w-md w-full h-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
          <h3 className="font-heading text-3xl text-primary-purple">{story.title}</h3>
          <div className="flex space-x-3">
            <Button
              onClick={handleReadAloud}
              className="bg-primary-yellow hover:bg-yellow-300 text-primary-purple p-3 rounded-full"
              title="Read Aloud"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => saveStoryMutation.mutate()}
              disabled={saveStoryMutation.isPending}
              className="bg-primary-purple hover:bg-purple-600 text-white p-3 rounded-full"
              title="Save Story"
            >
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button
              onClick={handleShare}
              className="bg-accent-orange hover:bg-orange-400 text-white p-3 rounded-full"
              title="Share Story"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="prose prose-lg max-w-none">
          {story.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed text-gray-700 mb-6">
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button
            onClick={onCreateAnother}
            className="bg-gradient-to-r from-primary-yellow to-accent-orange hover:from-accent-orange hover:to-primary-yellow text-white font-heading text-xl px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            <WandSparkles className="mr-2" />
            Create Another Story!
          </Button>
        </div>
      </div>
    </section>
  );
}
