import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText, RadioButton, Chip, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import apiService from '../../api/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type CreateListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateList'>;

// Template types
type ListTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

// Available templates
const templates: ListTemplate[] = [
  {
    id: 'basic',
    name: 'Temel Kelimeler',
    description: 'Günlük hayatta sık kullanılan temel kelimeler için boş bir liste.',
    icon: 'book-open-variant',
  },
  {
    id: 'travel',
    name: 'Seyahat',
    description: 'Seyahat ederken kullanabileceğiniz kelimeler için hazır şablon.',
    icon: 'airplane',
  },
  {
    id: 'business',
    name: 'İş İngilizcesi',
    description: 'İş hayatında kullanılan terimler ve ifadeler için hazır şablon.',
    icon: 'briefcase',
  },
  {
    id: 'academic',
    name: 'Akademik',
    description: 'Akademik çalışmalarda kullanılan terimler için hazır şablon.',
    icon: 'school',
  },
  {
    id: 'custom',
    name: 'Özel Liste',
    description: 'Tamamen boş bir liste oluşturun ve kendi kelimelerinizi ekleyin.',
    icon: 'playlist-plus',
  },
];

// Available languages
const languages = [
  { code: 'en', name: 'İngilizce' },
  { code: 'de', name: 'Almanca' },
  { code: 'fr', name: 'Fransızca' },
  { code: 'es', name: 'İspanyolca' },
  { code: 'it', name: 'İtalyanca' },
  { code: 'ru', name: 'Rusça' },
  { code: 'ja', name: 'Japonca' },
  { code: 'zh', name: 'Çince' },
  { code: 'ar', name: 'Arapça' },
  { code: 'tr', name: 'Türkçe' },
];

const CreateListScreen = () => {
  const navigation = useNavigation<CreateListScreenNavigationProp>();
  
  // State for template selection step
  const [step, setStep] = useState<'template' | 'form'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  
  // State for form step
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [source, setSource] = useState('');
  const [language, setLanguage] = useState('en');
  
  // Validation state
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate form fields
  const validateName = (name: string) => {
    if (!name) {
      setNameError('Liste adı gereklidir');
      return false;
    } else if (name.length < 3) {
      setNameError('Liste adı en az 3 karakter olmalıdır');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateDescription = (description: string) => {
    if (!description) {
      setDescriptionError('Liste açıklaması gereklidir');
      return false;
    } else if (description.length < 10) {
      setDescriptionError('Liste açıklaması en az 10 karakter olmalıdır');
      return false;
    }
    setDescriptionError('');
    return true;
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Pre-fill form based on template
    if (templateId !== 'custom') {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setName(template.name);
        setDescription(template.description);
      }
    } else {
      // Reset form for custom template
      setName('');
      setDescription('');
    }
  };

  // Handle continue to form
  const handleContinue = () => {
    setStep('form');
  };

  // Handle back to template selection
  const handleBack = () => {
    setStep('template');
  };

  // Handle create list
  const handleCreateList = async () => {
    const isNameValid = validateName(name);
    const isDescriptionValid = validateDescription(description);

    if (isNameValid && isDescriptionValid) {
      try {
        setLoading(true);
        setError(null);
        
        const newList = await apiService.createList({
          name,
          description,
          context: context || undefined,
          source: source || undefined,
          language,
        });
        
        setLoading(false);
        
        // Navigate to add words screen with the new list ID
        navigation.navigate('AddWord', { listId: newList.id });
      } catch (error) {
        console.error('Create list error:', error);
        setError('Liste oluşturulurken bir hata oluştu.');
        setLoading(false);
      }
    }
  };

  // Render template selection step
  const renderTemplateStep = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Liste Şablonu Seçin</Text>
        <Text style={styles.subtitle}>
          Başlamak için bir şablon seçin veya sıfırdan bir liste oluşturun
        </Text>
      </View>

      <View style={styles.templatesContainer}>
        {templates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplate === template.id && styles.selectedTemplateCard,
            ]}
            onPress={() => handleTemplateSelect(template.id)}
          >
            <MaterialCommunityIcons
              name={template.icon as any}
              size={32}
              color={selectedTemplate === template.id ? '#4CAF50' : '#94A3B8'}
              style={styles.templateIcon}
            />
            <Text style={[
              styles.templateName,
              selectedTemplate === template.id && styles.selectedTemplateName,
            ]}>
              {template.name}
            </Text>
            <Text style={styles.templateDescription} numberOfLines={2}>
              {template.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleContinue}
        style={styles.button}
      >
        Devam Et
      </Button>
    </ScrollView>
  );

  // Render form step
  const renderFormStep = () => (
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
          <Text style={styles.title}>Liste Oluştur</Text>
          <Text style={styles.subtitle}>
            Yeni kelime listeniz için bilgileri doldurun
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          label="Liste Adı"
          value={name}
          onChangeText={setName}
          onBlur={() => validateName(name)}
          style={styles.input}
          error={!!nameError}
          left={<TextInput.Icon icon="format-title" />}
        />
        {!!nameError && <HelperText type="error">{nameError}</HelperText>}

        <TextInput
          label="Açıklama"
          value={description}
          onChangeText={setDescription}
          onBlur={() => validateDescription(description)}
          style={styles.input}
          multiline
          numberOfLines={3}
          error={!!descriptionError}
          left={<TextInput.Icon icon="text" />}
        />
        {!!descriptionError && <HelperText type="error">{descriptionError}</HelperText>}

        <TextInput
          label="Bağlam (İsteğe Bağlı)"
          value={context}
          onChangeText={setContext}
          style={styles.input}
          multiline
          numberOfLines={2}
          placeholder="Bu liste hangi bağlamda kullanılacak? (Kitap, kurs, vb.)"
          left={<TextInput.Icon icon="text-box" />}
        />

        <TextInput
          label="Kaynak (İsteğe Bağlı)"
          value={source}
          onChangeText={setSource}
          style={styles.input}
          placeholder="Kelimelerin kaynağı (Kitap adı, web sitesi, vb.)"
          left={<TextInput.Icon icon="book" />}
        />

        <Text style={styles.sectionTitle}>Dil Seçin</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageContainer}
        >
          {languages.map((lang) => (
            <Chip
              key={lang.code}
              selected={language === lang.code}
              onPress={() => setLanguage(lang.code)}
              style={[
                styles.languageChip,
                language === lang.code && styles.selectedLanguageChip,
              ]}
              textStyle={language === lang.code ? styles.selectedLanguageText : styles.languageText}
              icon="translate"
            >
              {lang.name}
            </Chip>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backButton}
          >
            Geri
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateList}
            style={styles.createButton}
            loading={loading}
            disabled={loading}
          >
            Liste Oluştur
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return step === 'template' ? renderTemplateStep() : renderFormStep();
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
  templatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#1E293B', // slate.800
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155', // slate.700
  },
  selectedTemplateCard: {
    borderColor: '#4CAF50', // Green
    borderWidth: 2,
  },
  templateIcon: {
    marginBottom: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  selectedTemplateName: {
    color: '#4CAF50', // Green
  },
  templateDescription: {
    fontSize: 14,
    color: '#94A3B8', // slate.400
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E293B', // slate.800
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingVertical: 8,
  },
  languageChip: {
    marginRight: 8,
    backgroundColor: '#1E293B', // slate.800
    borderColor: '#334155', // slate.700
  },
  selectedLanguageChip: {
    backgroundColor: '#4CAF50', // Green
  },
  languageText: {
    color: '#FFFFFF',
  },
  selectedLanguageText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#4CAF50', // Green
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#64748B', // slate.500
  },
  createButton: {
    flex: 2,
    backgroundColor: '#4CAF50', // Green
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
});

export default CreateListScreen;
