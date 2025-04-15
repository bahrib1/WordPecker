import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text, Card, Button, ActivityIndicator, IconButton, Chip, Title, Paragraph } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '../../api/apiService';

type FlashcardsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Flashcards'>;
type FlashcardsScreenRouteProp = RouteProp<RootStackParamList, 'Flashcards'>;

const { width } = Dimensions.get('window');

const FlashcardsScreen = () => {
  const navigation = useNavigation<FlashcardsScreenNavigationProp>();
  const route = useRoute<FlashcardsScreenRouteProp>();
  
  // State
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [words, setWords] = useState<Array<{ id: string; value: string; meaning: string; context?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Animation
  const flipAnimation = useState(new Animated.Value(0))[0];
  
  // Load lists on mount
  useEffect(() => {
    loadLists();
  }, []);
  
  // Load words when a list is selected
  useEffect(() => {
    if (selectedListId) {
      loadWords(selectedListId);
    }
  }, [selectedListId]);
  
  // Load lists
  const loadLists = async () => {
    try {
      setLoading(true);
      const listsData = await apiService.getLists();
      setLists(listsData.map(list => ({ id: list.id, name: list.name })));
      
      // Set default list if available
      if (listsData.length > 0) {
        setSelectedListId(listsData[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading lists:', error);
      setLoading(false);
    }
  };
  
  // Load words for a list
  const loadWords = async (listId: string) => {
    try {
      setLoading(true);
      setFlipped(false);
      setCurrentIndex(0);
      setCompleted(false);
      setProgress(0);
      
      const wordsData = await apiService.getWordsByListId(listId);
      setWords(wordsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading words:', error);
      setLoading(false);
    }
  };
  
  // Flip card
  const flipCard = () => {
    if (flipped) {
      Animated.timing(flipAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setFlipped(false));
    } else {
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setFlipped(true));
    }
  };
  
  // Go to next card
  const nextCard = () => {
    if (currentIndex < words.length - 1) {
      // Reset flip state
      setFlipped(false);
      flipAnimation.setValue(0);
      
      // Move to next card
      setCurrentIndex(currentIndex + 1);
      
      // Update progress
      setProgress(((currentIndex + 1) / words.length) * 100);
    } else {
      // Completed all cards
      setCompleted(true);
      setProgress(100);
    }
  };
  
  // Go to previous card
  const prevCard = () => {
    if (currentIndex > 0) {
      // Reset flip state
      setFlipped(false);
      flipAnimation.setValue(0);
      
      // Move to previous card
      setCurrentIndex(currentIndex - 1);
      
      // Update progress
      setProgress((currentIndex / words.length) * 100);
    }
  };
  
  // Restart
  const restart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setCompleted(false);
    setProgress(0);
    flipAnimation.setValue(0);
  };
  
  // Change list
  const changeList = (listId: string) => {
    setSelectedListId(listId);
  };
  
  // Front-to-back and back-to-front interpolations
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  
  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });
  
  // Render list selector
  const renderListSelector = () => (
    <View style={styles.listSelectorContainer}>
      <Text style={styles.sectionTitle}>Kelime Listesi Seçin</Text>
      <View style={styles.listsContainer}>
        {lists.map(list => (
          <Chip
            key={list.id}
            selected={selectedListId === list.id}
            onPress={() => changeList(list.id)}
            style={[
              styles.listChip,
              selectedListId === list.id && styles.selectedListChip
            ]}
            icon="playlist-edit"
          >
            {list.name}
          </Chip>
        ))}
      </View>
    </View>
  );
  
  // Render progress bar
  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
      <Text style={styles.progressText}>
        {currentIndex + 1} / {words.length}
      </Text>
    </View>
  );
  
  // Render card
  const renderCard = () => {
    if (words.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="card-text-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyTitle}>Bu listede kelime bulunmuyor</Text>
          <Text style={styles.emptyText}>
            Bu listeye kelime ekleyin veya başka bir liste seçin.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddWord', { listId: selectedListId || '' })}
            style={styles.emptyButton}
          >
            Kelime Ekle
          </Button>
        </View>
      );
    }
    
    if (completed) {
      return (
        <View style={styles.completedContainer}>
          <MaterialCommunityIcons name="check-circle-outline" size={64} color="#4CAF50" />
          <Text style={styles.completedTitle}>Tebrikler!</Text>
          <Text style={styles.completedText}>
            Bu listedeki tüm kelimeleri gözden geçirdiniz.
          </Text>
          <View style={styles.completedActions}>
            <Button
              mode="contained"
              onPress={restart}
              style={styles.restartButton}
            >
              Tekrar Başlat
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Lists')}
              style={styles.listsButton}
            >
              Listelere Dön
            </Button>
          </View>
        </View>
      );
    }
    
    const currentWord = words[currentIndex];
    
    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.cardTouchable}>
          {/* Front of card (word) */}
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ rotateY: frontInterpolate }],
                opacity: frontOpacity,
              },
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardWord}>{currentWord.value}</Text>
              <Text style={styles.cardInstructions}>Kartı çevirmek için dokunun</Text>
            </View>
          </Animated.View>
          
          {/* Back of card (meaning) */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                transform: [{ rotateY: backInterpolate }],
                opacity: backOpacity,
              },
            ]}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardMeaning}>{currentWord.meaning}</Text>
              {currentWord.context && (
                <Text style={styles.cardContext}>"{currentWord.context}"</Text>
              )}
              <Text style={styles.cardInstructions}>Kartı çevirmek için dokunun</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
        
        {/* Navigation buttons */}
        <View style={styles.navigationButtons}>
          <IconButton
            icon="arrow-left"
            size={30}
            color="#FFFFFF"
            style={[styles.navButton, currentIndex === 0 && styles.disabledNavButton]}
            disabled={currentIndex === 0}
            onPress={prevCard}
          />
          <IconButton
            icon="arrow-right"
            size={30}
            color="#FFFFFF"
            onPress={nextCard}
            style={styles.navButton}
          />
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          color="#FFFFFF"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
        <Text style={styles.headerTitle}>Kelime Kartları</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          {renderListSelector()}
          
          {selectedListId && words.length > 0 && renderProgressBar()}
          
          {renderCard()}
        </View>
      )}
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B', // slate.800
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate.700
  },
  backButton: {
    margin: 0,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8', // slate.400
  },
  listSelectorContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  listsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  listChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#334155', // slate.700
  },
  selectedListChip: {
    backgroundColor: '#4CAF50', // green.500
  },
  progressBarContainer: {
    height: 24,
    backgroundColor: '#334155', // slate.700
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50', // green.500
    borderRadius: 12,
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTouchable: {
    width: width - 64,
    height: 300,
    perspective: 1000,
  },
  card: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardBack: {
    backgroundColor: '#334155', // slate.700
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardMeaning: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardContext: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardInstructions: {
    fontSize: 14,
    color: '#64748B', // slate.500
    textAlign: 'center',
    position: 'absolute',
    bottom: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 64,
    marginTop: 24,
  },
  navButton: {
    backgroundColor: '#334155', // slate.700
    margin: 0,
  },
  disabledNavButton: {
    backgroundColor: '#1E293B', // slate.800
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50', // green.500
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginBottom: 32,
  },
  completedActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  restartButton: {
    backgroundColor: '#4CAF50', // green.500
    marginRight: 12,
  },
  listsButton: {
    borderColor: '#4CAF50', // green.500
    borderWidth: 1,
  },
});

export default FlashcardsScreen;
