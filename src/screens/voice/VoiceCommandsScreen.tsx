import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, IconButton, ActivityIndicator, FAB, Dialog, Portal, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Word } from '../../types';
import { VoiceCommandSystem, PronunciationEvaluator, speakText, stopSpeaking } from '../../utils/speechService';
import apiService from '../../api/apiService';

type VoiceCommandsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VoiceCommands'>;

const VoiceCommandsScreen = () => {
  const navigation = useNavigation<VoiceCommandsScreenNavigationProp>();
  
  // State
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [availableCommands, setAvailableCommands] = useState<string[]>([]);
  const [showPronunciationMode, setShowPronunciationMode] = useState(false);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [userLists, setUserLists] = useState<{ id: string; name: string }[]>([]);
  const [showListDialog, setShowListDialog] = useState(false);
  const [isRecordingPronunciation, setIsRecordingPronunciation] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Refs
  const voiceCommandSystem = useRef<VoiceCommandSystem>(new VoiceCommandSystem());
  const pronunciationEvaluator = useRef<PronunciationEvaluator>(new PronunciationEvaluator());
  
  // Initialize voice command system
  useEffect(() => {
    // Register commands
    registerCommands();
    
    // Load user lists
    loadUserLists();
    
    // Set available commands
    setAvailableCommands([
      'Ana sayfaya dön',
      'Listeleri göster',
      'Liste oluştur',
      'Kelime ekle',
      'Öğrenme modunu başlat',
      'Test modunu başlat',
      'İlerleme durumumu göster',
      'Ayarları aç',
      'Telaffuz modunu aç',
      'Yardım'
    ]);
    
    // Cleanup
    return () => {
      stopSpeaking();
    };
  }, []);
  
  // Register voice commands
  const registerCommands = () => {
    const vcs = voiceCommandSystem.current;
    
    vcs.registerCommand('ana sayfaya dön', () => navigation.navigate('Home'));
    vcs.registerCommand('listeleri göster', () => navigation.navigate('Lists'));
    vcs.registerCommand('liste oluştur', () => navigation.navigate('CreateList'));
    vcs.registerCommand('kelime ekle', () => {
      if (selectedListId) {
        navigation.navigate('AddWord', { listId: selectedListId });
      } else {
        setShowListDialog(true);
        vcs.speakFeedback('Lütfen bir liste seçin');
      }
    });
    vcs.registerCommand('öğrenme modunu başlat', () => {
      if (selectedListId) {
        navigation.navigate('Learning', { listId: selectedListId });
      } else {
        setShowListDialog(true);
        vcs.speakFeedback('Lütfen bir liste seçin');
      }
    });
    vcs.registerCommand('test modunu başlat', () => {
      if (selectedListId) {
        navigation.navigate('Test', { listId: selectedListId });
      } else {
        setShowListDialog(true);
        vcs.speakFeedback('Lütfen bir liste seçin');
      }
    });
    vcs.registerCommand('ilerleme durumumu göster', () => navigation.navigate('Progress'));
    vcs.registerCommand('ayarları aç', () => navigation.navigate('Settings'));
    vcs.registerCommand('telaffuz modunu aç', () => {
      setShowPronunciationMode(true);
      loadWordsForPronunciation();
    });
    vcs.registerCommand('yardım', () => {
      Alert.alert(
        'Sesli Komutlar Yardımı',
        'Aşağıdaki komutları kullanabilirsiniz:\n\n' +
        availableCommands.join('\n')
      );
    });
  };
  
  // Load user lists
  const loadUserLists = async () => {
    try {
      const lists = await apiService.getLists();
      setUserLists(lists.map(list => ({ id: list.id, name: list.name })));
      
      // Set default list if available
      if (lists.length > 0) {
        setSelectedListId(lists[0].id);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };
  
  // Load words for pronunciation practice
  const loadWordsForPronunciation = async () => {
    if (!selectedListId) {
      setShowListDialog(true);
      return;
    }
    
    try {
      const words = await apiService.getWordsByListId(selectedListId);
      setWords(words);
      
      // Set first word as current if available
      if (words.length > 0) {
        setCurrentWord(words[0]);
      }
    } catch (error) {
      console.error('Error loading words:', error);
      Alert.alert('Hata', 'Kelimeler yüklenirken bir hata oluştu.');
    }
  };
  
  // Start listening for voice commands
  const startListening = async () => {
    try {
      setIsListening(true);
      setRecognizedText(null);
      
      await voiceCommandSystem.current.startListening();
      
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      Alert.alert('Hata', 'Ses tanıma başlatılırken bir hata oluştu.');
    }
  };
  
  // Stop listening for voice commands
  const stopListening = async () => {
    try {
      const text = await voiceCommandSystem.current.stopListening();
      setRecognizedText(text);
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      setIsListening(false);
    }
  };
  
  // Select list
  const selectList = (listId: string) => {
    setSelectedListId(listId);
    setShowListDialog(false);
    
    // If in pronunciation mode, load words for the selected list
    if (showPronunciationMode) {
      loadWordsForPronunciation();
    }
  };
  
  // Speak current word
  const speakCurrentWord = () => {
    if (currentWord) {
      pronunciationEvaluator.current.speakWord(currentWord.value);
    }
  };
  
  // Record pronunciation
  const recordPronunciation = async () => {
    if (!currentWord) return;
    
    try {
      setIsRecordingPronunciation(true);
      setPronunciationScore(null);
      setPronunciationFeedback(null);
      
      // Start recording with countdown
      Alert.alert('Hazır', 'Kayıt 3 saniye sonra başlayacak...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Record pronunciation
      const audioUri = await pronunciationEvaluator.current.recordPronunciation();
      setIsRecordingPronunciation(false);
      
      if (audioUri) {
        evaluatePronunciation(audioUri);
      }
    } catch (error) {
      console.error('Error recording pronunciation:', error);
      setIsRecordingPronunciation(false);
      Alert.alert('Hata', 'Telaffuz kaydedilirken bir hata oluştu.');
    }
  };
  
  // Evaluate pronunciation
  const evaluatePronunciation = async (audioUri: string) => {
    if (!currentWord) return;
    
    try {
      setIsEvaluating(true);
      
      // Evaluate pronunciation
      const result = await pronunciationEvaluator.current.evaluatePronunciation(
        currentWord.value,
        audioUri
      );
      
      // Set results
      setPronunciationScore(result.score);
      setPronunciationFeedback(result.feedback);
      setIsEvaluating(false);
      
      // Speak feedback
      speakText(result.feedback);
    } catch (error) {
      console.error('Error evaluating pronunciation:', error);
      setIsEvaluating(false);
      Alert.alert('Hata', 'Telaffuz değerlendirilirken bir hata oluştu.');
    }
  };
  
  // Go to next word
  const goToNextWord = () => {
    if (!currentWord || words.length === 0) return;
    
    const currentIndex = words.findIndex(w => w.id === currentWord.id);
    const nextIndex = (currentIndex + 1) % words.length;
    
    setCurrentWord(words[nextIndex]);
    setPronunciationScore(null);
    setPronunciationFeedback(null);
  };
  
  // Go to previous word
  const goToPreviousWord = () => {
    if (!currentWord || words.length === 0) return;
    
    const currentIndex = words.findIndex(w => w.id === currentWord.id);
    const prevIndex = (currentIndex - 1 + words.length) % words.length;
    
    setCurrentWord(words[prevIndex]);
    setPronunciationScore(null);
    setPronunciationFeedback(null);
  };
  
  // Render voice command mode
  const renderVoiceCommandMode = () => (
    <View style={styles.modeContainer}>
      <Card style={styles.commandCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Sesli Komut Modu</Text>
          <Text style={styles.cardDescription}>
            Aşağıdaki butona basarak sesli komut verebilirsiniz. Komut tanındığında otomatik olarak çalıştırılacaktır.
          </Text>
          
          <View style={styles.microphoneContainer}>
            <TouchableOpacity
              style={[styles.microphoneButton, isListening && styles.listeningButton]}
              onPress={isListening ? stopListening : startListening}
              disabled={isListening && !voiceCommandSystem.current.isCurrentlyListening()}
            >
              <MaterialCommunityIcons
                name={isListening ? 'microphone' : 'microphone-outline'}
                size={64}
                color={isListening ? '#FFFFFF' : '#4CAF50'}
              />
            </TouchableOpacity>
            <Text style={styles.microphoneText}>
              {isListening ? 'Dinleniyor...' : 'Komut Vermek İçin Tıklayın'}
            </Text>
          </View>
          
          {recognizedText && (
            <View style={styles.recognizedTextContainer}>
              <Text style={styles.recognizedTextLabel}>Tanınan Komut:</Text>
              <Text style={styles.recognizedText}>{recognizedText}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.commandsListCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Kullanılabilir Komutlar</Text>
          <ScrollView style={styles.commandsList}>
            {availableCommands.map((command, index) => (
              <View key={index} style={styles.commandItem}>
                <MaterialCommunityIcons name="microphone" size={20} color="#4CAF50" />
                <Text style={styles.commandText}>{command}</Text>
              </View>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
      
      <Button
        mode="contained"
        onPress={() => setShowPronunciationMode(true)}
        style={styles.switchModeButton}
        icon="volume-high"
      >
        Telaffuz Moduna Geç
      </Button>
    </View>
  );
  
  // Render pronunciation mode
  const renderPronunciationMode = () => (
    <View style={styles.modeContainer}>
      {currentWord ? (
        <Card style={styles.pronunciationCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Telaffuz Pratiği</Text>
            
            <View style={styles.wordContainer}>
              <IconButton
                icon="chevron-left"
                size={24}
                onPress={goToPreviousWord}
                style={styles.navigationButton}
              />
              
              <View style={styles.currentWordContainer}>
                <Text style={styles.currentWord}>{currentWord.value}</Text>
                <Text style={styles.currentWordMeaning}>{currentWord.meaning}</Text>
                {currentWord.context && (
                  <Text style={styles.currentWordContext}>"{currentWord.context}"</Text>
                )}
              </View>
              
              <IconButton
                icon="chevron-right"
                size={24}
                onPress={goToNextWord}
                style={styles.navigationButton}
              />
            </View>
            
            <View style={styles.pronunciationActions}>
              <Button
                mode="contained"
                onPress={speakCurrentWord}
                style={styles.listenButton}
                icon="volume-high"
              >
                Dinle
              </Button>
              
              <Button
                mode="contained"
                onPress={recordPronunciation}
                style={styles.recordButton}
                icon="microphone"
                loading={isRecordingPronunciation}
                disabled={isRecordingPronunciation || isEvaluating}
              >
                {isRecordingPronunciation ? 'Kaydediliyor...' : 'Telaffuz Et'}
              </Button>
            </View>
            
            {isEvaluating && (
              <View style={styles.evaluatingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.evaluatingText}>Telaffuz değerlendiriliyor...</Text>
              </View>
            )}
            
            {pronunciationScore !== null && pronunciationFeedback && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Telaffuz Puanı</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{pronunciationScore}</Text>
                  <Text style={styles.scoreMax}>/100</Text>
                </View>
                <ProgressBar
                  progress={pronunciationScore / 100}
                  color={
                    pronunciationScore >= 90 ? '#4CAF50' :
                    pronunciationScore >= 70 ? '#FFC107' :
                    '#F44336'
                  }
                  style={styles.scoreBar}
                />
                <Text style={styles.feedbackText}>{pronunciationFeedback}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <MaterialCommunityIcons name="playlist-remove" size={64} color="#64748B" />
            <Text style={styles.emptyText}>
              {selectedListId
                ? 'Bu listede kelime bulunmuyor.'
                : 'Lütfen bir liste seçin.'}
            </Text>
            {selectedListId ? (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('AddWord', { listId: selectedListId })}
                style={styles.emptyButton}
                icon="plus"
              >
                Kelime Ekle
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => setShowListDialog(true)}
                style={styles.emptyButton}
                icon="playlist-edit"
              >
                Liste Seç
              </Button>
            )}
          </Card.Content>
        </Card>
      )}
      
      <Button
        mode="contained"
        onPress={() => {
          setShowPronunciationMode(false);
          setPronunciationScore(null);
          setPronunciationFeedback(null);
        }}
        style={styles.switchModeButton}
        icon="microphone"
      >
        Sesli Komut Moduna Geç
      </Button>
    </View>
  );
  
  // Render list selection dialog
  const renderListDialog = () => (
    <Portal>
      <Dialog visible={showListDialog} onDismiss={() => setShowListDialog(false)}>
        <Dialog.Title>Liste Seçin</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.listDialogContent}>
            {userLists.length === 0 ? (
              <View style={styles.emptyListsContainer}>
                <MaterialCommunityIcons name="playlist-remove" size={48} color="#64748B" />
                <Text style={styles.emptyListsText}>Henüz liste oluşturmadınız.</Text>
              </View>
            ) : (
              userLists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listItem,
                    selectedListId === list.id && styles.selectedListItem
                  ]}
                  onPress={() => selectList(list.id)}
                >
                  <MaterialCommunityIcons
                    name="playlist-edit"
                    size={24}
                    color={selectedListId === list.id ? '#4CAF50' : '#94A3B8'}
                    style={styles.listItemIcon}
                  />
                  <Text style={styles.listItemText}>{list.name}</Text>
                  {selectedListId === list.id && (
                    <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))
            )}
            
            <TouchableOpacity
              style={styles.createListButton}
              onPress={() => {
                setShowListDialog(false);
                navigation.navigate('CreateList');
              }}
            >
              <MaterialCommunityIcons
                name="playlist-plus"
                size={24}
                color="#4CAF50"
                style={styles.listItemIcon}
              />
              <Text style={styles.createListText}>Yeni Liste Oluştur</Text>
            </TouchableOpacity>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowListDialog(false)}>İptal</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {showPronunciationMode ? 'Telaffuz Pratiği' : 'Sesli Komutlar'}
        </Text>
        <TouchableOpacity
          style={styles.listSelectorButton}
          onPress={() => setShowListDialog(true)}
        >
          <MaterialCommunityIcons name="playlist-edit" size={24} color="#FFFFFF" />
          <Text style={styles.listSelectorText}>
            {selectedListId
              ? userLists.find(l => l.id === selectedListId)?.name || 'Liste Seç'
              : 'Liste Seç'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showPronunciationMode ? renderPronunciationMode() : renderVoiceCommandMode()}
      
      {renderListDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B', // slate.800
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate.700
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155', // slate.700
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  listSelectorText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 14,
  },
  modeContainer: {
    flex: 1,
    padding: 16,
  },
  commandCard: {
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  commandsListCard: {
    flex: 1,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 16,
  },
  microphoneContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  microphoneButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Green with opacity
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50', // Green
  },
  listeningButton: {
    backgroundColor: '#4CAF50', // Green
  },
  microphoneText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  recognizedTextContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#334155', // slate.700
    borderRadius: 8,
  },
  recognizedTextLabel: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 4,
  },
  recognizedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  commandsList: {
    maxHeight: 200,
  },
  commandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate.700
  },
  commandText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  switchModeButton: {
    backgroundColor: '#4CAF50', // Green
  },
  pronunciationCard: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  navigationButton: {
    backgroundColor: '#334155', // slate.700
  },
  currentWordContainer: {
    flex: 1,
    alignItems: 'center',
  },
  currentWord: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  currentWordMeaning: {
    fontSize: 18,
    color: '#94A3B8', // slate.400
    marginBottom: 8,
  },
  currentWordContext: {
    fontSize: 14,
    color: '#64748B', // slate.500
    fontStyle: 'italic',
    textAlign: 'center',
  },
  pronunciationActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  listenButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#2196F3', // Blue
  },
  recordButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#4CAF50', // Green
  },
  evaluatingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  evaluatingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  resultContainer: {
    padding: 16,
    backgroundColor: '#334155', // slate.700
    borderRadius: 8,
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 18,
    color: '#94A3B8', // slate.400
    marginLeft: 4,
  },
  scoreBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyCard: {
    flex: 1,
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  emptyCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50', // Green
  },
  listDialogContent: {
    maxHeight: 300,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate.700
  },
  selectedListItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Green with opacity
  },
  listItemIcon: {
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  createListText: {
    fontSize: 16,
    color: '#4CAF50', // Green
    fontWeight: 'bold',
  },
  emptyListsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyListsText: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginTop: 16,
  },
});

export default VoiceCommandsScreen;
