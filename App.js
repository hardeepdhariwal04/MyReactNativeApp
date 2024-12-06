import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  ToastAndroid,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Languages = [
  { label: "Bulgarian", value: "bg" },
  { label: "Czech", value: "cs" },
  { label: "Danish", value: "da" },
  { label: "Dutch", value: "nl" },
  { label: "English (American)", value: "en-US" },
  { label: "English (British)", value: "en-GB" },
  { label: "Estonian", value: "et" },
  { label: "Finnish", value: "fi" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Greek", value: "el" },
  { label: "Hungarian", value: "hu" },
  { label: "Indonesian", value: "id" },
  { label: "Italian", value: "it" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Latvian", value: "lv" },
  { label: "Lithuanian", value: "lt" },
  { label: "Polish", value: "pl" },
  { label: "Portuguese (European)", value: "pt-PT" },
  { label: "Portuguese (Brazilian)", value: "pt-BR" },
  { label: "Romanian", value: "ro" },
  { label: "Russian", value: "ru" },
  { label: "Slovak", value: "sk" },
  { label: "Slovenian", value: "sl" },
  { label: "Spanish", value: "es" },
  { label: "Swedish", value: "sv" },
  { label: "Turkish", value: "tr" },
  { label: "Ukrainian", value: "uk" },
  { label: "Chinese (Simplified)", value: "zh" },
  { label: "Hindi", value: "hi" },
];

const TranslationModels = [
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  { label: "GPT-4", value: "gpt-4o" },
  { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  { label: "Gemini 1.5 Pro 2", value: "gemini-1.5-pro-002" },
  { label: "Gemini 1.5 Flash 2", value: "gemini-1.5-flash-002" },
  { label: "DeepL", value: "deepl" },
];

const App = (props) => {
  console.log("All props received:", props);
  const { navigation } = props;  
  const [formData, setFormData] = useState({
    language: "", 
    message: "", 
    model: "" 
  });
  const [error, setError] = useState("");
  const [translation, setTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [languageStats, setLanguageStats] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const translate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://backend-vaeh.onrender.com/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Translation failed");

      const data = await response.json();
      setTranslation(data.translatedText);
      
      // Update language statistics
      setLanguageStats(prev => ({
        ...prev,
        [formData.language]: (prev[formData.language] || 0) + 1,
      }));
    } catch (error) {
      setError("Translation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.message) {
      setError("Please enter a message");
      return;
    }
    if (!formData.language) {
      setError("Please select a language");
      return;
    }
    if (!formData.model) {
      setError("Please select a translation model");
      return;
    }
    translate();
  };

  const copyToClipboard = async () => {
    if (translation) {
      await Clipboard.setString(translation);
      ToastAndroid.show('Copied to clipboard!', ToastAndroid.SHORT);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>TRANSLATION</Text>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Language:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.language}
              onValueChange={(value) => handleInputChange("language", value)}
              style={styles.picker}
            >
              <Picker.Item label="Pick Language" value="" />
              {Languages.map((lang) => (
                <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Model:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.model}
              onValueChange={(value) => handleInputChange("model", value)}
              style={styles.picker}
            >
              <Picker.Item label="Pick Model" value="" />
              {TranslationModels.map((model) => (
                <Picker.Item key={model.value} label={model.label} value={model.value} />
              ))}
            </Picker>
          </View>
        </View>

        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="Type your message here.."
          value={formData.message}
          onChangeText={(text) => handleInputChange("message", text)}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Translate</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={copyToClipboard} style={styles.translationContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#e63946" />
          ) : (
            <Text style={styles.translationText}>{translation}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Language Stats</Text>
          {Object.entries(languageStats).map(([lang, count]) => (
            <Text key={lang} style={styles.statsText}>
              {Languages.find(l => l.value === lang)?.label || lang}: {count} translations
            </Text>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.rateButton]} 
          onPress={() => navigation.navigate('Rate')}
        >
          <Text style={styles.buttonText}>Rate Translations</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3fae0',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#023047',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#023047',
    borderRadius: 5,
    marginTop: 8,
  },
  picker: {
    height: 50,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: '#023047',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#023047',
    borderRadius: 5,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#e63946',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  translationContainer: {
    padding: 16,
    backgroundColor: '#edf2f4',
    borderRadius: 5,
    minHeight: 120,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#023047',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: '#d62839',
    marginBottom: 16,
  },
  statsContainer: {
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#023047',
  },
  statsText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#023047',
  },
  rateButton: {
    backgroundColor: '#023047',
  },
  
});
export default App;