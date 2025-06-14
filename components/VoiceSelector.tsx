"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import VoiceRecorder from "./VoiceRecorder";
import LoadingSkeleton from "./LoadingSkeleton";
import { toast } from "sonner";
import {
  Mic,
  Volume2,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { VOICE_TRAINING_TEXTS } from "@/constants/voice-training";

interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
}

interface VoiceSelectorProps {
  onVoiceSelected: (voiceId: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  showOnlySelection?: boolean;
}

export default function VoiceSelector({
  onVoiceSelected,
  systemPrompt,
  onSystemPromptChange,
  showOnlySelection = false,
}: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"select" | "clone">("clone");
  const [isConfigured, setIsConfigured] = useState(false);

  // Load voices on component mount
  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const response = await fetch("/api/voices");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load voices");
      }

      setVoices(result.voices || []);
    } catch (error) {
      console.error("Error loading voices:", error);
      toast.error("Failed to load voices from your account");
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
  };

  const handleConfirmSelection = () => {
    if (!selectedVoiceId) {
      toast.error("Please select a voice");
      return;
    }
    setIsConfigured(true);
  };

  const handleVoiceCloned = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    setIsConfigured(true);
  };

  const handleGoBack = () => {
    setIsConfigured(false);
    setSelectedVoiceId(null);
  };

  const handleStartCall = () => {
    if (selectedVoiceId) {
      onVoiceSelected(selectedVoiceId);
    }
  };

  // If configured, show the final interface
  if (isConfigured && selectedVoiceId) {
    const selectedVoice = voices.find((v) => v.voice_id === selectedVoiceId);
    const voiceName = selectedVoice?.name || "Cloned Voice";

    return (
      <div className="space-y-6">
        {/* Voice Ready Card */}
        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col gap-6">
              {/* Voice Ready Badge */}
              <div className="flex justify-center">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Voice Ready: {voiceName}
                </Badge>
              </div>

              {/* System Prompt Editor */}
              <div className="space-y-2">
                <Label
                  htmlFor="finalSystemPrompt"
                  className="text-white font-medium flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  System Prompt
                </Label>
                <Textarea
                  id="finalSystemPrompt"
                  value={systemPrompt}
                  onChange={(e) => onSystemPromptChange(e.target.value)}
                  placeholder="Enter the system prompt for your AI assistant..."
                  rows={6}
                  className="bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 resize-none"
                />
                <p className="text-gray-400 text-sm">
                  This defines how your AI assistant will behave during the
                  conversation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white h-14"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Voice
                </Button>
                <Button
                  onClick={handleStartCall}
                  size="lg"
                  className="min-w-[240px] h-14 text-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-lg"
                >
                  <Volume2 className="mr-2 h-6 w-6" />
                  Start AI Assistant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If showOnlySelection is true, render only the voice selection interface
  if (showOnlySelection) {
    return (
      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-purple-400" />
            Select Your Voice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingVoices ? (
              <LoadingSkeleton
                message="Loading your voices..."
                minHeight="h-80"
              />
            ) : voices.length === 0 ? (
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <AlertDescription className="text-yellow-200">
                  No voices found in your ElevenLabs account. Try cloning a new
                  voice instead.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="grid gap-3 max-h-64 overflow-y-auto">
                  {voices.map((voice) => (
                    <div
                      key={voice.voice_id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedVoiceId === voice.voice_id
                          ? "bg-purple-500/20 border-purple-500/50 text-white"
                          : "bg-gray-900/50 border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500"
                      }`}
                      onClick={() => handleVoiceSelect(voice.voice_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{voice.name}</h3>
                          <p className="text-sm opacity-70">{voice.category}</p>
                          {voice.description && (
                            <p className="text-xs opacity-60 mt-1">
                              {voice.description}
                            </p>
                          )}
                        </div>
                        {selectedVoiceId === voice.voice_id && (
                          <CheckCircle2 className="h-5 w-5 text-purple-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleConfirmSelection}
                  disabled={!selectedVoiceId}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Use Selected Voice
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-purple-400" />
          Choose Your Voice
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "select" | "clone")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 p-1">
            <TabsTrigger
              value="clone"
              className="h-10 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-300 hover:text-white"
            >
              <Mic className="mr-2 h-4 w-4" />
              Clone New Voice
            </TabsTrigger>
            <TabsTrigger
              value="select"
              className="h-10 text-base font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 text-gray-300 hover:text-white"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Select Existing Voice
            </TabsTrigger>
          </TabsList>

          {/* Select Existing Voice Tab */}
          <TabsContent value="select" className="mt-0">
            <div className="space-y-4">
              {isLoadingVoices ? (
                <LoadingSkeleton
                  message="Loading your voices..."
                  minHeight="h-80"
                />
              ) : voices.length === 0 ? (
                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <AlertDescription className="text-yellow-200">
                    No voices found in your ElevenLabs account. Try cloning a
                    new voice instead.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {voices.map((voice) => (
                      <div
                        key={voice.voice_id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedVoiceId === voice.voice_id
                            ? "bg-purple-500/20 border-purple-500/50 text-white"
                            : "bg-gray-900/50 border-gray-600 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500"
                        }`}
                        onClick={() => handleVoiceSelect(voice.voice_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{voice.name}</h3>
                            <p className="text-sm opacity-70">
                              {voice.category}
                            </p>
                            {voice.description && (
                              <p className="text-xs opacity-60 mt-1">
                                {voice.description}
                              </p>
                            )}
                          </div>
                          {selectedVoiceId === voice.voice_id && (
                            <CheckCircle2 className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleConfirmSelection}
                    disabled={!selectedVoiceId}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Use Selected Voice
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          {/* Clone New Voice Tab */}
          <TabsContent value="clone" className="mt-0">
            <VoiceRecorder
              onVoiceCloned={handleVoiceCloned}
              systemPrompt={systemPrompt}
              onSystemPromptChange={onSystemPromptChange}
              voiceTrainingTexts={VOICE_TRAINING_TEXTS}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
