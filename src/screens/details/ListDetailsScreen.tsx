import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button, Divider, IconButton, FAB, Dialog, Portal, TextInput, ActivityIndicator, Menu, Chip } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Word, WordList } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ListDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ListDetails'>;
type ListDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ListDetails'>;

const ListDetailsScreen = () => {
  const navigation = useNavigation<ListDetailsScreenNavigationProp>();
  const route = useRoute<ListDetailsScreenRouteProp>();
  const { listId } = route.params;
  
  // List data
  const [list, setList] = useState<WordList | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical'>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Edit list dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContext, setEditContext] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editDialogLoading, setEditDialogLoading] = useState(false);
  
  // Edit word dialog
  const [showEditWordDialog, setShowEditWordDialog] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editWordValue, setEditWordValue] = useState('');
  const [editWordMeaning, setEditWordMeaning] = useState('');
  const [editWordContext, setEditWordContext] = useState('');
  const [editWordDialogLoading, setEditWordDialogLoading] = useState(false);
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteWordDialog, setShowDeleteWordDialog] = useState(false);
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null);

  // Fetch list and words
  useEffect(() => {
    fetchListData();
  }, [listId]);
  
  // Filter words when search query or sort changes
  useEffect(() => {
    if (words.length > 0) {
      filterAndSortWords();
    }
  }, [words, searchQuery, sortBy]);

  // Fetch list data
  const fetchListData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch list details
      const listData = await apiService.getListById(listId);
      setList(listData);
      setEditName(listData.name);
      setEditDescription(listData.description || '');
      setEditContext(listData.context || '');
      setEditSource(listData.source || '');
      
      // Fetch words
      const wordsData = await apiService.getWordsByListId(listId);
      setWords(wordsData);
      setFilteredWords(wordsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching list data:', error);
      setError('Liste bilgileri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Refresh list data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchListData();
      setRefreshing(false);
    } catch (error) {
      console.error('Error refreshing list data:', error);
      setRefreshing(false);
    }
  };

  // Filter and sort words
  const filterAndSortWords = () => {
    // Filter by search query
    let filtered = words;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = words.filter(word => 
        word.value.toLowerCase().includes(query) || 
        word.meaning.toLowerCase().includes(query) ||
        (word.context && word.context.toLowerCase().includes(query))
      );
    }
    
    // Sort words
    if (sortBy === 'alphabetical') {
      filtered = [...filtered].sort((a, b) => a.value.localeCompare(b.value));
    } else {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    setFilteredWords(filtered);
  };

  // Handle edit list
  const handleEditList = async () => {
    if (!editName.trim()) {
      Alert.alert('Hata', 'Liste adı gereklidir.');
      return;
    }
    
    try {
      setEditDialogLoading(true);
      
      const updatedList = await apiService.updateList(listId, {
        name: editName,
        description: editDescription,
        context: editContext,
        source: editSource
      });
      
      setList(updatedList);
      setShowEditDialog(false);
      setEditDialogLoading(false);
    } catch (error) {
      console.error('Error updating list:', error);
      Alert.alert('Hata', 'Liste güncellenirken bir hata oluştu.');
      setEditDialogLoading(false);
    }
  };

  // Handle delete list
  const handleDeleteList = async () => {
    try {
      await apiService.deleteList(listId);
      setShowDeleteDialog(false);
      navigation.navigate('Lists');
    } catch (error) {
      console.error('Error deleting list:', error);
      Alert.alert('Hata', 'Liste silinirken bir hata oluştu.');
    }
  };

  // Handle edit word
  const handleEditWord = (word: Word) => {
    setEditingWord(word);
    setEditWordValue(word.value);
    setEditWordMeaning(word.meaning);
    setEditWordContext(word.context || '');
    setShowEditWordDialog(true);
  };

  // Handle save edited word
  const handleSaveEditedWord = async () => {
    if (!editingWord) return;
    
    if (!editWordValue.trim() || !editWordMeaning.trim()) {
      Alert.alert('Hata', 'Kelime ve anlam gereklidir.');
      return;
    }
    
    try {
      setEditWordDialogLoading(true);
      
      const updatedWord = await apiService.updateWord(editingWord.id, {
        value: editWordValue,
        meaning: editWordMeaning,
        context: editWordContext
      });
      
      // Update words list
      setWords(words.map(w => w.id === updatedWord.id ? updatedWord : w));
      
      setShowEditWordDialog(false);
      setEditWordDialogLoading(false);
      setEditingWord(null);
    } catch (error) {
      console.error('Error updating word:', error);
      Alert.alert('Hata', 'Kelime güncellenirken bir hata oluştu.');
      setEditWordDialogLoading(false);
    }
  };

  // Handle delete word
  const handleDeleteWord = async () => {
    if (!deletingWordId) return;
    
    try {
      await apiService.deleteWord(deletingWordId);
      
      // Update words list
      setWords(words.filter(w => w.id !== deletingWordId));
      
      setShowDeleteWordDialog(false);
      setDeletingWordId(null);
    } catch (error) {
      console.error('Error deleting word:', error);
      Alert.alert('Hata', 'Kelime silinirken bir hata oluştu.');
    }
  };

  // Handle add word
  const handleAddWord = () => {
    navigation.navigate('AddWord', { listId });
  };

  // Handle learning mode
  const handleLearningMode = () => {
    navigation.navigate('Learning', { listId });
  };

  // Handle test mode
  const handleTestMode = () => {
    navigation.navigate('Test', { listId });
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Liste yükleniyor...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Lists')} style={styles.errorButton}>
          Geri Dön
        </Button>
      </View>
    );
  }

  // Render empty state
  if (!list) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="playlist-remove" size={64} color="#94A3B8" />
        <Text style={styles.emptyText}>Liste bulunamadı.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Lists')} style={styles.emptyButton}>
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      >
        {/* List Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{list.name}</Text>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => setShowEditDialog(true)}
                style={styles.editButton}
              />
            </View>
            
            {list.description && (
              <Text style={styles.headerDescription}>{list.description}</Text>
            )}
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color="#4CAF50" />
                <Text style={styles.statValue}>{words.length}</Text>
                <Text style={styles.statLabel}>Kelime</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="school" size={20} color="#4CAF50" />
                <Text style={styles.statValue}>{list.progress || 0}%</Text>
                <Text style={styles.statLabel}>İlerleme</Text>
              </View>
              
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calendar" size={20} color="#4CAF50" />
                <Text style={styles.statValue}>
                  {new Date(list.createdAt).toLocaleDateString('tr-TR')}
                </Text>
                <Text style={styles.statLabel}>Oluşturulma</Text>
              </View>
            </View>
            
            {(list.context || list.source) && (
              <View style={styles.metaContainer}>
                {list.context && (
                  <Chip icon="tag" style={styles.metaChip}>
                    {list.context}
                  </Chip>
                )}
                
                {list.source && (
                  <Chip icon="book" style={styles.metaChip}>
                    {list.source}
                  </Chip>
                )}
              </View>
            )}
            
            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={handleLearningMode}
                style={styles.actionButton}
                icon="school"
                disabled={words.length === 0}
              >
                Öğren
              </Button>
              
              <Button
                mode="contained"
                onPress={handleTestMode}
                style={styles.actionButton}
                icon="clipboard-check"
                disabled={words.length === 0}
              >
                Test Et
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowDeleteDialog(true)}
                style={styles.deleteButton}
                icon="delete"
              >
                Sil
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* Words Section */}
        <View style={styles.wordsSection}>
          <View style={styles.wordsSectionHeader}>
            <Text style={styles.wordsSectionTitle}>Kelimeler</Text>
            
            <View style={styles.wordsSectionActions}>
              <TextInput
                placeholder="Ara..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
                right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : null}
              />
              
              <Menu
                visible={showSortMenu}
                onDismiss={() => setShowSortMenu(false)}
                anchor={
                  <IconButton
                    icon="sort"
                    size={24}
                    onPress={() => setShowSortMenu(true)}
                  />
                }
              >
                <Menu.Item
                  title="Tarihe Göre"
                  onPress={() => {
                    setSortBy('date');
                    setShowSortMenu(false);
                  }}
                  leadingIcon="calendar"
                  trailingIcon={sortBy === 'date' ? 'check' : undefined}
                />
                <Menu.Item
                  title="Alfabetik"
                  onPress={() => {
                    setSortBy('alphabetical');
                    setShowSortMenu(false);
                  }}
                  leadingIcon="alphabetical"
                  trailingIcon={sortBy === 'alphabetical' ? 'check' : undefined}
                />
              </Menu>
            </View>
          </View>
          
          {/* Words List */}
          {filteredWords.length === 0 ? (
            <View style={styles.emptyWordsContainer}>
              {searchQuery ? (
                <>
                  <MaterialCommunityIcons name="magnify-close" size={48} color="#94A3B8" />
                  <Text style={styles.emptyWordsText}>Arama sonucu bulunamadı.</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="playlist-plus" size={48} color="#94A3B8" />
                  <Text style={styles.emptyWordsText}>Henüz kelime eklenmemiş.</Text>
                  <Button
                    mode="contained"
                    onPress={handleAddWord}
                    style={styles.addFirstWordButton}
                    icon="plus"
                  >
                    Kelime Ekle
                  </Button>
                </>
              )}
            </View>
          ) : (
            <View style={styles.wordsList}>
              {filteredWords.map((word, index) => (
                <View key={word.id}>
                  <View style={styles.wordItem}>
                    <View style={styles.wordInfo}>
                      <Text style={styles.wordText}>{word.value}</Text>
                      <Text style={styles.meaningText}>{word.meaning}</Text>
                      {word.context && (
                        <Text style={styles.contextText}>"{word.context}"</Text>
                      )}
                    </View>
                    
                    <View style={styles.wordActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEditWord(word)}
                        style={styles.wordActionButton}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => {
                          setDeletingWordId(word.id);
                          setShowDeleteWordDialog(true);
                        }}
                        style={styles.wordActionButton}
                      />
                    </View>
                  </View>
                  
                  {index < filteredWords.length - 1 && (
                    <Divider style={styles.wordDivider} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* FAB for adding words */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddWord}
        label="Kelime Ekle"
      />
      
      {/* Edit List Dialog */}
      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>Listeyi Düzenle</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Liste Adı"
              value={editName}
              onChangeText={setEditName}
              style={styles.dialogInput}
            />
            <TextInput
              label="Açıklama"
              value={editDescription}
              onChangeText={setEditDescription}
              style={styles.dialogInput}
              multiline
            />
            <TextInput
              label="Bağlam (İsteğe Bağlı)"
              value={editContext}
              onChangeText={setEditContext}
              style={styles.dialogInput}
            />
            <TextInput
              label="Kaynak (İsteğe Bağlı)"
              value={editSource}
              onChangeText={setEditSource}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditDialog(false)}>İptal</Button>
            <Button 
              onPress={handleEditList} 
              loading={editDialogLoading}
              disabled={editDialogLoading || !editName.trim()}
            >
              Kaydet
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Edit Word Dialog */}
      <Portal>
        <Dialog visible={showEditWordDialog} onDismiss={() => setShowEditWordDialog(false)}>
          <Dialog.Title>Kelimeyi Düzenle</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Kelime"
              value={editWordValue}
              onChangeText={setEditWordValue}
              style={styles.dialogInput}
            />
            <TextInput
              label="Anlam"
              value={editWordMeaning}
              onChangeText={setEditWordMeaning}
              style={styles.dialogInput}
            />
            <TextInput
              label="Bağlam Örneği (İsteğe Bağlı)"
              value={editWordContext}
              onChangeText={setEditWordContext}
              style={styles.dialogInput}
              multiline
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditWordDialog(false)}>İptal</Button>
            <Button 
              onPress={handleSaveEditedWord} 
              loading={editWordDialogLoading}
              disabled={editWordDialogLoading || !editWordValue.trim() || !editWordMeaning.trim()}
            >
              Kaydet
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Delete List Confirmation Dialog */}
      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Listeyi Sil</Dialog.Title>
          <Dialog.Content>
            <Text>
              "{list.name}" listesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>İptal</Button>
            <Button onPress={handleDeleteList} textColor="#EF4444">Sil</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Delete Word Confirmation Dialog */}
      <Portal>
        <Dialog visible={showDeleteWordDialog} onDismiss={() => setShowDeleteWordDialog(false)}>
          <Dialog.Title>Kelimeyi Sil</Dialog.Title>
          <Dialog.Content>
            <Text>
              Bu kelimeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteWordDialog(false)}>İptal</Button>
            <Button onPress={handleDeleteWord} textColor="#EF4444">Sil</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  headerCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  editButton: {
    margin: 0,
  },
  headerDescription: {
    color: '#94A3B8', // slate.400
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8', // slate.400
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metaChip: {
    backgroundColor: '#334155', // slate.700
    marginRight: 8,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#4CAF50', // Green
  },
  deleteButton: {
    borderColor: '#EF4444', // Red
    marginHorizontal: 4,
  },
  wordsSection: {
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 8,
    padding: 16,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  wordsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wordsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  wordsSectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#334155', // slate.700
    height: 40,
    width: 150,
  },
  wordsList: {
    marginTop: 8,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  wordActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordActionButton: {
    margin: 0,
  },
  wordDivider: {
    backgroundColor: '#334155', // slate.700
  },
  emptyWordsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyWordsText: {
    color: '#94A3B8', // slate.400
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  addFirstWordButton: {
    backgroundColor: '#4CAF50', // Green
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50', // Green
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#1E293B', // slate.800
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // slate.900
    padding: 16,
  },
  emptyText: {
    color: '#94A3B8', // slate.400
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50', // Green
  },
});

export default ListDetailsScreen;
