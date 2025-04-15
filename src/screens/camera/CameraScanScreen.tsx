import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, Chip, ActivityIndicator, FAB, Dialog, Portal, TextInput } from 'react-native-paper';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import apiService from '../../api/apiService';
import { processImageWithOCR, DetectedWord } from '../../utils/ocrService';

type CameraScanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CameraScan'>;

// Define default camera constants in case they're undefined
const DEFAULT_CAMERA_CONSTANTS = {
  Type: {
    back: 'back',
    front: 'front'
  },
  FlashMode: {
    off: 'off',
    on: 'on'
  }
};

const CameraScanScreen = () => {
  const navigation = useNavigation<CameraScanScreenNavigationProp>();
  const cameraRef = useRef<Camera>(null);
  
  // Use Camera.Constants if available, otherwise use defaults
  const CameraConstants = Camera.Constants || DEFAULT_CAMERA_CONSTANTS;
  
  // State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraConstants.Type.back);
  const [flashMode, setFlashMode] = useState(CameraConstants.FlashMode.off);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedWords, setDetectedWords] = useState<DetectedWord[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showListDialog, setShowListDialog] = useState(false);
  const [userLists, setUserLists] = useState<{ id: string; name: string }[]>([]);
  const [showWordDialog, setShowWordDialog] = useState(false);
  const [currentWord, setCurrentWord] = useState<DetectedWord | null>(null);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showNewListDialog, setShowNewListDialog] = useState(false);
  
  // Request camera permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Load user lists
      try {
        const lists = await apiService.getLists();
        setUserLists(lists.map(list => ({ id: list.id, name: list.name })));
        
        // Set default list if available
        if (lists.length > 0) {
          setSelectedListId(lists[0].id);
        }
      } catch (error) {
        console.error('Error loading lists:', error);
      }
    })();
  }, []);
  
  // Handle camera ready
  const onCameraReady = () => {
    setIsCameraReady(true);
  };
  
  // Toggle flash mode
  const toggleFlash = () => {
    setFlashMode(
      flashMode === CameraConstants.FlashMode.off
        ? CameraConstants.FlashMode.on
        : CameraConstants.FlashMode.off
    );
  };
  
  // Toggle camera type
  const toggleCameraType = () => {
    setCameraType(
      cameraType === CameraConstants.Type.back
        ? CameraConstants.Type.front
        : CameraConstants.Type.back
    );
  };
  
  // Take picture
  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          skipProcessing: true
        });
        
        setCapturedImage(photo.uri);
        setIsCapturing(false);
        
        // Process the image
        processImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        setIsCapturing(false);
        Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
      }
    }
  };
  
  // Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setCapturedImage(selectedImage.uri);
        
        // Process the image
        processImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Hata', 'Galeriden resim seçilirken bir hata oluştu.');
    }
  };
  
  // Process image with OCR
  const processImage = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      
      // Use real OCR processing instead of mock data
      const detectedWords = await processImageWithOCR(imageUri);
      
      setDetectedWords(detectedWords);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
      Alert.alert('Hata', 'Görüntü işlenirken bir hata oluştu. Lütfen tekrar deneyin veya başka bir görüntü seçin.');
    }
  };
  
  // Reset camera
  const resetCamera = () => {
    setCapturedImage(null);
    setDetectedWords([]);
  };
  
  // Toggle word selection
  const toggleWordSelection = (id: string) => {
    setDetectedWords(prevWords =>
      prevWords.map(word =>
        word.id === id ? { ...word, selected: !word.selected } : word
      )
    );
  };
  
  // Edit word
  const editWord = (word: DetectedWord) => {
    setCurrentWord(word);
    setShowWordDialog(true);
  };
  
  // Update word
  const updateWord = () => {
    if (!currentWord) return;
    
    setDetectedWords(prevWords =>
      prevWords.map(word =>
        word.id === currentWord.id ? currentWord : word
      )
    );
    
    setShowWordDialog(false);
    setCurrentWord(null);
  };
  
  // Create new list
  const createNewList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Uyarı', 'Lütfen liste adı girin.');
      return;
    }
    
    try {
      const newList = await apiService.createList({
        name: newListName,
        description: 'Kamera ile taranan kelimeler',
        language: 'en'
      });
      
      setUserLists(prevLists => [...prevLists, { id: newList.id, name: newList.name }]);
      setSelectedListId(newList.id);
      setNewListName('');
      setShowNewListDialog(false);
      
      Alert.alert('Başarılı', `"${newList.name}" listesi oluşturuldu.`);
    } catch (error) {
      console.error('Error creating list:', error);
      Alert.alert('Hata', 'Liste oluşturulurken bir hata oluştu.');
    }
  };
  
  // Add selected words to list
  const addWordsToList = async () => {
    if (!selectedListId) {
      setShowListDialog(true);
      return;
    }
    
    try {
      setIsAddingToList(true);
      
      const selectedWords = detectedWords.filter(word => word.selected);
      
      if (selectedWords.length === 0) {
        Alert.alert('Uyarı', 'Lütfen en az bir kelime seçin.');
        setIsAddingToList(false);
        return;
      }
      
      // Add words to list
      await apiService.addBulkWords(
        selectedListId,
        selectedWords.map(word => ({
          value: word.value,
          meaning: word.meaning,
          context: ''
        }))
      );
      
      setIsAddingToList(false);
      
      // Show success message
      Alert.alert(
        'Başarılı',
        `${selectedWords.length} kelime listeye eklendi.`,
        [
          {
            text: 'Listeye Git',
            onPress: () => navigation.navigate('ListDetails', { listId: selectedListId })
          },
          {
            text: 'Yeni Tarama',
            onPress: resetCamera
          }
        ]
      );
    } catch (error) {
      console.error('Error adding words to list:', error);
      setIsAddingToList(false);
      Alert.alert('Hata', 'Kelimeler listeye eklenirken bir hata oluştu.');
    }
  };
  
  // Select list
  const selectList = (listId: string) => {
    setSelectedListId(listId);
    setShowListDialog(false);
  };
  
  // Render camera controls
  const renderCameraControls = () => (
    <View style={styles.cameraControls}>
      <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
        <MaterialCommunityIcons
          name={flashMode === Camera.Constants.FlashMode.on ? 'flash' : 'flash-off'}
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.captureButton}
        onPress={takePicture}
        disabled={!isCameraReady || isCapturing}
      >
        {isCapturing ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <View style={styles.captureButtonInner} />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
        <MaterialCommunityIcons name="camera-flip" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
  
  // Render detected words
  const renderDetectedWords = () => (
    <View style={styles.detectedWordsContainer}>
      <Text style={styles.sectionTitle}>Tespit Edilen Kelimeler</Text>
      
      {detectedWords.length === 0 ? (
        <View style={styles.emptyWordsContainer}>
          <MaterialCommunityIcons name="text-search" size={64} color="#64748B" />
          <Text style={styles.emptyText}>Kelime bulunamadı.</Text>
          <Text style={styles.emptySubtext}>Lütfen daha net bir görüntü çekin veya başka bir görüntü seçin.</Text>
        </View>
      ) : (
        detectedWords.map(word => (
          <Card
            key={word.id}
            style={[
              styles.wordCard,
              word.selected ? styles.selectedWordCard : styles.unselectedWordCard
            ]}
            onPress={() => toggleWordSelection(word.id)}
          >
            <Card.Content style={styles.wordCardContent}>
              <View style={styles.wordInfo}>
                <Text style={styles.wordValue}>{word.value}</Text>
                <Text style={styles.wordMeaning}>{word.meaning}</Text>
              </View>
              
              <View style={styles.wordActions}>
                <TouchableOpacity
                  style={styles.wordActionButton}
                  onPress={() => editWord(word)}
                >
                  <MaterialCommunityIcons name="pencil" size={20} color="#4CAF50" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.wordActionButton}
                  onPress={() => toggleWordSelection(word.id)}
                >
                  <MaterialCommunityIcons
                    name={word.selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={20}
                    color={word.selected ? '#4CAF50' : '#94A3B8'}
                  />
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
      
      {detectedWords.length > 0 && (
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={addWordsToList}
            style={styles.addButton}
            loading={isAddingToList}
            disabled={isAddingToList || detectedWords.filter(w => w.selected).length === 0}
          >
            Listeye Ekle
          </Button>
          
          <Button
            mode="outlined"
            onPress={resetCamera}
            style={styles.resetButton}
            disabled={isAddingToList}
          >
            Yeni Tarama
          </Button>
        </View>
      )}
    </View>
  );
  
  // Render list selection dialog
  const renderListDialog = () => (
    <Portal>
      <Dialog visible={showListDialog} onDismiss={() => setShowListDialog(false)}>
        <Dialog.Title>Liste Seçin</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.listDialogContent}>
            {userLists.length === 0 ? (
              <View style={styles.emptyListsContainer}>
                <MaterialCommunityIcons name="playlist-remove" size={48} color="#64748B" />
                <Text style={styles.emptyListsText}>Henüz liste oluşturmadınız.</Text>
              </View>
            ) : (
              userLists.map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listItem,
                    selectedListId === list.id && styles.selectedListItem
                  ]}
                  onPress={() => selectList(list.id)}
                >
                  <MaterialCommunityIcons
                    name="playlist-edit"
                    size={24}
                    color={selectedListId === list.id ? '#4CAF50' : '#94A3B8'}
                    style={styles.listItemIcon}
                  />
                  <Text style={styles.listItemText}>{list.name}</Text>
                  {selectedListId === list.id && (
                    <MaterialCommunityIcons name="check" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))
            )}
            
            <TouchableOpacity
              style={styles.createListButton}
              onPress={() => {
                setShowListDialog(false);
                setShowNewListDialog(true);
              }}
            >
              <MaterialCommunityIcons
                name="playlist-plus"
                size={24}
                color="#4CAF50"
                style={styles.listItemIcon}
              />
              <Text style={styles.createListText}>Yeni Liste Oluştur</Text>
            </TouchableOpacity>
          </ScrollView>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowListDialog(false)}>İptal</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
  
  // Render new list dialog
  const renderNewListDialog = () => (
    <Portal>
      <Dialog visible={showNewListDialog} onDismiss={() => setShowNewListDialog(false)}>
        <Dialog.Title>Yeni Liste Oluştur</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Liste Adı"
            value={newListName}
            onChangeText={setNewListName}
            style={styles.dialogInput}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowNewListDialog(false)}>İptal</Button>
          <Button onPress={createNewList}>Oluştur</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
  
  // Render word edit dialog
  const renderWordDialog = () => (
    <Portal>
      <Dialog visible={showWordDialog} onDismiss={() => setShowWordDialog(false)}>
        <Dialog.Title>Kelimeyi Düzenle</Dialog.Title>
        <Dialog.Content>
          {currentWord && (
            <>
              <TextInput
                label="Kelime"
                value={currentWord.value}
                onChangeText={text => setCurrentWord({ ...currentWord, value: text })}
                style={styles.dialogInput}
              />
              <TextInput
                label="Anlam"
                value={currentWord.meaning}
                onChangeText={text => setCurrentWord({ ...currentWord, meaning: text })}
                style={styles.dialogInput}
              />
            </>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowWordDialog(false)}>İptal</Button>
          <Button onPress={updateWord}>Kaydet</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
  
  // If permission is null, we're still waiting
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.permissionText}>Kamera izni isteniyor...</Text>
      </View>
    );
  }
  
  // If permission is false, show error
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="camera-off" size={64} color="#EF4444" />
        <Text style={styles.permissionText}>Kamera erişimi reddedildi.</Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.permissionButton}
        >
          Geri Dön
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Camera View or Captured Image */}
      {!capturedImage ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
          onCameraReady={onCameraReady}
          ratio="16:9"
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <Text style={styles.cameraTitle}>Kelime Tarama</Text>
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <MaterialCommunityIcons name="image" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cameraGuide}>
              <View style={styles.cameraGuideBox} />
              <Text style={styles.cameraGuideText}>Metni çerçeve içine alın</Text>
            </View>
            
            {renderCameraControls()}
          </View>
        </Camera>
      ) : (
        <View style={styles.processContainer}>
          {/* Captured Image */}
          <View style={styles.capturedImageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
            
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.processingText}>Metin işleniyor...</Text>
              </View>
            )}
          </View>
          
          {/* Detected Words */}
          {!isProcessing && (
            <ScrollView style={styles.detectedWordsScroll}>
              {renderDetectedWords()}
            </ScrollView>
          )}
        </View>
      )}
      
      {/* Dialogs */}
      {renderListDialog()}
      {renderNewListDialog()}
      {renderWordDialog()}
      
      {/* FAB for gallery access when in camera view */}
      {!capturedImage && (
        <FAB
          style={styles.galleryFab}
          icon="image"
          onPress={pickImage}
          color="#FFFFFF"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // slate.900
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  galleryButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraGuideBox: {
    width: '80%',
    height: '40%',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cameraGuideText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
  },
  controlButton: {
    padding: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  galleryFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50', // Green
  },
  processContainer: {
    flex: 1,
  },
  capturedImageContainer: {
    height: '40%',
    position: 'relative',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  detectedWordsScroll: {
    flex: 1,
  },
  detectedWordsContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  wordCard: {
    marginBottom: 12,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
    borderWidth: 1,
  },
  selectedWordCard: {
    borderColor: '#4CAF50', // Green
    borderWidth: 2,
  },
  unselectedWordCard: {
    opacity: 0.8,
  },
  wordCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordInfo: {
    flex: 1,
  },
  wordValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  wordMeaning: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
  },
  wordActions: {
    flexDirection: 'row',
  },
  wordActionButton: {
    padding: 8,
  },
  actionsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#4CAF50', // Green
  },
  resetButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#4CAF50', // Green
  },
  listDialogContent: {
    maxHeight: 300,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', // slate.700
  },
  selectedListItem: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Green with opacity
  },
  listItemIcon: {
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  createListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  createListText: {
    fontSize: 16,
    color: '#4CAF50', // Green
    fontWeight: 'bold',
  },
  dialogInput: {
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
  },
  permissionText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50', // Green
  },
  emptyWordsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
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
  },
  emptyListsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyListsText: {
    fontSize: 16,
    color: '#94A3B8', // slate.400
    textAlign: 'center',
    marginTop: 16,
  },
});

export default CameraScanScreen;
