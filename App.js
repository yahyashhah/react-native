import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, AUTH_TOKEN } from '@env';

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [cachedItems, setCachedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    loadCachedItems();
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      if (isFocused) fetchPopularData();
    } else {
      fetchSearchData(query);
    }
  }, [query, isFocused]);

  const loadCachedItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem('cached-interests');
      if (storedItems) {
        setCachedItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error loading cached items:', error);
    }
  };

  const fetchPopularData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?limit=10&from=0`, {
        headers: {
          Authorization: AUTH_TOKEN,
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setResults(data.autocomplete);
    } catch (error) {
      console.error('Error fetching popular interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchData = async (input) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?q=${input}&limit=10&from=0`, {
        headers: {
          Authorization: AUTH_TOKEN,
          Accept: 'application/json',
        },
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setResults(data.autocomplete);
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCache = async (item) => {
    try {
      if (!cachedItems.find((cachedItem) => cachedItem.id === item.id)) {
        const newCachedItems = [...cachedItems, item];
        setCachedItems(newCachedItems);
        await AsyncStorage.setItem('cached-interests', JSON.stringify(newCachedItems));
      }
      setIsFocused(false); 
      setQuery('');
    } catch (error) {
      console.error('Error adding item to cache:', error);
    }
  };

  const removeFromCache = async (id) => {
    try {
      const updatedItems = cachedItems.filter((item) => item.id !== id);
      setCachedItems(updatedItems);
      await AsyncStorage.setItem('cached-interests', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Error removing item from cache:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search interests..."
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
        />

        {/* Show cached items below input */}
        <View style={styles.cachedItemsContainer}>
          {cachedItems.map((item) => (
            <View key={item.id} style={styles.cachedItem}>
              <Text style={styles.cachedText}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeFromCache(item.id)}>
                <Text style={styles.removeButton}>❌</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Show results only if input is focused */}
        {isFocused && (
          <>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {results.length > 0 ? (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => addToCache(item)}>
                    <Text style={styles.item}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : (
              !loading && <Text style={styles.noResults}>No results found</Text>
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
  },
  searchBox: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  cachedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  cachedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ddd',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  cachedText: {
    fontSize: 14,
    marginRight: 5,
  },
  removeButton: {
    fontSize: 14,
    color: 'red',
  },
  item: {
    fontSize: 18,
    padding: 10,
  },
  noResults: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});
