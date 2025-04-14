import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Avatar, Card, Divider, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the App.tsx based on isAuthenticated state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Kullanıcı bilgileri yüklenemedi.</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          Giriş Yap
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user.name ? user.name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()} 
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.name || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.joinDate}>Katılım: {new Date(user.createdAt).toLocaleDateString('tr-TR')}</Text>
      </View>

      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Liste</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Kelime</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Öğrenilen</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
        <List.Item
          title="Profil Bilgilerini Düzenle"
          left={props => <List.Icon {...props} icon="account-edit" color="#4CAF50" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to edit profile */}}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Şifre Değiştir"
          left={props => <List.Icon {...props} icon="lock-reset" color="#4CAF50" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to change password */}}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Bildirim Ayarları"
          left={props => <List.Icon {...props} icon="bell-outline" color="#4CAF50" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama</Text>
        <List.Item
          title="Uygulama Ayarları"
          left={props => <List.Icon {...props} icon="cog-outline" color="#4CAF50" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Yardım ve Destek"
          left={props => <List.Icon {...props} icon="help-circle-outline" color="#4CAF50" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to help */}}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
        <Divider style={styles.divider} />
        <List.Item
          title="Hakkında"
          left={props => <List.Icon {...props} icon="information-outline" color="#4CAF50" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to about */}}
          style={styles.listItem}
          titleStyle={styles.listItemTitle}
        />
      </View>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        loading={isLoading}
        disabled={isLoading}
        icon="logout"
      >
        Çıkış Yap
      </Button>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>WordPecker v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    backgroundColor: '#4CAF50', // Green
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#64748B', // slate.500
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#334155', // slate.700
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
    backgroundColor: '#1E293B', // slate.800
    marginBottom: 1,
  },
  listItemTitle: {
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: '#334155', // slate.700
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderColor: '#EF4444', // red.500
    borderWidth: 1,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#64748B', // slate.500
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444', // red.500
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginHorizontal: 16,
    backgroundColor: '#4CAF50', // Green
  },
});

export default ProfileScreen;
