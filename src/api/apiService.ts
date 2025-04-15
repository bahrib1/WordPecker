import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, WordList, Word, Exercise, Test, Progress } from '../types';

// Base URL for API
const API_URL = 'https://api.wordpecker.example.com';

// For demo purposes, we'll simulate API calls with local data
const simulateApiCall = async <T>(data: T, delay = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// Token management
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Auth API
const register = async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    // return response.data;
    
    // For demo, simulate API call
    const mockUser: User = {
      id: '1',
      email,
      name,
      createdAt: new Date().toISOString()
    };
    
    const mockResponse = {
      user: mockUser,
      token: 'mock-jwt-token'
    };
    
    await setToken(mockResponse.token);
    return simulateApiCall(mockResponse);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    // return response.data;
    
    // For demo, simulate API call
    // Allow any credentials for demo purposes
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    const mockResponse = {
      user: mockUser,
      token: 'mock-jwt-token'
    };
    
    await setToken(mockResponse.token);
    return simulateApiCall(mockResponse);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    // return response.data;
    
    // For demo, simulate API call
    const mockResponse = {
      success: true,
      message: 'Password reset instructions sent to your email'
    };
    
    return simulateApiCall(mockResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    throw error;
  }
};

const logout = async (): Promise<void> => {
  try {
    // In a real app, this might involve an API call
    // await axios.post(`${API_URL}/auth/logout`);
    
    // Remove token
    await removeToken();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await getToken();
    
    if (!token) {
      return null;
    }
    
    // In a real app, this would be an API call with the token
    // const response = await axios.get(`${API_URL}/auth/me`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, we'll return null to force login screen to show first
    // This simulates a fresh install or a logged out state
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Word Lists API
const getLists = async (): Promise<WordList[]> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/lists`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call
    const mockLists: WordList[] = [
      {
        id: '1',
        name: 'Temel İngilizce',
        description: 'Günlük hayatta sık kullanılan temel İngilizce kelimeler',
        language: 'en',
        createdAt: '2025-03-15T10:30:00Z',
        wordCount: 42,
        progress: 0.65
      },
      {
        id: '2',
        name: 'İş İngilizcesi',
        description: 'İş hayatında kullanılan terimler ve ifadeler',
        language: 'en',
        createdAt: '2025-03-20T14:45:00Z',
        wordCount: 28,
        progress: 0.3
      },
      {
        id: '3',
        name: 'Seyahat Terimleri',
        description: 'Seyahat ederken kullanabileceğiniz kelimeler',
        language: 'en',
        createdAt: '2025-04-01T09:15:00Z',
        wordCount: 35,
        progress: 0.1
      }
    ];
    
    return simulateApiCall(mockLists);
  } catch (error) {
    console.error('Get lists error:', error);
    throw error;
  }
};

// Create list
const createList = async (listData: {
  name: string;
  description: string;
  context?: string;
  source?: string;
  language: string;
}): Promise<WordList> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/lists`, listData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call
    const mockList: WordList = {
      id: Math.random().toString(36).substring(2, 9),
      name: listData.name,
      description: listData.description,
      context: listData.context,
      source: listData.source,
      language: listData.language,
      createdAt: new Date().toISOString(),
      wordCount: 0,
      progress: 0
    };
    
    return simulateApiCall(mockList);
  } catch (error) {
    console.error('Create list error:', error);
    throw error;
  }
};

// Get list by ID
const getListById = async (listId: string): Promise<WordList> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/lists/${listId}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call
    const lists = await getLists();
    const list = lists.find(l => l.id === listId);
    
    if (!list) {
      throw new Error('Liste bulunamadı');
    }
    
    return simulateApiCall(list);
  } catch (error) {
    console.error('Get list by ID error:', error);
    throw error;
  }
};

// Get words by list ID
const getWordsByListId = async (listId: string): Promise<Word[]> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/lists/${listId}/words`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call
    const mockWords: Word[] = [
      {
        id: '1',
        listId,
        value: 'apple',
        meaning: 'elma',
        context: 'I eat an apple every day.',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        listId,
        value: 'book',
        meaning: 'kitap',
        context: 'I read a book before bed.',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        listId,
        value: 'computer',
        meaning: 'bilgisayar',
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        listId,
        value: 'house',
        meaning: 'ev',
        context: 'I live in a big house.',
        createdAt: new Date().toISOString()
      },
      {
        id: '5',
        listId,
        value: 'car',
        meaning: 'araba',
        context: 'I drive my car to work every day.',
        createdAt: new Date().toISOString()
      },
      {
        id: '6',
        listId,
        value: 'phone',
        meaning: 'telefon',
        context: 'I forgot my phone at home.',
        createdAt: new Date().toISOString()
      },
      {
        id: '7',
        listId,
        value: 'water',
        meaning: 'su',
        context: 'I drink eight glasses of water daily.',
        createdAt: new Date().toISOString()
      },
      {
        id: '8',
        listId,
        value: 'friend',
        meaning: 'arkadaş',
        context: 'She is my best friend since childhood.',
        createdAt: new Date().toISOString()
      },
      {
        id: '9',
        listId,
        value: 'time',
        meaning: 'zaman',
        context: 'Time flies when you are having fun.',
        createdAt: new Date().toISOString()
      },
      {
        id: '10',
        listId,
        value: 'food',
        meaning: 'yemek',
        context: 'Turkish food is delicious.',
        createdAt: new Date().toISOString()
      }
    ];
    
    return simulateApiCall(mockWords);
  } catch (error) {
    console.error('Get words by list ID error:', error);
    throw error;
  }
};

// Add word to list
const addWord = async (wordData: {
  listId: string;
  value: string;
  meaning: string;
  context?: string;
}): Promise<Word> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/words`, wordData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call
    const mockWord: Word = {
      id: Math.random().toString(36).substring(2, 9),
      listId: wordData.listId,
      value: wordData.value,
      meaning: wordData.meaning,
      context: wordData.context,
      createdAt: new Date().toISOString()
    };
    
    return simulateApiCall(mockWord);
  } catch (error) {
    console.error('Add word error:', error);
    throw error;
  }
};

// Add multiple words to list
const addBulkWords = async (
  listId: string,
  wordsData: { value: string; meaning: string; context?: string }[]
): Promise<Word[]> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.post(`${API_URL}/lists/${listId}/bulk-words`, { words: wordsData }, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call
    const mockWords: Word[] = wordsData.map(wordData => ({
      id: Math.random().toString(36).substring(2, 9),
      listId,
      value: wordData.value,
      meaning: wordData.meaning,
      context: wordData.context,
      createdAt: new Date().toISOString()
    }));
    
    return simulateApiCall(mockWords);
  } catch (error) {
    console.error('Add bulk words error:', error);
    throw error;
  }
};

// Delete word
const deleteWord = async (wordId: string): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.delete(`${API_URL}/words/${wordId}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, simulate API call
    return simulateApiCall(undefined);
  } catch (error) {
    console.error('Delete word error:', error);
    throw error;
  }
};

// Save learning progress
const saveProgress = async (listId: string, progressData: {
  correct: number;
  total: number;
  score: number;
}): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.post(`${API_URL}/lists/${listId}/progress`, progressData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, simulate API call
    return simulateApiCall(undefined);
  } catch (error) {
    console.error('Save progress error:', error);
    throw error;
  }
};

// Save test result
const saveTestResult = async (listId: string, resultData: {
  correct: number;
  total: number;
  score: number;
  timeSpent: number;
}): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.post(`${API_URL}/lists/${listId}/test-results`, resultData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, simulate API call
    return simulateApiCall(undefined);
  } catch (error) {
    console.error('Save test result error:', error);
    throw error;
  }
};

// Update list
const updateList = async (listId: string, listData: {
  name: string;
  description?: string;
  context?: string;
  source?: string;
}): Promise<WordList> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.put(`${API_URL}/lists/${listId}`, listData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call
    const lists = await getLists();
    const listIndex = lists.findIndex(l => l.id === listId);
    
    if (listIndex === -1) {
      throw new Error('Liste bulunamadı');
    }
    
    const updatedList: WordList = {
      ...lists[listIndex],
      ...listData,
    };
    
    return simulateApiCall(updatedList);
  } catch (error) {
    console.error('Update list error:', error);
    throw error;
  }
};

// Delete list
const deleteList = async (listId: string): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.delete(`${API_URL}/lists/${listId}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, simulate API call
    return simulateApiCall(undefined);
  } catch (error) {
    console.error('Delete list error:', error);
    throw error;
  }
};

// Update word
const updateWord = async (wordId: string, wordData: {
  value: string;
  meaning: string;
  context?: string;
}): Promise<Word> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.put(`${API_URL}/words/${wordId}`, wordData, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call with a mock updated word
    const mockUpdatedWord: Word = {
      id: wordId,
      listId: 'mock-list-id', // This would be the actual list ID in a real app
      value: wordData.value,
      meaning: wordData.meaning,
      context: wordData.context,
      createdAt: new Date().toISOString()
    };
    
    return simulateApiCall(mockUpdatedWord);
  } catch (error) {
    console.error('Update word error:', error);
    throw error;
  }
};

// Get search history
const getSearchHistory = async (): Promise<string[]> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/search/history`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, get from AsyncStorage
    const historyJson = await AsyncStorage.getItem('search_history');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Get search history error:', error);
    return [];
  }
};

// Save search history
const saveSearchHistory = async (history: string[]): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.post(`${API_URL}/search/history`, { history }, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, save to AsyncStorage
    await AsyncStorage.setItem('search_history', JSON.stringify(history));
    return simulateApiCall(undefined, 100); // Faster response for better UX
  } catch (error) {
    console.error('Save search history error:', error);
    throw error;
  }
};

// Clear search history
const clearSearchHistory = async (): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.delete(`${API_URL}/search/history`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, remove from AsyncStorage
    await AsyncStorage.removeItem('search_history');
    return simulateApiCall(undefined, 100); // Faster response for better UX
  } catch (error) {
    console.error('Clear search history error:', error);
    throw error;
  }
};

// Search
const search = async (
  query: string, 
  filter: 'all' | 'lists' | 'words' = 'all',
  sortBy: 'relevance' | 'date' = 'relevance'
): Promise<SearchResult[]> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/search?query=${query}&filter=${filter}&sortBy=${sortBy}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate search results
    // First get lists and words
    const lists = await getLists();
    
    // Mock search results
    const mockResults: SearchResult[] = [];
    
    // Add list results if filter is 'all' or 'lists'
    if (filter === 'all' || filter === 'lists') {
      const matchingLists = lists.filter(list => 
        list.name.toLowerCase().includes(query.toLowerCase()) || 
        (list.description && list.description.toLowerCase().includes(query.toLowerCase()))
      );
      
      matchingLists.forEach(list => {
        mockResults.push({
          type: 'list',
          id: list.id,
          title: list.name,
          subtitle: `${list.wordCount} kelime`,
          context: list.description
        });
      });
    }
    
    // Add word results if filter is 'all' or 'words'
    if (filter === 'all' || filter === 'words') {
      // For demo, just add some mock word results
      if (query.toLowerCase().includes('elma') || query.toLowerCase().includes('apple')) {
        mockResults.push({
          type: 'word',
          id: 'word1',
          title: 'apple',
          subtitle: 'elma',
          context: 'I eat an apple every day.',
          listId: '1',
          listName: 'Temel İngilizce'
        });
      }
      
      if (query.toLowerCase().includes('kitap') || query.toLowerCase().includes('book')) {
        mockResults.push({
          type: 'word',
          id: 'word2',
          title: 'book',
          subtitle: 'kitap',
          context: 'I read a book before bed.',
          listId: '1',
          listName: 'Temel İngilizce'
        });
      }
      
      if (query.toLowerCase().includes('bilgisayar') || query.toLowerCase().includes('computer')) {
        mockResults.push({
          type: 'word',
          id: 'word3',
          title: 'computer',
          subtitle: 'bilgisayar',
          listId: '1',
          listName: 'Temel İngilizce'
        });
      }
    }
    
    // Sort results
    if (sortBy === 'date') {
      // In a real app, we would sort by date
      // For demo, just reverse the order
      mockResults.reverse();
    }
    
    return simulateApiCall(mockResults);
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};
// Get progress statistics
const getProgressStats = async (timeRange: 'week' | 'month' | 'all'): Promise<ProgressStats> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/progress/stats?timeRange=${timeRange}`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call with mock data
    const mockProgressStats: ProgressStats = {
      summary: {
        totalWords: 248,
        learnedWords: 156,
        masteredWords: 87,
        averageScore: 78,
        currentStreak: 5,
        bestStreak: 12
      },
      daily: {
        dates: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
        learningScores: [65, 70, 75, 72, 80, 85, 78],
        testScores: [60, 65, 70, 75, 72, 78, 80]
      },
      listProgress: [
        { id: 'list5', name: 'Seyahat Terimleri', progress: 30 }
      ],
      wordStats: [
        { status: 'Öğrenildi', count: 156 },
        { status: 'Ustalaşıldı', count: 87 },
        { status: 'Öğreniliyor', count: 92 },
        { status: 'Zor', count: 35 },
        { status: 'Yeni', count: 52 }
      ],
      recommendedLists: [
        {
          id: 'list3',
          name: 'Akademik Kelimeler',
          wordCount: 50,
          progress: 45,
          reason: 'Düşük ilerleme oranı'
        },
        {
          id: 'list5',
          name: 'Seyahat Terimleri',
          wordCount: 40,
          progress: 30,
          reason: 'Uzun süredir çalışılmadı'
        }
      ],
      achievements: [
        {
          id: 'achievement1',
          title: 'Kelime Ustası',
          description: '100 kelime öğrenildi',
          icon: 'trophy',
          unlocked: true,
          progress: 100
        },
        {
          id: 'achievement2',
          title: '7 Gün Serisi',
          description: '7 gün üst üste çalışma',
          icon: 'calendar-check',
          unlocked: false,
          progress: 71
        }
      ]
    };
    
    return simulateApiCall(mockProgressStats);
  } catch (error) {
    console.error('Get progress stats error:', error);
    throw error;
  }
};

// Search words
const searchWords = async (query: string, filters?: {
  listId?: string;
  sortBy?: 'date' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}): Promise<Word[]> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/search/words`, {
    //   params: { query, ...filters },
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call with mock data
    const mockWords: Word[] = [
      {
        id: '1',
        listId: '1',
        value: 'apple',
        meaning: 'elma',
        context: 'I eat an apple every day.',
        createdAt: '2025-03-15T10:30:00Z'
      },
      {
        id: '2',
        listId: '1',
        value: 'application',
        meaning: 'uygulama',
        context: 'I downloaded a new application on my phone.',
        createdAt: '2025-03-16T11:45:00Z'
      },
      {
        id: '3',
        listId: '2',
        value: 'apply',
        meaning: 'uygulamak',
        context: 'You need to apply for the job before Friday.',
        createdAt: '2025-03-17T09:15:00Z'
      }
    ].filter(word => word.value.includes(query) || word.meaning.includes(query));
    
    return simulateApiCall(mockWords);
  } catch (error) {
    console.error('Search words error:', error);
    throw error;
  }
};

// Get user settings
const getUserSettings = async (): Promise<Settings> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.get(`${API_URL}/settings`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call with mock data
    const mockSettings: Settings = {
      theme: 'dark',
      notifications: true,
      defaultLanguage: 'en',
      sessionLength: 15,
      autoPlayPronunciation: true
    };
    
    return simulateApiCall(mockSettings);
  } catch (error) {
    console.error('Get user settings error:', error);
    throw error;
  }
};

// Update user settings
const updateUserSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // const response = await axios.put(`${API_URL}/settings`, settings, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return response.data;
    
    // For demo, simulate API call with mock data
    const currentSettings = await getUserSettings();
    const updatedSettings: Settings = {
      ...currentSettings,
      ...settings
    };
    
    return simulateApiCall(updatedSettings);
  } catch (error) {
    console.error('Update user settings error:', error);
    throw error;
  }
};

// Export API functions
export default {
  // Auth
  register,
  login,
  forgotPassword,
  logout,
  getCurrentUser,
  
  // Lists
  getLists,
  createList,
  getListById,
  updateList,
  deleteList,
  
  // Words
  getWordsByListId,
  addWord,
  addBulkWords,
  updateWord,
  deleteWord,
  
  // Progress
  saveProgress,
  saveTestResult,
  getProgressStats,
  
  // Search
  searchWords,
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  search,
  
  // Settings
  getUserSettings,
  updateUserSettings,
  getSettings: getUserSettings,
  updateSettings: updateUserSettings,
  clearUserData
};

// Types for progress stats
interface ProgressStats {
  summary: {
    totalWords: number;
    learnedWords: number;
    masteredWords: number;
    averageScore: number;
    currentStreak: number;
    bestStreak: number;
  };
  daily: {
    dates: string[];
    learningScores: number[];
    testScores: number[];
  };
  listProgress: {
    id: string;
    name: string;
    progress: number;
  }[];
  wordStats: {
    status: string;
    count: number;
  }[];
  recommendedLists: {
    id: string;
    name: string;
    wordCount: number;
    progress: number;
    reason: string;
  }[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
  }[];
}

// Types for settings
interface Settings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  defaultLanguage: string;
  sessionLength: number;
  autoPlayPronunciation: boolean;
}

// Clear user data
const clearUserData = async (): Promise<void> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    // In a real app, this would be an API call
    // await axios.delete(`${API_URL}/user/data`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    
    // For demo, simulate API call
    return simulateApiCall(undefined, 1000);
  } catch (error) {
    console.error('Clear user data error:', error);
    throw error;
  }
};
