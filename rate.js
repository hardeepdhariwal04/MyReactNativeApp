import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PropTypes from 'prop-types';
import { useNavigation } from '@react-navigation/native';

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
  { label: "Hindi", value: "hi" }
];

const RateTranslations = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ language: "", message: "" });
  const [translations, setTranslations] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [translationsList, setTranslationsList] = useState([]);
  const [ratings, setRatings] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleRatingChange = (modelId, value) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;
    
    const validValue = Math.min(10, Math.max(1, numValue));
    setRatings(prev => ({
      ...prev,
      [modelId]: validValue
    }));
  };

  const moveTranslation = (index, direction) => {
    const newList = [...translationsList];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < newList.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setTranslationsList(newList);
  };

  const handleSubmit = async () => {
    if (!formData.message || !formData.language) {
      setError("Please enter a message and select a language.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://backend-vaeh.onrender.com/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch translations");
      }

      const data = await response.json();
      setTranslations(data);
      
      const list = [
        { id: 'gemini', content: data.geminiTranslation, model: 'gemini-1.5-pro' },
        { id: 'deepl', content: data.deeplTranslation, model: 'deepl' }
      ];
      setTranslationsList(list);
      
      const initialRatings = {};
      list.forEach(item => {
        initialRatings[item.id] = 5;
      });
      setRatings(initialRatings);
    } catch (error) {
      setError("Failed to fetch translations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveRankings = async () => {
    try {
      const rankings = translationsList.map((item, index) => ({
        sourceText: formData.message,
        targetLanguage: formData.language,
        modelName: item.model,
        translationText: item.content,
        rank: index + 1,
        rating: ratings[item.id]
      }));

      const response = await fetch("https://backend-vaeh.onrender.com/save-rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankings }),
      });

      if (!response.ok) throw new Error("Failed to save rankings");

      Alert.alert("Success", "Rankings saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save rankings. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
      <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Back to Translation</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Compare Translations</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Language:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={formData.language}
              onValueChange={(value) => handleInputChange("language", value)}
              style={styles.picker}
            >
              <Picker.Item label="Select a language" value="" />
              {Languages.map((lang) => (
                <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Message:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Enter your message"
            value={formData.message}
            onChangeText={(text) => handleInputChange("message", text)}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Get Translations</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator size="large" color="#023047" style={styles.loader} />
        ) : null}

        {translationsList.length > 0 && (
          <View style={styles.translationsContainer}>
            <Text style={styles.subtitle}>Rank and Rate Translations</Text>
            
            {translationsList.map((item, index) => (
              <View key={item.id} style={styles.translationCard}>
                <View style={styles.translationHeader}>
                  <Text style={styles.modelName}>{item.model}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingLabel}>Rating:</Text>
                    <TextInput
                      style={styles.ratingInput}
                      value={ratings[item.id]?.toString()}
                      onChangeText={(value) => handleRatingChange(item.id, value)}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                </View>

                <View style={styles.rankButtons}>
                  <TouchableOpacity 
                    style={styles.rankButton} 
                    onPress={() => moveTranslation(index, 'up')}
                    disabled={index === 0}
                  >
                    <Icon name="arrow-upward" size={24} color={index === 0 ? '#ccc' : '#023047'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.rankButton} 
                    onPress={() => moveTranslation(index, 'down')}
                    disabled={index === translationsList.length - 1}
                  >
                    <Icon name="arrow-downward" size={24} color={index === translationsList.length - 1 ? '#ccc' : '#023047'} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.translationText}>{item.content}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.saveButton} onPress={saveRankings}>
              <Text style={styles.buttonText}>Save Rankings</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Add PropTypes
RateTranslations.propTypes = {
  navigation: PropTypes.object.isRequired
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#023047',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#023047',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#023047',
    borderRadius: 5,
  },
  picker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#023047',
    borderRadius: 5,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e63946',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#023047',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#d62839',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 20,
  },
  translationsContainer: {
    marginTop: 20,
  },
  translationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#023047',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    marginRight: 8,
    fontSize: 14,
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: '#023047',
    borderRadius: 5,
    padding: 4,
    width: 50,
    textAlign: 'center',
  },
  rankButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  rankButton: {
    padding: 8,
    marginLeft: 8,
  },
  translationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#212529',
  },
});

export default RateTranslations;