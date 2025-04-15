import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Text, Card, Button, ProgressBar, ActivityIndicator, IconButton, Dialog, Portal } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Word, Exercise } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type LearningModeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Learning'>;
type LearningModeScreenRouteProp = RouteProp<RootStackParamList, 'Learning'>;

// Exercise types
type ExerciseType = 'multiple_choice' | 'fill_blank' | 'match' | 'write';

// Session state
type SessionState = 'loading' | 'intro' | 'exercise' | 'feedback' | 'summary';

const LearningModeScreen = () => {
  const navigation = useNavigation<LearningModeScreenNavigationProp>();
  const route = useRoute<LearningModeScreenRouteProp>();
  const { listId } = route.params;
  
  // List info
  const [listName, setListName] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: number; total: number; }>();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  // Fetch list info and words
  useEffect(() => {
    const fetchListData = async () => {
      try {
        setLoading(true);
        
        // Fetch list info
        const list = await apiService.getListById(listId);
        setListName(list.name);
        
        // Fetch words
        const wordsData = await apiService.getWordsByListId(listId);
        setWords(wordsData);
        
        // Generate exercises
        if (wordsData.length > 0) {
          const generatedExercises = generateExercises(wordsData);
          setExercises(generatedExercises);
        }
        
        setLoading(false);
        setSessionState('intro');
      } catch (error) {
        console.error('Error fetching list data:', error);
        setError('Veri yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };
    
    fetchListData();
  }, [listId]);

  // Generate exercises from words
  const generateExercises = (words: Word[]): Exercise[] => {
    // Ensure we have enough words
    if (words.length < 4) {
      // For demo, duplicate words if we don't have enough
      while (words.length < 4) {
        words = [...words, ...words];
      }
    }
    
    // Shuffle words
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    // Take first 10 words or all if less than 10
    const selectedWords = shuffledWords.slice(0, 10);
    
    // Generate exercises
    return selectedWords.map((word, index) => {
      // Get random wrong options
      const wrongOptions = words
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning);
      
      // All options including correct one
      const options = [...wrongOptions, word.meaning].sort(() => Math.random() - 0.5);
      
      return {
        id: `exercise-${index}`,
        type: 'multiple_choice',
        question: word.value,
        options,
        correctAnswer: word.meaning
      };
    });
  };

  // Start learning session
  const startSession = () => {
    setSessionState('exercise');
    setCurrentExerciseIndex(0);
    setScore(0);
    setStreak(0);
  };

  // Handle answer selection
  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(answer);
    
    const currentExercise = exercises[currentExerciseIndex];
    const correct = answer === currentExercise.correctAnswer;
    
    setIsCorrect(correct);
    
    if (correct) {
      setStreak(streak + 1);
      setScore(score + (10 * (1 + Math.min(streak, 5) * 0.1))); // Bonus for streaks
    } else {
      setStreak(0);
    }
    
    // Show feedback
    setSessionState('feedback');
    
    // Animate feedback
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
    
    // Auto-advance after delay
    setTimeout(() => {
      handleNextExercise();
    }, 2000);
  };

  // Handle next exercise
  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setSessionState('exercise');
    } else {
      // End of session
      const correctCount = exercises.filter((_, index) => {
        const result = sessionResults[index];
        return result && result.isCorrect;
      }).length;
      
      setResults({
        correct: correctCount,
        total: exercises.length
      });
      
      setSessionState('summary');
      
      // Save progress
      saveProgress(correctCount, exercises.length);
    }
  };

  // Session results tracking
  const [sessionResults, setSessionResults] = useState<Array<{ answer: string; isCorrect: boolean } | null>>(
    new Array(exercises.length).fill(null)
  );

  // Update session results when feedback is shown
  useEffect(() => {
    if (sessionState === 'feedback' && selectedAnswer !== null && isCorrect !== null) {
      const newResults = [...sessionResults];
      newResults[currentExerciseIndex] = {
        answer: selectedAnswer,
        isCorrect: isCorrect
      };
      setSessionResults(newResults);
    }
  }, [sessionState, selectedAnswer, isCorrect]);

  // Save progress to API
  const saveProgress = async (correct: number, total: number) => {
    try {
      // In a real app, this would call an API to save progress
      // await apiService.saveProgress(listId, {
      //   correct,
      //   total,
      //   score
      // });
      
      console.log('Progress saved:', { correct, total, score });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Restart session
  const restartSession = () => {
    // Generate new exercises
    const newExercises = generateExercises(words);
    setExercises(newExercises);
    setSessionResults(new Array(newExercises.length).fill(null));
    
    // Reset state
    setCurrentExerciseIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setStreak(0);
    
    // Start new session
    setSessionState('intro');
  };

  // Handle quit
  const handleQuit = () => {
    setShowQuitDialog(true);
  };

  // Confirm quit
  const confirmQuit = () => {
    setShowQuitDialog(false);
    navigation.navigate('ListDetails', { listId });
  };

  // Cancel quit
  const cancelQuit = () => {
    setShowQuitDialog(false);
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Öğrenme modu hazırlanıyor...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => navigation.navigate('ListDetails', { listId })} style={styles.errorButton}>
          Geri Dön
        </Button>
      </View>
    );
  }

  // Render intro screen
  const renderIntro = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Öğrenme Modu</Text>
        <Text style={styles.subtitle}>{listName}</Text>
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>Hazır mısınız?</Text>
          <Text style={styles.infoText}>
            Bu öğrenme oturumunda {exercises.length} kelime üzerinde çalışacaksınız.
            Her doğru cevap için puan kazanacaksınız. Arka arkaya doğru cevaplar için
            bonus puanlar kazanabilirsiniz.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{words.length}</Text>
              <Text style={styles.statLabel}>Kelime</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="school" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{exercises.length}</Text>
              <Text style={styles.statLabel}>Alıştırma</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="timer" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>~{exercises.length} dk</Text>
              <Text style={styles.statLabel}>Süre</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={startSession}
        style={styles.startButton}
        icon="play"
      >
        Başla
      </Button>
    </ScrollView>
  );

  // Render exercise
  const renderExercise = () => {
    const currentExercise = exercises[currentExerciseIndex];
    
    return (
      <View style={styles.container}>
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={(currentExerciseIndex) / exercises.length}
            color="#4CAF50"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {currentExerciseIndex + 1} / {exercises.length}
          </Text>
        </View>

        <View style={styles.streakContainer}>
          <MaterialCommunityIcons
            name="fire"
            size={24}
            color={streak > 0 ? "#FF9800" : "#64748B"}
          />
          <Text style={[styles.streakText, streak > 0 && styles.activeStreakText]}>
            {streak}
          </Text>
        </View>

        <View style={styles.exerciseContainer}>
          <Text style={styles.questionLabel}>Bu kelimenin anlamı nedir?</Text>
          <Text style={styles.questionText}>{currentExercise.question}</Text>

          <View style={styles.optionsContainer}>
            {currentExercise.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === option && styles.selectedOptionButton
                ]}
                onPress={() => handleSelectAnswer(option)}
                disabled={selectedAnswer !== null}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswer === option && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <Button
            mode="outlined"
            onPress={handleQuit}
            style={styles.quitButton}
            icon="close"
          >
            Çık
          </Button>
        </View>
      </View>
    );
  };

  // Render feedback
  const renderFeedback = () => {
    const currentExercise = exercises[currentExerciseIndex];
    
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={(currentExerciseIndex) / exercises.length}
            color="#4CAF50"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {currentExerciseIndex + 1} / {exercises.length}
          </Text>
        </View>

        <View style={styles.streakContainer}>
          <MaterialCommunityIcons
            name="fire"
            size={24}
            color={streak > 0 ? "#FF9800" : "#64748B"}
          />
          <Text style={[styles.streakText, streak > 0 && styles.activeStreakText]}>
            {streak}
          </Text>
        </View>

        <View style={styles.exerciseContainer}>
          <Text style={styles.questionLabel}>Bu kelimenin anlamı nedir?</Text>
          <Text style={styles.questionText}>{currentExercise.question}</Text>

          <View style={styles.feedbackContainer}>
            <MaterialCommunityIcons
              name={isCorrect ? "check-circle" : "close-circle"}
              size={64}
              color={isCorrect ? "#4CAF50" : "#EF4444"}
              style={styles.feedbackIcon}
            />
            <Text style={[
              styles.feedbackText,
              isCorrect ? styles.correctFeedbackText : styles.incorrectFeedbackText
            ]}>
              {isCorrect ? "Doğru!" : "Yanlış!"}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswerText}>
                Doğru cevap: {currentExercise.correctAnswer}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <Button
            mode="contained"
            onPress={handleNextExercise}
            style={styles.nextButton}
            icon="arrow-right"
          >
            Devam Et
          </Button>
        </View>
      </Animated.View>
    );
  };

  // Render summary
  const renderSummary = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Oturum Tamamlandı!</Text>
        <Text style={styles.subtitle}>{listName}</Text>
      </View>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Toplam Puan</Text>
            <Text style={styles.scoreValue}>{Math.round(score)}</Text>
          </View>

          <View style={styles.resultsContainer}>
            <View style={styles.resultItem}>
              <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
              <Text style={styles.resultValue}>{results?.correct || 0}</Text>
              <Text style={styles.resultLabel}>Doğru</Text>
            </View>
            <View style={styles.resultItem}>
              <MaterialCommunityIcons name="close" size={24} color="#EF4444" />
              <Text style={styles.resultValue}>{(results?.total || 0) - (results?.correct || 0)}</Text>
              <Text style={styles.resultLabel}>Yanlış</Text>
            </View>
            <View style={styles.resultItem}>
              <MaterialCommunityIcons name="percent" size={24} color="#2196F3" />
              <Text style={styles.resultValue}>
                {results ? Math.round((results.correct / results.total) * 100) : 0}%
              </Text>
              <Text style={styles.resultLabel}>Başarı</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <ProgressBar
              progress={results ? results.correct / results.total : 0}
              color="#4CAF50"
              style={styles.summaryProgressBar}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          onPress={restartSession}
          style={styles.restartButton}
          icon="refresh"
        >
          Tekrar Dene
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('ListDetails', { listId })}
          style={styles.finishButton}
          icon="check"
        >
          Tamamla
        </Button>
      </View>
    </ScrollView>
  );

  // Render based on session state
  let content;
  switch (sessionState) {
    case 'intro':
      content = renderIntro();
      break;
    case 'exercise':
      content = renderExercise();
      break;
    case 'feedback':
      content = renderFeedback();
      break;
    case 'summary':
      content = renderSummary();
      break;
    default:
      content = renderIntro();
  }

  return (
    <>
      {content}
      
      <Portal>
        <Dialog visible={showQuitDialog} onDismiss={cancelQuit}>
          <Dialog.Title>Çıkmak istediğinize emin misiniz?</Dialog.Title>
          <Dialog.Content>
            <Text>Oturumdan çıkarsanız ilerlemeniz kaydedilmeyecek.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelQuit}>İptal</Button>
            <Button onPress={confirmQuit}>Çık</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 24,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    color: '#94A3B8', // slate.400
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8', // slate.400
  },
  startButton: {
    backgroundColor: '#4CAF50', // Green
    marginBottom: 24,
  },
  progressContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155', // slate.700
  },
  progressText: {
    color: '#94A3B8', // slate.400
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B', // slate.500
    marginLeft: 4,
  },
  activeStreakText: {
    color: '#FF9800', // Orange
  },
  exerciseContainer: {
    padding: 16,
    flex: 1,
  },
  questionLabel: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 8,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
  },
  selectedOptionButton: {
    borderColor: '#4CAF50', // Green
    borderWidth: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155', // slate.700
  },
  quitButton: {
    borderColor: '#64748B', // slate.500
  },
  nextButton: {
    backgroundColor: '#4CAF50', // Green
  },
  feedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  feedbackIcon: {
    marginBottom: 16,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  correctFeedbackText: {
    color: '#4CAF50', // Green
  },
  incorrectFeedbackText: {
    color: '#EF4444', // Red
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 24,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50', // Green
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 12,
    color: '#94A3B8', // slate.400
  },
  progressBarContainer: {
    marginTop: 8,
  },
  summaryProgressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155', // slate.700
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  restartButton: {
    backgroundColor: '#4CAF50', // Green
    marginBottom: 12,
  },
  finishButton: {
    borderColor: '#64748B', // slate.500
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // slate.900
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // slate.900
    padding: 16,
  },
  errorText: {
    color: '#EF4444', // Red
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#4CAF50', // Green
  },
});

export default LearningModeScreen;
