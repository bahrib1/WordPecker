import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Searchbar, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WordList } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type WordListsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Lists'>;

// Sort options
type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'words_asc' | 'words_desc';

const WordListsScreen = () => {
  const navigation = useNavigation<WordListsScreenNavigationProp>();
  
  const [lists, setLists] = useState<WordList[]>([]);
  const [filteredLists, setFilteredLists] = useState<WordList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Fetch lists
  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getLists();
      setLists(data);
      applyFilters(data, searchQuery, sortOption);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError('Listeler yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLists();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  // Handle search
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(lists, query, sortOption);
  };

  // Handle sort
  const onChangeSort = (option: SortOption) => {
    setSortOption(option);
    setShowSortOptions(false);
    applyFilters(lists, searchQuery, option);
  };

  // Apply filters and sorting
  const applyFilters = (data: WordList[], query: string, sort: SortOption) => {
    // Filter by search query
    let filtered = data;
    if (query) {
      filtered = data.filter(list => 
        list.name.toLowerCase().includes(query.toLowerCase()) || 
        list.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply sorting
    switch (sort) {
      case 'name_asc':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered = [...filtered].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'date_asc':
        filtered = [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'date_desc':
        filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'words_asc':
        filtered = [...filtered].sort((a, b) => a.wordCount - b.wordCount);
        break;
      case 'words_desc':
        filtered = [...filtered].sort((a, b) => b.wordCount - a.wordCount);
        break;
    }

    setFilteredLists(filtered);
  };

  // Render sort options
  const renderSortOptions = () => (
    <View style={styles.sortOptionsContainer}>
      <Text style={styles.sortOptionsTitle}>Sıralama Seçenekleri</Text>
      <TouchableOpacity style={styles.sortOption} onPress={() => onChangeSort('name_asc')}>
        <MaterialCommunityIcons name="sort-alphabetical-ascending" size={20} color={sortOption === 'name_asc' ? '#4CAF50' : '#94A3B8'} />
        <Text style={[styles.sortOptionText, sortOption === 'name_asc' && styles.activeSortOption]}>İsim (A-Z)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption} onPress={() => onChangeSort('name_desc')}>
        <MaterialCommunityIcons name="sort-alphabetical-descending" size={20} color={sortOption === 'name_desc' ? '#4CAF50' : '#94A3B8'} />
        <Text style={[styles.sortOptionText, sortOption === 'name_desc' && styles.activeSortOption]}>İsim (Z-A)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption} onPress={() => onChangeSort('date_desc')}>
        <MaterialCommunityIcons name="sort-calendar-descending" size={20} color={sortOption === 'date_desc' ? '#4CAF50' : '#94A3B8'} />
        <Text style={[styles.sortOptionText, sortOption === 'date_desc' && styles.activeSortOption]}>En Yeni</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption} onPress={() => onChangeSort('date_asc')}>
        <MaterialCommunityIcons name="sort-calendar-ascending" size={20} color={sortOption === 'date_asc' ? '#4CAF50' : '#94A3B8'} />
        <Text style={[styles.sortOptionText, sortOption === 'date_asc' && styles.activeSortOption]}>En Eski</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption} onPress={() => onChangeSort('words_desc')}>
        <MaterialCommunityIcons name="sort-numeric-descending" size={20} color={sortOption === 'words_desc' ? '#4CAF50' : '#94A3B8'} />
        <Text style={[styles.sortOptionText, sortOption === 'words_desc' && styles.activeSortOption]}>En Çok Kelime</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortOption} onPress={() => onChangeSort('words_asc')}>
        <MaterialCommunityIcons name="sort-numeric-ascending" size={20} color={sortOption === 'words_asc' ? '#4CAF50' : '#94A3B8'} />
        <Text style={[styles.sortOptionText, sortOption === 'words_asc' && styles.activeSortOption]}>En Az Kelime</Text>
      </TouchableOpacity>
    </View>
  );

  // Render list item
  const renderListItem = ({ item }: { item: WordList }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Title style={styles.cardTitle}>{item.name}</Title>
          <Chip icon="translate" style={styles.languageChip}>{item.language || 'EN'}</Chip>
        </View>
        <Paragraph style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Paragraph>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="book-open-variant" size={16} color="#94A3B8" />
            <Text style={styles.statText}>{item.wordCount} kelime</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="calendar" size={16} color="#94A3B8" />
            <Text style={styles.statText}>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${item.progress * 100}%` }]} />
          <Text style={styles.progressText}>{Math.round(item.progress * 100)}% tamamlandı</Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Learning', { listId: item.id })}
          icon="school"
          style={styles.actionButton}
        >
          Öğren
        </Button>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('Test', { listId: item.id })}
          icon="clipboard-check"
          style={styles.actionButton}
        >
          Test Et
        </Button>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate('ListDetails', { listId: item.id })}
          icon="information"
          style={styles.actionButton}
        >
          Detaylar
        </Button>
      </Card.Actions>
    </Card>
  );

  // Render empty list
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <View>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchLists} style={styles.retryButton}>
            Tekrar Dene
          </Button>
        </View>
      ) : searchQuery ? (
        <View>
          <MaterialCommunityIcons name="magnify-close" size={64} color="#64748B" />
          <Text style={styles.emptyText}>"{searchQuery}" için sonuç bulunamadı.</Text>
          <Button mode="text" onPress={() => onChangeSearch('')} style={styles.clearButton}>
            Aramayı Temizle
          </Button>
        </View>
      ) : (
        <View>
          <MaterialCommunityIcons name="playlist-plus" size={64} color="#64748B" />
          <Text style={styles.emptyText}>Henüz kelime listeniz yok.</Text>
          <Text style={styles.emptySubtext}>İlk listenizi oluşturmak için aşağıdaki butona tıklayın.</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('CreateList')}
            icon="plus"
            style={styles.createButton}
          >
            Liste Oluştur
          </Button>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Liste ara..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#94A3B8"
          inputStyle={{ color: '#FFFFFF' }}
        />
        <TouchableOpacity 
          style={styles.sortButton} 
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <MaterialCommunityIcons name="sort" size={24} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {showSortOptions && renderSortOptions()}

      <FlatList
        data={filteredLists}
        renderItem={renderListItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateList')}
        color="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 8,
  },
  sortButton: {
    marginLeft: 12,
    padding: 8,
  },
  sortOptionsContainer: {
    backgroundColor: '#1E293B', // slate.800
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
  },
  sortOptionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortOptionText: {
    marginLeft: 12,
    color: '#94A3B8', // slate.400
  },
  activeSortOption: {
    color: '#4CAF50', // Green
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
  },
  languageChip: {
    backgroundColor: '#334155', // slate.700
    height: 28,
  },
  cardDescription: {
    color: '#94A3B8', // slate.400
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: '#94A3B8', // slate.400
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#334155', // slate.700
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50', // Green
  },
  progressText: {
    color: '#94A3B8', // slate.400
    fontSize: 12,
    textAlign: 'right',
  },
  cardActions: {
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155', // slate.700
  },
  actionButton: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B', // slate.500
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444', // red.500
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50', // Green
  },
  clearButton: {
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#4CAF50', // Green
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50', // Green
  },
});

export default WordListsScreen;
