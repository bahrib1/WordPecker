import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Text, Card, Button, ProgressBar, ActivityIndicator, IconButton, Dialog, Portal, TextInput } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Word, Exercise, Test } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TestModeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Test'>;
type TestModeScreenRouteProp = RouteProp<RootStackParamList, 'Test'>;

// Exercise types
type ExerciseType = 'multiple_choice' | 'fill_blank' | 'match' | 'write';

// Session state
type SessionState = 'loading' | 'intro' | 'exercise' | 'feedback' | 'summary';

const TestModeScreen = () => {
  const navigation = useNavigation<TestModeScreenNavigationProp>();
  const route = useRoute<TestModeScreenRouteProp>();
  const { listId } = route.params;
  
  // List info
  const [listName, setListName] = useState('');
  const [words, setWords] = useState<Word[]>([]);
  
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('loading');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: number; total: number; }>();
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  
  // Timer
  const [testDuration, setTestDuration] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

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

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleTimeUp();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  // Handle time up
  const handleTimeUp = () => {
    setTimerActive(false);
    
    // Calculate results
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
  };

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
    
    // Take first 15 words or all if less than 15
    const selectedWords = shuffledWords.slice(0, 15);
    
    // Generate exercises with different types
    return selectedWords.map((word, index) => {
      // Determine exercise type based on index
      let type: ExerciseType;
      if (index % 3 === 0) {
        type = 'multiple_choice';
      } else if (index % 3 === 1) {
        type = 'write';
      } else {
        type = 'fill_blank';
      }
      
      // Get random wrong options for multiple choice
      const wrongOptions = words
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning);
      
      // All options including correct one for multiple choice
      const options = type === 'multiple_choice' 
        ? [...wrongOptions, word.meaning].sort(() => Math.random() - 0.5)
        : undefined;
      
      // Create context for fill in the blank
      let question = word.value;
      if (type === 'fill_blank' && word.context) {
        // Replace the word with blank in context
        const regex = new RegExp(`\\b${word.value}\\b`, 'i');
        question = word.context.replace(regex, '_____');
      } else if (type === 'write') {
        question = word.meaning; // For write, we show meaning and ask for the word
      }
      
      return {
        id: `exercise-${index}`,
        type,
        question,
        options,
        correctAnswer: type === 'write' ? word.value : word.meaning
      };
    });
  };

  // Start test session
  const startSession = () => {
    setSessionState('exercise');
    setCurrentExerciseIndex(0);
    setScore(0);
    setTimeLeft(testDuration);
    setTimerActive(true);
    
    // Initialize session results
    setSessionResults(new Array(exercises.length).fill(null));
  };

  // Handle answer selection for multiple choice
  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(answer);
    
    const currentExercise = exercises[currentExerciseIndex];
    const correct = answer === currentExercise.correctAnswer;
    
    setIsCorrect(correct);
    
    if (correct) {
      // More points for harder exercises
      let pointsEarned = 10;
      if (currentExercise.type === 'write') {
        pointsEarned = 15;
      } else if (currentExercise.type === 'fill_blank') {
        pointsEarned = 12;
      }
      
      setScore(score + pointsEarned);
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

  // Handle written answer submission
  const handleSubmitWrittenAnswer = () => {
    if (!writtenAnswer.trim()) return;
    
    const currentExercise = exercises[currentExerciseIndex];
    
    // Case insensitive comparison
    const correct = writtenAnswer.trim().toLowerCase() === currentExercise.correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 15); // More points for written answers
    }
    
    // Show feedback
    setSessionState('feedback');
    
    // Update selected answer for display
    setSelectedAnswer(writtenAnswer);
    
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
      setWrittenAnswer('');
      setIsCorrect(null);
      setSessionState('exercise');
    } else {
      // End of session
      setTimerActive(false);
      
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
      await apiService.saveTestResult(listId, {
        correct,
        total,
        score,
        timeSpent: testDuration - timeLeft
      });
      
      console.log('Test results saved:', { correct, total, score, timeSpent: testDuration - timeLeft });
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
    setWrittenAnswer('');
    setIsCorrect(null);
    setScore(0);
    
    // Start new session
    setSessionState('intro');
  };

  // Handle quit
  const handleQuit = () => {
    setShowQuitDialog(true);
  };

  // Confirm quit
  const confirmQuit = () => {
    setTimerActive(false);
    setShowQuitDialog(false);
    navigation.goBack();
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
        <Text style={styles.loadingText}>Test modu hazırlanıyor...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Geri Dön
        </Button>
      </View>
    );
  }

  // Render intro screen
  const renderIntro = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Test Modu</Text>
        <Text style={styles.subtitle}>{listName}</Text>
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>Test Hakkında</Text>
          <Text style={styles.infoText}>
            Bu test modunda {exercises.length} soru üzerinde çalışacaksınız.
            Çoktan seçmeli, boşluk doldurma ve yazma soruları içerir.
            Süre sınırı {formatTime(testDuration)}'dir.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clipboard-check" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{exercises.length}</Text>
              <Text style={styles.statLabel}>Soru</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="timer" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{formatTime(testDuration)}</Text>
              <Text style={styles.statLabel}>Süre</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="trophy" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Hedef</Text>
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
        Testi Başlat
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
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>
              {currentExerciseIndex + 1} / {exercises.length}
            </Text>
            <Text style={styles.timerText}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <View style={styles.exerciseContainer}>
          <View style={styles.exerciseTypeContainer}>
            <Text style={styles.exerciseTypeText}>
              {currentExercise.type === 'multiple_choice' ? 'Çoktan Seçmeli' : 
               currentExercise.type === 'fill_blank' ? 'Boşluk Doldurma' : 'Yazma'}
            </Text>
          </View>
          
          <Text style={styles.questionText}>{currentExercise.question}</Text>

          {currentExercise.type === 'multiple_choice' && (
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
          )}

          {currentExercise.type === 'fill_blank' && (
            <View style={styles.fillBlankContainer}>
              <TextInput
                value={writtenAnswer}
                onChangeText={setWrittenAnswer}
                style={styles.fillBlankInput}
                placeholder="Cevabınızı yazın..."
                onSubmitEditing={handleSubmitWrittenAnswer}
              />
              <Button
                mode="contained"
                onPress={handleSubmitWrittenAnswer}
                style={styles.submitButton}
                disabled={!writtenAnswer.trim()}
              >
                Gönder
              </Button>
            </View>
          )}

          {currentExercise.type === 'write' && (
            <View style={styles.writeContainer}>
              <TextInput
                value={writtenAnswer}
                onChangeText={setWrittenAnswer}
                style={styles.writeInput}
                placeholder="Kelimeyi yazın..."
                onSubmitEditing={handleSubmitWrittenAnswer}
              />
              <Button
                mode="contained"
                onPress={handleSubmitWrittenAnswer}
                style={styles.submitButton}
                disabled={!writtenAnswer.trim()}
              >
                Gönder
              </Button>
            </View>
          )}
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
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>
              {currentExerciseIndex + 1} / {exercises.length}
            </Text>
            <Text style={styles.timerText}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        <View style={styles.exerciseContainer}>
          <View style={styles.exerciseTypeContainer}>
            <Text style={styles.exerciseTypeText}>
              {currentExercise.type === 'multiple_choice' ? 'Çoktan Seçmeli' : 
               currentExercise.type === 'fill_blank' ? 'Boşluk Doldurma' : 'Yazma'}
            </Text>
          </View>
          
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
            
            <View style={styles.answerContainer}>
              <Text style={styles.yourAnswerLabel}>Cevabınız:</Text>
              <Text style={styles.yourAnswerText}>{selectedAnswer}</Text>
              
              {!isCorrect && (
                <>
                  <Text style={styles.correctAnswerLabel}>Doğru Cevap:</Text>
                  <Text style={styles.correctAnswerText}>{currentExercise.correctAnswer}</Text>
                </>
              )}
            </View>
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
        <Text style={styles.title}>Test Tamamlandı!</Text>
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
          
          <View style={styles.timeSpentContainer}>
            <MaterialCommunityIcons name="timer" size={20} color="#94A3B8" />
            <Text style={styles.timeSpentText}>
              Harcanan Süre: {formatTime(testDuration - timeLeft)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.shareContainer}>
        <Button
          mode="outlined"
          onPress={() => {/* Share functionality would go here */}}
          style={styles.shareButton}
          icon="share-variant"
        >
          Sonuçları Paylaş
        </Button>
      </View>

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
          onPress={() => navigation.goBack()}
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
            <Text>Testten çıkarsanız ilerlemeniz kaydedilmeyecek.</Text>
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
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressText: {
    color: '#94A3B8', // slate.400
    fontSize: 12,
  },
  timerText: {
    color: '#FF9800', // Orange
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseContainer: {
    padding: 16,
    flex: 1,
  },
  exerciseTypeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#334155', // slate.700
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  exerciseTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  questionText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 24,
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
  fillBlankContainer: {
    marginTop: 16,
  },
  fillBlankInput: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
    color: '#FFFFFF',
  },
  writeContainer: {
    marginTop: 16,
  },
  writeInput: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#4CAF50', // Green
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
    marginBottom: 16,
  },
  correctFeedbackText: {
    color: '#4CAF50', // Green
  },
  incorrectFeedbackText: {
    color: '#EF4444', // Red
  },
  answerContainer: {
    width: '100%',
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
  },
  yourAnswerLabel: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 4,
  },
  yourAnswerText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  correctAnswerLabel: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#4CAF50', // Green
    fontWeight: 'bold',
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
    marginBottom: 16,
  },
  summaryProgressBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#334155', // slate.700
  },
  timeSpentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSpentText: {
    color: '#94A3B8', // slate.400
    marginLeft: 8,
  },
  shareContainer: {
    marginBottom: 24,
  },
  shareButton: {
    borderColor: '#2196F3', // Blue
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

export default TestModeScreen;
