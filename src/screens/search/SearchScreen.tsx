import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Chip, Card, Button, ActivityIndicator, Divider, IconButton, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WordList, Word } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

type SearchResult = {
  type: 'list' | 'word';
  id: string;
  title: string;
  subtitle: string;
  context?: string;
  listId?: string;
  listName?: string;
};

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [filter, setFilter] = useState<'all' | 'lists' | 'words'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  
  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);
  
  // Load search history from storage
  const loadSearchHistory = async () => {
    try {
      const history = await apiService.getSearchHistory();
      setSearchHistory(history);
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };
  
  // Save search query to history
  const saveToHistory = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      // Add to local state
      const updatedHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
      setSearchHistory(updatedHistory);
      
      // Save to storage
      await apiService.saveSearchHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };
  
  // Clear search history
  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await apiService.clearSearchHistory();
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };
  
  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Save to history
      saveToHistory(searchQuery);
      
      // Perform search
      const searchResults = await apiService.search(searchQuery, filter, sortBy);
      setResults(searchResults);
      
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      setError('Arama sırasında bir hata oluştu.');
      setLoading(false);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'lists' | 'words') => {
    setFilter(newFilter);
    setFilterMenuVisible(false);
    
    if (searchQuery.trim()) {
      handleSearch();
    }
  };
  
  // Handle sort change
  const handleSortChange = (newSort: 'relevance' | 'date') => {
    setSortBy(newSort);
    setSortMenuVisible(false);
    
    if (searchQuery.trim()) {
      handleSearch();
    }
  };
  
  // Handle voice search
  const handleVoiceSearch = async () => {
    try {
      setVoiceSearchActive(true);
      
      // In a real app, this would use the device's speech recognition
      // For demo, we'll simulate a voice search after a delay
      setTimeout(() => {
        setSearchQuery('İngilizce kelimeler');
        setVoiceSearchActive(false);
        handleSearch();
      }, 2000);
    } catch (error) {
      console.error('Voice search error:', error);
      setVoiceSearchActive(false);
    }
  };
  
  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'list') {
      navigation.navigate('ListDetails', { listId: result.id });
    } else {
      // Navigate to list details with focus on the word
      navigation.navigate('ListDetails', { listId: result.listId || '' });
    }
  };
  
  // Handle history item selection
  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    handleSearch();
  };
  
  // Render filter chip
  const renderFilterChip = () => {
    let label = 'Tümü';
    let icon = 'filter-variant';
    
    if (filter === 'lists') {
      label = 'Listeler';
      icon = 'playlist-edit';
    } else if (filter === 'words') {
      label = 'Kelimeler';
      icon = 'book-open-variant';
    }
    
    return (
      <Menu
        visible={filterMenuVisible}
        onDismiss={() => setFilterMenuVisible(false)}
        anchor={
          <Chip
            icon={icon}
            onPress={() => setFilterMenuVisible(true)}
            style={styles.filterChip}
          >
            {label}
          </Chip>
        }
      >
        <Menu.Item
          title="Tümü"
          leadingIcon="filter-variant"
          onPress={() => handleFilterChange('all')}
          trailingIcon={filter === 'all' ? 'check' : undefined}
        />
        <Menu.Item
          title="Listeler"
          leadingIcon="playlist-edit"
          onPress={() => handleFilterChange('lists')}
          trailingIcon={filter === 'lists' ? 'check' : undefined}
        />
        <Menu.Item
          title="Kelimeler"
          leadingIcon="book-open-variant"
          onPress={() => handleFilterChange('words')}
          trailingIcon={filter === 'words' ? 'check' : undefined}
        />
      </Menu>
    );
  };
  
  // Render sort chip
  const renderSortChip = () => {
    let label = 'İlgililik';
    let icon = 'sort';
    
    if (sortBy === 'date') {
      label = 'Tarih';
      icon = 'calendar';
    }
    
    return (
      <Menu
        visible={sortMenuVisible}
        onDismiss={() => setSortMenuVisible(false)}
        anchor={
          <Chip
            icon={icon}
            onPress={() => setSortMenuVisible(true)}
            style={styles.filterChip}
          >
            {label}
          </Chip>
        }
      >
        <Menu.Item
          title="İlgililik"
          leadingIcon="sort"
          onPress={() => handleSortChange('relevance')}
          trailingIcon={sortBy === 'relevance' ? 'check' : undefined}
        />
        <Menu.Item
          title="Tarih"
          leadingIcon="calendar"
          onPress={() => handleSortChange('date')}
          trailingIcon={sortBy === 'date' ? 'check' : undefined}
        />
      </Menu>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Liste veya kelime ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          loading={loading}
          icon="magnify"
          onIconPress={handleSearch}
          right={() => (
            <View style={styles.searchBarRightContainer}>
              {searchQuery ? (
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setSearchQuery('')}
                  style={styles.searchBarIcon}
                />
              ) : null}
              <IconButton
                icon="microphone"
                size={20}
                onPress={handleVoiceSearch}
                style={[
                  styles.searchBarIcon,
                  voiceSearchActive && styles.activeVoiceIcon
                ]}
              />
            </View>
          )}
        />
        
        <View style={styles.filtersContainer}>
          {renderFilterChip()}
          {renderSortChip()}
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Search History */}
        {!loading && !error && results.length === 0 && searchHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Arama Geçmişi</Text>
              <Button
                onPress={clearHistory}
                mode="text"
                compact
                style={styles.clearButton}
              >
                Temizle
              </Button>
            </View>
            
            <View style={styles.historyItems}>
              {searchHistory.map((item, index) => (
                <Chip
                  key={index}
                  icon="history"
                  onPress={() => handleHistorySelect(item)}
                  style={styles.historyChip}
                >
                  {item}
                </Chip>
              ))}
            </View>
          </View>
        )}
        
        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Aranıyor...</Text>
          </View>
        )}
        
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Button mode="contained" onPress={handleSearch} style={styles.errorButton}>
              Tekrar Dene
            </Button>
          </View>
        )}
        
        {/* Empty Results */}
        {!loading && !error && searchQuery && results.length === 0 && (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify-close" size={64} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptyText}>
              "{searchQuery}" için sonuç bulunamadı. Farklı anahtar kelimeler deneyebilir veya filtreleri değiştirebilirsiniz.
            </Text>
          </View>
        )}
        
        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>
              {results.length} sonuç bulundu
            </Text>
            
            <View style={styles.resultsList}>
              {results.map((result) => (
                <Card
                  key={`${result.type}-${result.id}`}
                  style={styles.resultCard}
                  onPress={() => handleResultSelect(result)}
                >
                  <Card.Content>
                    <View style={styles.resultHeader}>
                      <MaterialCommunityIcons
                        name={result.type === 'list' ? 'playlist-edit' : 'book-open-variant'}
                        size={24}
                        color={result.type === 'list' ? '#4CAF50' : '#2196F3'}
                        style={styles.resultIcon}
                      />
                      <View style={styles.resultTitleContainer}>
                        <Text style={styles.resultTitle}>{result.title}</Text>
                        <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
                      </View>
                    </View>
                    
                    {result.context && (
                      <Text style={styles.resultContext}>"{result.context}"</Text>
                    )}
                    
                    {result.type === 'word' && result.listName && (
                      <Chip icon="playlist-edit" style={styles.resultChip}>
                        {result.listName}
                      </Chip>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}
        
        {/* Quick Actions */}
        {!loading && !error && (
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Hızlı Eylemler</Text>
            
            <View style={styles.quickActionsList}>
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('Lists')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                  <MaterialCommunityIcons name="playlist-edit" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionText}>Tüm Listeler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('CreateList')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
                  <MaterialCommunityIcons name="playlist-plus" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionText}>Liste Oluştur</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('Progress')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#FF9800' }]}>
                  <MaterialCommunityIcons name="chart-line" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionText}>İlerleme</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionItem}
                onPress={() => navigation.navigate('Flashcards')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#9C27B0' }]}>
                  <MaterialCommunityIcons name="card-text-outline" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.quickActionText}>Kelime Kartları</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#1E293B', // slate.800
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate.700
  },
  searchBar: {
    backgroundColor: '#334155', // slate.700
  },
  searchBarRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarIcon: {
    margin: 0,
  },
  activeVoiceIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#334155', // slate.700
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  historyContainer: {
    marginBottom: 24,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clearButton: {
    marginRight: -8,
  },
  historyItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#334155', // slate.700
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
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
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#94A3B8', // slate.400
    fontSize: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsList: {
    marginTop: 12,
  },
  resultCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 8,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTitleContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
  },
  resultContext: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 8,
  },
  resultChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#334155', // slate.700
  },
  quickActionsContainer: {
    marginBottom: 16,
  },
  quickActionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  quickActionItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default SearchScreen;
