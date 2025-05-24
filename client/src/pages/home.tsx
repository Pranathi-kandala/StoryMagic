import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WandSparkles, Shield } from "lucide-react";
import CharacterSelection from "@/components/character-selection";
import StoryTypeSelection from "@/components/story-type-selection";
import StoryDisplay from "@/components/story-display";
import ParentalControlsModal from "@/components/parental-controls-modal";
import SavedStories from "@/components/saved-stories";
import type { Story } from "@shared/schema";

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [selectedStoryType, setSelectedStoryType] = useState<string>("");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [isParentalModalOpen, setIsParentalModalOpen] = useState(false);
  const { toast } = useToast();

  const generateStoryMutation = useMutation({
    mutationFn: async (data: { character: string; storyType: string; userPrompt: string }) => {
      const response = await apiRequest("POST", "/api/stories/generate", data);
      return await response.json();
    },
    onSuccess: (story: Story) => {
      setGeneratedStory(story);
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story Created!",
        description: "Your magical story is ready to read!",
      });
      // Scroll to story result
      setTimeout(() => {
        document.getElementById("story-result")?.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }, 100);
    },
    onError: () => {
      toast({
        title: "Oops!",
        description: "Something went wrong creating your story. Please try again!",
        variant: "destructive",
      });
    },
  });

  const handleGenerateStory = () => {
    if (!selectedCharacter || !selectedStoryType) {
      toast({
        title: "Don't forget to choose!",
        description: "Please select a character and story type first!",
        variant: "destructive",
      });
      return;
    }

    generateStoryMutation.mutate({
      character: selectedCharacter,
      storyType: selectedStoryType,
      userPrompt,
    });
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-cream))]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-primary-yellow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-purple to-primary-yellow rounded-full flex items-center justify-center">
                <WandSparkles className="text-white text-xl" />
              </div>
              <h1 className="text-3xl font-heading text-primary-purple">StoryMagic</h1>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsParentalModalOpen(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-none"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Parent Zone</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-heading text-primary-purple mb-4">Create Your Magical Story!</h2>
          <p className="text-xl text-gray-600 font-medium">Choose your character, pick a story type, and let's make magic happen!</p>
        </div>

        {/* Step 1: Character Selection */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-primary-purple text-white rounded-full flex items-center justify-center font-heading text-xl mr-4">1</div>
            <h3 className="text-3xl font-heading text-primary-purple">Choose Your Hero</h3>
          </div>
          
          <CharacterSelection 
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
          />
        </section>

        {/* Step 2: Story Type Selection */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-primary-yellow text-primary-purple rounded-full flex items-center justify-center font-heading text-xl mr-4">2</div>
            <h3 className="text-3xl font-heading text-primary-purple">Pick Your Adventure</h3>
          </div>
          
          <StoryTypeSelection
            selectedStoryType={selectedStoryType}
            onSelectStoryType={setSelectedStoryType}
          />
        </section>

        {/* Step 3: Custom Prompt */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-accent-orange text-white rounded-full flex items-center justify-center font-heading text-xl mr-4">3</div>
            <h3 className="text-3xl font-heading text-primary-purple">Add Your Special Touch</h3>
          </div>
          
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <label htmlFor="story-prompt" className="block text-xl font-heading text-primary-purple mb-4">
              What should happen in your story?
            </label>
            <Textarea
              id="story-prompt"
              placeholder="Tell me about your favorite place, what you want your character to do, or anything special you want in your story!"
              className="w-full h-32 p-6 border-4 border-gray-200 rounded-2xl text-lg resize-none focus:border-primary-yellow focus:outline-none"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
            />
            <p className="text-gray-500 text-sm mt-3">
              Example: "I want the princess to find a lost puppy in a magical garden with talking flowers!"
            </p>
          </div>
        </section>

        {/* Generate Story Button */}
        <div className="text-center mb-16">
          <Button
            onClick={handleGenerateStory}
            disabled={generateStoryMutation.isPending}
            className="bg-gradient-to-r from-primary-purple to-primary-yellow hover:from-primary-yellow hover:to-primary-purple text-white font-heading text-2xl px-12 py-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-yellow focus:ring-opacity-50"
          >
            <WandSparkles className="mr-3" />
            {generateStoryMutation.isPending ? "Creating WandSparkles..." : "Create My Story!"}
          </Button>
        </div>

        {/* Loading State */}
        {generateStoryMutation.isPending && (
          <div className="text-center mb-16">
            <div className="bg-white rounded-3xl p-12 shadow-lg max-w-md mx-auto">
              <div className="animate-bounce-slow text-6xl mb-6">🪄</div>
              <h3 className="font-heading text-2xl text-primary-purple mb-4">Creating Your Story...</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div className="bg-gradient-to-r from-primary-purple to-primary-yellow h-3 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <p className="text-gray-600">Our magical AI is writing your adventure!</p>
            </div>
          </div>
        )}

        {/* Generated Story Display */}
        {generatedStory && (
          <StoryDisplay 
            story={generatedStory}
            onCreateAnother={() => {
              setGeneratedStory(null);
              setSelectedCharacter("");
              setSelectedStoryType("");
              setUserPrompt("");
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Saved Stories Section */}
        <SavedStories />
      </main>

      {/* Parental Controls Modal */}
      <ParentalControlsModal
        isOpen={isParentalModalOpen}
        onClose={() => setIsParentalModalOpen(false)}
      />
    </div>
  );
}
