import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

// Interface for voice command
export interface VoiceCommand {
  command: string;
  action: () => void;
}

// Interface for pronunciation result
export interface PronunciationResult {
  score: number; // 0-100
  feedback: string;
}

// Class for voice command system
export class VoiceCommandSystem {
  private commands: VoiceCommand[] = [];
  private isListening: boolean = false;
  private recognitionTimeout: NodeJS.Timeout | null = null;
  private recording: Audio.Recording | null = null;
  
  // Register a new command
  public registerCommand(command: string, action: () => void): void {
    this.commands.push({ command: command.toLowerCase(), action });
  }
  
  // Start listening for commands
  public async startListening(timeoutMs: number = 10000): Promise<void> {
    if (this.isListening) {
      return;
    }
    
    try {
      this.isListening = true;
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Mikrofon izni reddedildi');
      }
      
      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      // Create recording object
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      // Start recording
      await this.recording.startAsync();
      
      // Set timeout to stop listening
      this.recognitionTimeout = setTimeout(() => {
        this.stopListening();
      }, timeoutMs);
      
      // Provide feedback that listening has started
      this.speakFeedback('Sizi dinliyorum');
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
      throw error;
    }
  }
  
  // Stop listening for commands
  public async stopListening(): Promise<string | null> {
    if (!this.isListening || !this.recording) {
      return null;
    }
    
    try {
      // Clear timeout
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }
      
      // Stop recording
      await this.recording.stopAndUnloadAsync();
      
      // Get recording URI
      const uri = this.recording.getURI();
      this.recording = null;
      this.isListening = false;
      
      if (!uri) {
        return null;
      }
      
      // In a real app, we would send this audio to a speech-to-text service
      // For demo purposes, we'll simulate recognition with a mock result
      const recognizedText = await this.simulateRecognition();
      
      // Process command
      if (recognizedText) {
        this.processCommand(recognizedText);
      }
      
      return recognizedText;
      
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      this.isListening = false;
      return null;
    }
  }
  
  // Process recognized command
  private processCommand(text: string): void {
    const lowerText = text.toLowerCase();
    
    // Find matching command
    for (const command of this.commands) {
      if (lowerText.includes(command.command)) {
        // Execute command action
        command.action();
        
        // Provide feedback
        this.speakFeedback(`"${command.command}" komutu çalıştırılıyor`);
        
        return;
      }
    }
    
    // No matching command found
    this.speakFeedback('Komut anlaşılamadı');
  }
  
  // Simulate speech recognition (in a real app, this would use a speech-to-text service)
  private async simulateRecognition(): Promise<string> {
    // For demo purposes, return a random command
    const mockCommands = [
      'liste oluştur',
      'kelime ekle',
      'öğrenme modunu başlat',
      'test modunu başlat',
      'ana sayfaya dön',
      'listeleri göster',
      'ilerleme durumumu göster',
      'ayarları aç',
      'yardım',
      'çıkış'
    ];
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return random command
    return mockCommands[Math.floor(Math.random() * mockCommands.length)];
  }
  
  // Speak feedback
  public speakFeedback(text: string): void {
    Speech.speak(text, {
      language: 'tr',
      pitch: 1.0,
      rate: 0.9
    });
  }
  
  // Check if system is currently listening
  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

// Class for pronunciation evaluation
export class PronunciationEvaluator {
  // Evaluate pronunciation by comparing with correct pronunciation
  public async evaluatePronunciation(
    wordToEvaluate: string,
    recordedAudioUri: string
  ): Promise<PronunciationResult> {
    try {
      // In a real app, this would use a speech recognition service to compare
      // the recorded audio with the correct pronunciation
      
      // For demo purposes, we'll simulate evaluation with a mock result
      return await this.simulateEvaluation(wordToEvaluate);
      
    } catch (error) {
      console.error('Error evaluating pronunciation:', error);
      throw error;
    }
  }
  
  // Simulate pronunciation evaluation (in a real app, this would use a speech recognition service)
  private async simulateEvaluation(word: string): Promise<PronunciationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random score between 60 and 100
    const score = Math.floor(Math.random() * 41) + 60;
    
    // Generate feedback based on score
    let feedback = '';
    if (score >= 90) {
      feedback = 'Mükemmel telaffuz!';
    } else if (score >= 80) {
      feedback = 'Çok iyi telaffuz.';
    } else if (score >= 70) {
      feedback = 'İyi telaffuz, biraz daha pratik yapabilirsiniz.';
    } else {
      feedback = 'Telaffuzunuzu geliştirmek için daha fazla pratik yapın.';
    }
    
    return { score, feedback };
  }
  
  // Speak word for reference
  public speakWord(word: string, language: string = 'en'): void {
    Speech.speak(word, {
      language,
      pitch: 1.0,
      rate: 0.8
    });
  }
  
  // Record pronunciation
  public async recordPronunciation(durationMs: number = 3000): Promise<string | null> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Mikrofon izni reddedildi');
      }
      
      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      // Create recording object
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      // Start recording
      await recording.startAsync();
      
      // Wait for specified duration
      await new Promise(resolve => setTimeout(resolve, durationMs));
      
      // Stop recording
      await recording.stopAndUnloadAsync();
      
      // Get recording URI
      const uri = recording.getURI();
      
      return uri;
      
    } catch (error) {
      console.error('Error recording pronunciation:', error);
      return null;
    }
  }
}

// Helper function to check if speech is available
export const isSpeechAvailable = async (): Promise<boolean> => {
  try {
    return await Speech.isAvailableAsync();
  } catch (error) {
    console.error('Error checking speech availability:', error);
    return false;
  }
};

// Helper function to get available voices
export const getAvailableVoices = async (): Promise<Speech.Voice[]> => {
  try {
    return await Speech.getAvailableVoicesAsync();
  } catch (error) {
    console.error('Error getting available voices:', error);
    return [];
  }
};

// Helper function to speak text
export const speakText = (text: string, language: string = 'tr'): void => {
  Speech.speak(text, {
    language,
    pitch: 1.0,
    rate: 0.9
  });
};

// Helper function to stop speaking
export const stopSpeaking = (): void => {
  Speech.stop();
};
