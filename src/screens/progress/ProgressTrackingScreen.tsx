import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, WordList, ProgressStats } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

type ProgressTrackingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Progress'>;

// Chart width based on screen width
const screenWidth = Dimensions.get('window').width - 32; // 16px padding on each side

const ProgressTrackingScreen = () => {
  const navigation = useNavigation<ProgressTrackingScreenNavigationProp>();
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<WordList[]>([]);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  
  // Fetch data
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Fetch lists and progress data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch lists
      const listsData = await apiService.getLists();
      setLists(listsData);
      
      // Fetch progress stats
      const progressData = await apiService.getProgressStats(timeRange);
      setProgressStats(progressData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Veri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Handle list selection
  const handleListSelect = (listId: string) => {
    navigation.navigate('ListDetails', { listId });
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>İlerleme verileri yükleniyor...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={handleRefresh} style={styles.errorButton}>
          Tekrar Dene
        </Button>
      </View>
    );
  }

  // Render empty state
  if (!progressStats || !lists.length) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="chart-line" size={64} color="#94A3B8" />
        <Text style={styles.emptyTitle}>Henüz ilerleme verisi yok</Text>
        <Text style={styles.emptyText}>
          Öğrenme ve test modlarını kullanarak kelimeler üzerinde çalıştıkça ilerleme istatistikleriniz burada görünecek.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Lists')}
          style={styles.emptyButton}
          icon="playlist-play"
        >
          Listelere Git
        </Button>
      </View>
    );
  }

  // Prepare chart data
  const learningData = {
    labels: progressStats.daily.dates,
    datasets: [
      {
        data: progressStats.daily.learningScores,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, // Green
        strokeWidth: 2
      }
    ],
    legend: ["Öğrenme Puanları"]
  };
  
  const testData = {
    labels: progressStats.daily.dates,
    datasets: [
      {
        data: progressStats.daily.testScores,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Blue
        strokeWidth: 2
      }
    ],
    legend: ["Test Puanları"]
  };
  
  const listProgressData = {
    labels: progressStats.listProgress.map(item => item.name.substring(0, 10) + (item.name.length > 10 ? '...' : '')),
    datasets: [
      {
        data: progressStats.listProgress.map(item => item.progress)
      }
    ]
  };
  
  const pieData = progressStats.wordStats.map((item, index) => {
    const colors = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#FF5722'];
    return {
      name: item.status,
      population: item.count,
      color: colors[index % colors.length],
      legendFontColor: '#FFFFFF',
      legendFontSize: 12
    };
  });

  const chartConfig = {
    backgroundGradientFrom: '#1E293B',
    backgroundGradientTo: '#1E293B',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#1E293B"
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>İlerleme Takibi</Text>
        <Text style={styles.subtitle}>Öğrenme performansınızı takip edin</Text>
      </View>
      
      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'all')}
          buttons={[
            { value: 'week', label: 'Haftalık' },
            { value: 'month', label: 'Aylık' },
            { value: 'all', label: 'Tümü' }
          ]}
          style={styles.segmentedButtons}
        />
      </View>
      
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Özet</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-open-variant" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{progressStats.summary.totalWords}</Text>
              <Text style={styles.statLabel}>Toplam Kelime</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{progressStats.summary.learnedWords}</Text>
              <Text style={styles.statLabel}>Öğrenilen</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="trophy" size={24} color="#FFC107" />
              <Text style={styles.statValue}>{progressStats.summary.masteredWords}</Text>
              <Text style={styles.statLabel}>Ustalaşılan</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="percent" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{progressStats.summary.averageScore}%</Text>
              <Text style={styles.statLabel}>Ort. Başarı</Text>
            </View>
          </View>
          
          <View style={styles.streakContainer}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF9800" />
            <Text style={styles.streakText}>
              {progressStats.summary.currentStreak} günlük seri! {progressStats.summary.bestStreak} gün en iyi seri.
            </Text>
          </View>
        </Card.Content>
      </Card>
      
      {/* Learning Progress Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Öğrenme İlerlemesi</Text>
          <Text style={styles.chartDescription}>Günlük öğrenme puanlarınız</Text>
          
          <LineChart
            data={learningData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
      
      {/* Test Progress Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Test Performansı</Text>
          <Text style={styles.chartDescription}>Günlük test puanlarınız</Text>
          
          <LineChart
            data={testData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
      
      {/* List Progress Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Liste İlerlemesi</Text>
          <Text style={styles.chartDescription}>Listelerinizin tamamlanma yüzdeleri</Text>
          
          <BarChart
            data={listProgressData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={30}
          />
        </Card.Content>
      </Card>
      
      {/* Word Status Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Kelime Durumları</Text>
          <Text style={styles.chartDescription}>Kelimelerinizin öğrenme durumları</Text>
          
          <PieChart
            data={pieData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>
      
      {/* Recommended Lists */}
      <Card style={styles.listsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Önerilen Listeler</Text>
          <Text style={styles.chartDescription}>Çalışmanız gereken listeler</Text>
          
          <View style={styles.recommendedListsContainer}>
            {progressStats.recommendedLists.map((list) => (
              <Card key={list.id} style={styles.recommendedListCard} onPress={() => handleListSelect(list.id)}>
                <Card.Content>
                  <Text style={styles.recommendedListTitle}>{list.name}</Text>
                  <Text style={styles.recommendedListDescription}>{list.reason}</Text>
                  
                  <View style={styles.recommendedListStats}>
                    <Chip icon="book-open-variant" style={styles.recommendedListChip}>
                      {list.wordCount} kelime
                    </Chip>
                    <Chip icon="percent" style={styles.recommendedListChip}>
                      {list.progress}% tamamlandı
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        </Card.Content>
      </Card>
      
      {/* Achievements */}
      <Card style={styles.achievementsCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Başarılar</Text>
          
          <View style={styles.achievementsContainer}>
            {progressStats.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={[
                  styles.achievementIconContainer,
                  achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked
                ]}>
                  <MaterialCommunityIcons
                    name={achievement.icon}
                    size={24}
                    color={achievement.unlocked ? '#FFFFFF' : '#64748B'}
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  {achievement.progress < 100 && (
                    <View style={styles.achievementProgressContainer}>
                      <View
                        style={[
                          styles.achievementProgressBar,
                          { width: `${achievement.progress}%` }
                        ]}
                      />
                      <Text style={styles.achievementProgressText}>
                        {achievement.progress}%
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginTop: 4,
  },
  timeRangeContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: '#1E293B', // slate.800
  },
  summaryCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155', // slate.700
    padding: 12,
    borderRadius: 8,
  },
  streakText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  chartDescription: {
    color: '#94A3B8', // slate.400
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  listsCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  recommendedListsContainer: {
    marginTop: 8,
  },
  recommendedListCard: {
    backgroundColor: '#334155', // slate.700
    marginBottom: 8,
  },
  recommendedListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  recommendedListDescription: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 8,
  },
  recommendedListStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recommendedListChip: {
    backgroundColor: '#1E293B', // slate.800
    marginRight: 8,
    marginBottom: 4,
  },
  achievementsCard: {
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 16,
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  achievementsContainer: {
    marginTop: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementUnlocked: {
    backgroundColor: '#4CAF50', // Green
  },
  achievementLocked: {
    backgroundColor: '#334155', // slate.700
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
    marginBottom: 4,
  },
  achievementProgressContainer: {
    height: 8,
    backgroundColor: '#334155', // slate.700
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  achievementProgressBar: {
    height: '100%',
    backgroundColor: '#4CAF50', // Green
    borderRadius: 4,
  },
  achievementProgressText: {
    position: 'absolute',
    right: 0,
    top: -16,
    fontSize: 10,
    color: '#94A3B8', // slate.400
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50', // Green
  },
});

export default ProgressTrackingScreen;
