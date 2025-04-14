import { createWorker } from 'tesseract.js';
import axios from 'axios';

// Interface for detected word
export interface DetectedWord {
  id: string;
  value: string;
  meaning: string;
  selected: boolean;
}

// Function to recognize text from image using Tesseract.js
export const recognizeText = async (imageUri: string): Promise<string[]> => {
  try {
    // Create worker
    const worker = await createWorker('eng');
    
    // Recognize text
    const { data } = await worker.recognize(imageUri);
    
    // Terminate worker
    await worker.terminate();
    
    // Extract words from text
    const text = data.text;
    const words = text
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out short words
      .map(word => word.replace(/[^a-zA-Z]/g, '')) // Remove non-alphabetic characters
      .filter(word => word.length > 0) // Filter out empty strings
      .map(word => word.toLowerCase()) // Convert to lowercase
      .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates
    
    return words;
  } catch (error) {
    console.error('Error recognizing text:', error);
    throw error;
  }
};

// Function to translate words using a translation API
export const translateWords = async (words: string[], sourceLang: string = 'en', targetLang: string = 'tr'): Promise<Record<string, string>> => {
  try {
    // For demo purposes, we'll use a mock translation
    // In a real app, this would use a translation API like Google Translate
    
    // Mock translations for common English words to Turkish
    const mockTranslations: Record<string, string> = {
      'vocabulary': 'kelime hazinesi',
      'grammar': 'dilbilgisi',
      'pronunciation': 'telaffuz',
      'fluent': 'akıcı',
      'sentence': 'cümle',
      'paragraph': 'paragraf',
      'dictionary': 'sözlük',
      'translate': 'çevirmek',
      'language': 'dil',
      'word': 'kelime',
      'learn': 'öğrenmek',
      'study': 'çalışmak',
      'practice': 'pratik',
      'speak': 'konuşmak',
      'listen': 'dinlemek',
      'read': 'okumak',
      'write': 'yazmak',
      'understand': 'anlamak',
      'book': 'kitap',
      'page': 'sayfa',
      'chapter': 'bölüm',
      'text': 'metin',
      'letter': 'mektup',
      'alphabet': 'alfabe',
      'meaning': 'anlam',
      'definition': 'tanım',
      'example': 'örnek',
      'question': 'soru',
      'answer': 'cevap',
      'correct': 'doğru',
      'incorrect': 'yanlış',
      'error': 'hata',
      'test': 'test',
      'exam': 'sınav',
      'score': 'puan',
      'progress': 'ilerleme',
      'level': 'seviye',
      'beginner': 'başlangıç',
      'intermediate': 'orta',
      'advanced': 'ileri',
      'native': 'anadil',
      'foreign': 'yabancı',
      'international': 'uluslararası',
      'global': 'küresel',
      'local': 'yerel',
      'regional': 'bölgesel',
      'accent': 'aksan',
      'dialect': 'lehçe',
      'idiom': 'deyim',
      'phrase': 'ifade',
      'expression': 'ifade',
      'slang': 'argo',
      'formal': 'resmi',
      'informal': 'gayri resmi',
      'colloquial': 'günlük konuşma',
      'academic': 'akademik',
      'technical': 'teknik',
      'scientific': 'bilimsel',
      'literary': 'edebi',
      'poetic': 'şiirsel',
      'metaphor': 'metafor',
      'simile': 'benzetme',
      'analogy': 'analoji',
      'synonym': 'eş anlamlı',
      'antonym': 'zıt anlamlı',
      'homonym': 'eş sesli',
      'homophone': 'eş sesli',
      'homograph': 'eş yazılı',
      'prefix': 'önek',
      'suffix': 'sonek',
      'root': 'kök',
      'stem': 'gövde',
      'conjugation': 'çekim',
      'declension': 'çekim',
      'tense': 'zaman',
      'mood': 'kip',
      'voice': 'çatı',
      'aspect': 'görünüş',
      'person': 'şahıs',
      'number': 'sayı',
      'gender': 'cinsiyet',
      'case': 'durum',
      'article': 'tanımlık',
      'noun': 'isim',
      'pronoun': 'zamir',
      'verb': 'fiil',
      'adjective': 'sıfat',
      'adverb': 'zarf',
      'preposition': 'edat',
      'conjunction': 'bağlaç',
      'interjection': 'ünlem',
      'subject': 'özne',
      'predicate': 'yüklem',
      'object': 'nesne',
      'complement': 'tümleç',
      'clause': 'yan cümle',
      'phrase': 'öbek',
      'syntax': 'sözdizimi',
      'semantics': 'anlambilim',
      'pragmatics': 'edimbilim',
      'phonetics': 'sesbilim',
      'phonology': 'sesbilgisi',
      'morphology': 'biçimbilim',
      'lexicology': 'sözcükbilim',
      'etymology': 'köken bilimi',
      'linguistics': 'dilbilim',
      'translation': 'çeviri',
      'interpretation': 'yorumlama',
      'communication': 'iletişim',
      'conversation': 'konuşma',
      'dialogue': 'diyalog',
      'monologue': 'monolog',
      'speech': 'konuşma',
      'presentation': 'sunum',
      'debate': 'tartışma',
      'discussion': 'tartışma',
      'argument': 'argüman',
      'opinion': 'görüş',
      'thought': 'düşünce',
      'idea': 'fikir',
      'concept': 'kavram',
      'theory': 'teori',
      'hypothesis': 'hipotez',
      'conclusion': 'sonuç',
      'summary': 'özet',
      'abstract': 'özet',
      'introduction': 'giriş',
      'body': 'gövde',
      'conclusion': 'sonuç',
      'reference': 'referans',
      'citation': 'alıntı',
      'quotation': 'alıntı',
      'bibliography': 'kaynakça',
      'glossary': 'sözlük',
      'index': 'dizin',
      'appendix': 'ek',
      'annotation': 'not',
      'footnote': 'dipnot',
      'endnote': 'son not',
      'comment': 'yorum',
      'feedback': 'geri bildirim',
      'review': 'inceleme',
      'critique': 'eleştiri',
      'analysis': 'analiz',
      'evaluation': 'değerlendirme',
      'assessment': 'değerlendirme',
      'grade': 'not',
      'mark': 'not',
      'score': 'puan',
      'point': 'puan',
      'credit': 'kredi',
      'unit': 'birim',
      'module': 'modül',
      'course': 'kurs',
      'program': 'program',
      'curriculum': 'müfredat',
      'syllabus': 'ders programı',
      'lesson': 'ders',
      'class': 'sınıf',
      'lecture': 'ders',
      'seminar': 'seminer',
      'workshop': 'atölye',
      'tutorial': 'öğretici',
      'exercise': 'alıştırma',
      'drill': 'alıştırma',
      'practice': 'pratik',
      'homework': 'ev ödevi',
      'assignment': 'ödev',
      'project': 'proje',
      'research': 'araştırma',
      'study': 'çalışma',
      'learning': 'öğrenme',
      'teaching': 'öğretme',
      'education': 'eğitim',
      'training': 'eğitim',
      'instruction': 'öğretim',
      'pedagogy': 'pedagoji',
      'didactics': 'didaktik',
      'methodology': 'metodoloji',
      'approach': 'yaklaşım',
      'method': 'yöntem',
      'technique': 'teknik',
      'strategy': 'strateji',
      'tactic': 'taktik',
      'plan': 'plan',
      'goal': 'hedef',
      'objective': 'amaç',
      'aim': 'amaç',
      'purpose': 'amaç',
      'intention': 'niyet',
      'motivation': 'motivasyon',
      'inspiration': 'ilham',
      'aspiration': 'arzu',
      'ambition': 'hırs',
      'dream': 'hayal',
      'vision': 'vizyon',
      'mission': 'misyon',
      'value': 'değer',
      'principle': 'ilke',
      'rule': 'kural',
      'regulation': 'yönetmelik',
      'law': 'kanun',
      'code': 'kod',
      'standard': 'standart',
      'norm': 'norm',
      'convention': 'gelenek',
      'tradition': 'gelenek',
      'custom': 'adet',
      'habit': 'alışkanlık',
      'routine': 'rutin',
      'pattern': 'desen',
      'structure': 'yapı',
      'system': 'sistem',
      'organization': 'organizasyon',
      'institution': 'kurum',
      'establishment': 'kuruluş',
      'foundation': 'vakıf',
      'association': 'dernek',
      'society': 'toplum',
      'community': 'topluluk',
      'group': 'grup',
      'team': 'takım',
      'member': 'üye',
      'participant': 'katılımcı',
      'student': 'öğrenci',
      'pupil': 'öğrenci',
      'learner': 'öğrenci',
      'teacher': 'öğretmen',
      'instructor': 'eğitmen',
      'professor': 'profesör',
      'lecturer': 'öğretim görevlisi',
      'tutor': 'özel öğretmen',
      'mentor': 'mentor',
      'coach': 'koç',
      'guide': 'rehber',
      'advisor': 'danışman',
      'counselor': 'danışman',
      'consultant': 'danışman',
      'expert': 'uzman',
      'specialist': 'uzman',
      'professional': 'profesyonel',
      'amateur': 'amatör',
      'beginner': 'başlangıç',
      'novice': 'acemi',
      'intermediate': 'orta seviye',
      'advanced': 'ileri seviye',
      'master': 'usta',
      'expert': 'uzman',
      'genius': 'dahi',
      'talent': 'yetenek',
      'skill': 'beceri',
      'ability': 'yetenek',
      'competence': 'yetkinlik',
      'proficiency': 'yeterlilik',
      'fluency': 'akıcılık',
      'accuracy': 'doğruluk',
      'precision': 'kesinlik',
      'clarity': 'netlik',
      'coherence': 'tutarlılık',
      'cohesion': 'bağdaşıklık',
      'unity': 'birlik',
      'harmony': 'uyum',
      'balance': 'denge',
      'proportion': 'oran',
      'symmetry': 'simetri',
      'rhythm': 'ritim',
      'tempo': 'tempo',
      'pace': 'hız',
      'speed': 'hız',
      'rate': 'oran',
      'frequency': 'sıklık',
      'intensity': 'yoğunluk',
      'volume': 'hacim',
      'tone': 'ton',
      'pitch': 'perde',
      'stress': 'vurgu',
      'emphasis': 'vurgu',
      'focus': 'odak',
      'attention': 'dikkat',
      'concentration': 'konsantrasyon',
      'memory': 'hafıza',
      'recall': 'hatırlama',
      'recognition': 'tanıma',
      'perception': 'algı',
      'sensation': 'his',
      'feeling': 'duygu',
      'emotion': 'duygu',
      'mood': 'ruh hali',
      'attitude': 'tutum',
      'behavior': 'davranış',
      'action': 'eylem',
      'reaction': 'tepki',
      'response': 'yanıt',
      'feedback': 'geri bildirim',
      'input': 'girdi',
      'output': 'çıktı',
      'result': 'sonuç',
      'outcome': 'sonuç',
      'effect': 'etki',
      'impact': 'etki',
      'influence': 'etki',
      'power': 'güç',
      'force': 'kuvvet',
      'energy': 'enerji',
      'strength': 'güç',
      'weakness': 'zayıflık',
      'advantage': 'avantaj',
      'disadvantage': 'dezavantaj',
      'benefit': 'fayda',
      'cost': 'maliyet',
      'price': 'fiyat',
      'value': 'değer',
      'worth': 'değer',
      'quality': 'kalite',
      'quantity': 'miktar',
      'amount': 'miktar',
      'number': 'sayı',
      'figure': 'rakam',
      'digit': 'rakam',
      'numeral': 'sayı',
      'letter': 'harf',
      'character': 'karakter',
      'symbol': 'sembol',
      'sign': 'işaret',
      'mark': 'işaret',
      'punctuation': 'noktalama',
      'period': 'nokta',
      'comma': 'virgül',
      'colon': 'iki nokta',
      'semicolon': 'noktalı virgül',
      'question': 'soru işareti',
      'exclamation': 'ünlem',
      'quotation': 'tırnak',
      'parenthesis': 'parantez',
      'bracket': 'köşeli parantez',
      'dash': 'tire',
      'hyphen': 'kısa çizgi',
      'apostrophe': 'kesme işareti',
      'ellipsis': 'üç nokta',
      'asterisk': 'yıldız',
      'ampersand': 've işareti',
      'percent': 'yüzde',
      'degree': 'derece',
      'plus': 'artı',
      'minus': 'eksi',
      'multiply': 'çarpı',
      'divide': 'bölü',
      'equal': 'eşittir',
      'not': 'değil',
      'greater': 'büyüktür',
      'less': 'küçüktür',
      'infinity': 'sonsuz',
      'zero': 'sıfır',
      'one': 'bir',
      'two': 'iki',
      'three': 'üç',
      'four': 'dört',
      'five': 'beş',
      'six': 'altı',
      'seven': 'yedi',
      'eight': 'sekiz',
      'nine': 'dokuz',
      'ten': 'on'
    };
    
    // Create translations object
    const translations: Record<string, string> = {};
    
    // For each word, get translation from mock data or use placeholder
    words.forEach(word => {
      translations[word] = mockTranslations[word] || `${word} (çeviri yok)`;
    });
    
    return translations;
  } catch (error) {
    console.error('Error translating words:', error);
    throw error;
  }
};

// Function to process image and return detected words with translations
export const processImageWithOCR = async (imageUri: string): Promise<DetectedWord[]> => {
  try {
    // Recognize text from image
    const words = await recognizeText(imageUri);
    
    // Translate words
    const translations = await translateWords(words);
    
    // Create detected words array
    const detectedWords: DetectedWord[] = words.map((word, index) => ({
      id: (index + 1).toString(),
      value: word,
      meaning: translations[word] || `${word} (çeviri yok)`,
      selected: true
    }));
    
    return detectedWords;
  } catch (error) {
    console.error('Error processing image with OCR:', error);
    throw error;
  }
};
