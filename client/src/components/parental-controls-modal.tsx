import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import type { ParentalSettings } from "@shared/schema";

interface ParentalControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ParentalControlsModal({ isOpen, onClose }: ParentalControlsModalProps) {
  const [ageGroup, setAgeGroup] = useState("6-8 years");
  const [dailyTimeLimit, setDailyTimeLimit] = useState(60);
  const [storiesPerDay, setStoriesPerDay] = useState(5);
  const { toast } = useToast();

  const { data: settings } = useQuery<ParentalSettings>({
    queryKey: ["/api/parental-settings"],
    enabled: isOpen,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<ParentalSettings>) => {
      const response = await apiRequest("POST", "/api/parental-settings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parental-settings"] });
      toast({
        title: "Settings Saved!",
        description: "Parental controls have been updated.",
      });
      onClose();
    },
  });

  useEffect(() => {
    if (settings) {
      setAgeGroup(settings.ageGroup);
      setDailyTimeLimit(settings.dailyTimeLimit || 60);
      setStoriesPerDay(settings.storiesPerDay || 5);
    }
  }, [settings]);

  const handleSave = () => {
    saveSettingsMutation.mutate({
      ageGroup,
      dailyTimeLimit,
      storiesPerDay,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="font-heading text-3xl text-primary-purple">Parental Controls</DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Content Filtering */}
          <div>
            <h3 className="font-heading text-xl text-primary-purple mb-4">Content Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <h4 className="font-medium text-gray-800">Age-Appropriate Content</h4>
                  <p className="text-sm text-gray-600">Filter stories based on child's age</p>
                </div>
                <Select value={ageGroup} onValueChange={setAgeGroup}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-5 years">3-5 years</SelectItem>
                    <SelectItem value="6-8 years">6-8 years</SelectItem>
                    <SelectItem value="9-12 years">9-12 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <h4 className="font-medium text-gray-800">Story Themes</h4>
                  <p className="text-sm text-gray-600">All themes are child-safe and educational</p>
                </div>
                <span className="text-green-600 font-medium">✓ Safe</span>
              </div>
            </div>
          </div>
          
          {/* Time Controls */}
          <div>
            <h3 className="font-heading text-xl text-primary-purple mb-4">Time Limits</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <h4 className="font-medium text-gray-800">Daily Usage</h4>
                  <p className="text-sm text-gray-600">Set maximum daily screen time</p>
                </div>
                <Select value={dailyTimeLimit.toString()} onValueChange={(value) => setDailyTimeLimit(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="0">No limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <h4 className="font-medium text-gray-800">Stories per Day</h4>
                  <p className="text-sm text-gray-600">Limit number of new stories</p>
                </div>
                <Select value={storiesPerDay.toString()} onValueChange={(value) => setStoriesPerDay(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 stories</SelectItem>
                    <SelectItem value="5">5 stories</SelectItem>
                    <SelectItem value="10">10 stories</SelectItem>
                    <SelectItem value="0">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 py-3 rounded-full font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveSettingsMutation.isPending}
              className="bg-gradient-to-r from-primary-purple to-primary-yellow text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all"
            >
              {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
