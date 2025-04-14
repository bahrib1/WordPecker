import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText, Chip, Card, Title, Paragraph, ActivityIndicator, FAB, IconButton, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Word } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type AddWordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddWord'>;
type AddWordScreenRouteProp = RouteProp<RootStackParamList, 'AddWord'>;

const AddWordScreen = () => {
  const navigation = useNavigation<AddWordScreenNavigationProp>();
  const route = useRoute<AddWordScreenRouteProp>();
  const { listId } = route.params;
  
  // State for single word form
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [context, setContext] = useState('');
  const [wordError, setWordError] = useState('');
  const [meaningError, setMeaningError] = useState('');
  
  // State for bulk add
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkError, setBulkError] = useState('');
  
  // State for word suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // State for added words
  const [addedWords, setAddedWords] = useState<Word[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // List info
  const [listName, setListName] = useState('');

  // Fetch list info
  useEffect(() => {
    const fetchListInfo = async () => {
      try {
        setListLoading(true);
        const list = await apiService.getListById(listId);
        setListName(list.name);
        
        // Also fetch words already in the list
        const words = await apiService.getWordsByListId(listId);
        setAddedWords(words);
        
        setListLoading(false);
      } catch (error) {
        console.error('Error fetching list info:', error);
        setError('Liste bilgileri yüklenirken bir hata oluştu.');
        setListLoading(false);
      }
    };
    
    fetchListInfo();
  }, [listId]);

  // Validate form fields
  const validateWord = (word: string) => {
    if (!word) {
      setWordError('Kelime gereklidir');
      return false;
    }
    setWordError('');
    return true;
  };

  const validateMeaning = (meaning: string) => {
    if (!meaning) {
      setMeaningError('Anlam gereklidir');
      return false;
    }
    setMeaningError('');
    return true;
  };

  const validateBulkText = (text: string) => {
    if (!text) {
      setBulkError('Kelimeler gereklidir');
      return false;
    }
    
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      setBulkError('En az bir kelime eklemelisiniz');
      return false;
    }
    
    for (const line of lines) {
      if (!line.includes(':')) {
        setBulkError('Her satır "kelime: anlam" formatında olmalıdır');
        return false;
      }
    }
    
    setBulkError('');
    return true;
  };

  // Handle word input change with suggestions
  const handleWordChange = (text: string) => {
    setWord(text);
    
    // Show suggestions if text is at least 2 characters
    if (text.length >= 2) {
      // In a real app, this would call an API for suggestions
      const mockSuggestions = [
        `${text}able`,
        `${text}ful`,
        `${text}ness`,
        `${text}ing`,
        `${text}er`
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setWord(suggestion);
    setShowSuggestions(false);
  };

  // Handle auto-translate
  const handleAutoTranslate = async () => {
    if (!word) {
      setWordError('Çeviri için kelime giriniz');
      return;
    }
    
    try {
      setTranslating(true);
      
      // In a real app, this would call a translation API
      // const translation = await apiService.translateWord(word, 'en', 'tr');
      
      // For demo, simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock translation based on the word
      const mockTranslation = `${word} anlamı`;
      
      setMeaning(mockTranslation);
      setTranslating(false);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslating(false);
      Alert.alert('Çeviri Hatası', 'Kelime çevirilirken bir hata oluştu.');
    }
  };

  // Handle add single word
  const handleAddWord = async () => {
    const isWordValid = validateWord(word);
    const isMeaningValid = validateMeaning(meaning);

    if (isWordValid && isMeaningValid) {
      try {
        setLoading(true);
        setError(null);
        
        const newWord = await apiService.addWord({
          listId,
          value: word,
          meaning,
          context: context || undefined
        });
        
        // Add to local state
        setAddedWords([newWord, ...addedWords]);
        
        // Reset form
        setWord('');
        setMeaning('');
        setContext('');
        
        setLoading(false);
      } catch (error) {
        console.error('Add word error:', error);
        setError('Kelime eklenirken bir hata oluştu.');
        setLoading(false);
      }
    }
  };

  // Handle add bulk words
  const handleAddBulkWords = async () => {
    const isBulkTextValid = validateBulkText(bulkText);

    if (isBulkTextValid) {
      try {
        setLoading(true);
        setError(null);
        
        const lines = bulkText.split('\n').filter(line => line.trim());
        const wordPromises = lines.map(line => {
          const [value, meaning] = line.split(':').map(part => part.trim());
          return apiService.addWord({
            listId,
            value,
            meaning,
            context: undefined
          });
        });
        
        const newWords = await Promise.all(wordPromises);
        
        // Add to local state
        setAddedWords([...newWords, ...addedWords]);
        
        // Reset form
        setBulkText('');
        setBulkMode(false);
        
        setLoading(false);
      } catch (error) {
        console.error('Add bulk words error:', error);
        setError('Kelimeler eklenirken bir hata oluştu.');
        setLoading(false);
      }
    }
  };

  // Handle delete word
  const handleDeleteWord = async (wordId: string) => {
    try {
      await apiService.deleteWord(wordId);
      
      // Update local state
      setAddedWords(addedWords.filter(w => w.id !== wordId));
    } catch (error) {
      console.error('Delete word error:', error);
      Alert.alert('Silme Hatası', 'Kelime silinirken bir hata oluştu.');
    }
  };

  // Handle finish
  const handleFinish = () => {
    navigation.navigate('Lists');
  };

  // Render single word form
  const renderSingleWordForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          label="Kelime"
          value={word}
          onChangeText={handleWordChange}
          onBlur={() => validateWord(word)}
          style={styles.input}
          error={!!wordError}
          left={<TextInput.Icon icon="alphabetical" />}
        />
        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {!!wordError && <HelperText type="error">{wordError}</HelperText>}
      </View>

      <View style={styles.meaningContainer}>
        <TextInput
          label="Anlam"
          value={meaning}
          onChangeText={setMeaning}
          onBlur={() => validateMeaning(meaning)}
          style={styles.input}
          multiline
          numberOfLines={2}
          error={!!meaningError}
          left={<TextInput.Icon icon="translate" />}
          right={
            <TextInput.Icon
              icon="autorenew"
              disabled={translating || !word}
              onPress={handleAutoTranslate}
            />
          }
        />
        {translating && (
          <ActivityIndicator
            size="small"
            color="#4CAF50"
            style={styles.translatingIndicator}
          />
        )}
        {!!meaningError && <HelperText type="error">{meaningError}</HelperText>}
      </View>

      <TextInput
        label="Bağlam Örneği (İsteğe Bağlı)"
        value={context}
        onChangeText={setContext}
        style={styles.input}
        multiline
        numberOfLines={3}
        placeholder="Kelimeyi içeren bir cümle örneği"
        left={<TextInput.Icon icon="text-box" />}
      />

      <Button
        mode="contained"
        onPress={handleAddWord}
        style={styles.addButton}
        loading={loading}
        disabled={loading}
        icon="plus"
      >
        Kelime Ekle
      </Button>
    </View>
  );

  // Render bulk add form
  const renderBulkAddForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.bulkInstructions}>
        Her satıra bir kelime ekleyin. Format: "kelime: anlam"
      </Text>
      <TextInput
        label="Kelimeler"
        value={bulkText}
        onChangeText={setBulkText}
        onBlur={() => validateBulkText(bulkText)}
        style={styles.bulkInput}
        multiline
        numberOfLines={10}
        error={!!bulkError}
        placeholder="apple: elma
banana: muz
car: araba"
      />
      {!!bulkError && <HelperText type="error">{bulkError}</HelperText>}

      <Button
        mode="contained"
        onPress={handleAddBulkWords}
        style={styles.addButton}
        loading={loading}
        disabled={loading}
        icon="playlist-plus"
      >
        Toplu Ekle
      </Button>
    </View>
  );

  // Render added words
  const renderAddedWords = () => (
    <View style={styles.addedWordsContainer}>
      <View style={styles.addedWordsHeader}>
        <Text style={styles.addedWordsTitle}>Eklenen Kelimeler</Text>
        <Text style={styles.addedWordsCount}>{addedWords.length} kelime</Text>
      </View>

      {addedWords.length === 0 ? (
        <Text style={styles.noWordsText}>Henüz kelime eklenmedi.</Text>
      ) : (
        addedWords.map((word, index) => (
          <View key={word.id}>
            <View style={styles.wordItem}>
              <View style={styles.wordInfo}>
                <Text style={styles.wordText}>{word.value}</Text>
                <Text style={styles.meaningText}>{word.meaning}</Text>
                {word.context && (
                  <Text style={styles.contextText}>"{word.context}"</Text>
                )}
              </View>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteWord(word.id)}
                style={styles.deleteButton}
              />
            </View>
            {index < addedWords.length - 1 && <Divider style={styles.divider} />}
          </View>
        ))
      )}
    </View>
  );

  if (listLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Liste yükleniyor...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Kelime Ekle</Text>
          <Text style={styles.subtitle}>
            "{listName}" listesine kelime ekleyin
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.modeToggleContainer}>
          <Chip
            selected={!bulkMode}
            onPress={() => setBulkMode(false)}
            style={[styles.modeChip, !bulkMode && styles.selectedModeChip]}
            textStyle={!bulkMode ? styles.selectedModeText : styles.modeText}
          >
            Tek Kelime
          </Chip>
          <Chip
            selected={bulkMode}
            onPress={() => setBulkMode(true)}
            style={[styles.modeChip, bulkMode && styles.selectedModeChip]}
            textStyle={bulkMode ? styles.selectedModeText : styles.modeText}
          >
            Toplu Ekleme
          </Chip>
        </View>

        {bulkMode ? renderBulkAddForm() : renderSingleWordForm()}

        {renderAddedWords()}

        <Button
          mode="outlined"
          onPress={handleFinish}
          style={styles.finishButton}
          icon="check"
        >
          Tamamla
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  scrollContent: {
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
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modeChip: {
    marginHorizontal: 8,
    backgroundColor: '#1E293B', // slate.800
  },
  selectedModeChip: {
    backgroundColor: '#4CAF50', // Green
  },
  modeText: {
    color: '#FFFFFF',
  },
  selectedModeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  meaningContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1E293B', // slate.800
  },
  suggestionsContainer: {
    backgroundColor: '#1E293B', // slate.800
    borderWidth: 1,
    borderColor: '#334155', // slate.700
    borderRadius: 4,
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate.700
  },
  suggestionText: {
    color: '#FFFFFF',
  },
  translatingIndicator: {
    position: 'absolute',
    right: 48,
    top: 20,
  },
  bulkInstructions: {
    color: '#94A3B8', // slate.400
    marginBottom: 12,
  },
  bulkInput: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    height: 200,
  },
  addButton: {
    backgroundColor: '#4CAF50', // Green
    marginTop: 8,
  },
  addedWordsContainer: {
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
  },
  addedWordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addedWordsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addedWordsCount: {
    color: '#94A3B8', // slate.400
  },
  noWordsText: {
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginVertical: 16,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  meaningText: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 4,
  },
  contextText: {
    fontSize: 12,
    color: '#64748B', // slate.500
    fontStyle: 'italic',
  },
  deleteButton: {
    margin: 0,
  },
  divider: {
    backgroundColor: '#334155', // slate.700
  },
  finishButton: {
    marginBottom: 24,
    borderColor: '#4CAF50', // Green
  },
  errorContainer: {
    backgroundColor: '#FEE2E2', // red.100
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626', // red.600
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
});

export default AddWordScreen;
