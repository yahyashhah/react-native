import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

 const dummyData = [
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Banana' },
  { id: '3', name: 'Cherry' },
  { id: '4', name: 'Date' },
  { id: '5', name: 'Grapes' },
  { id: '6', name: 'strawberry' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    searchData(query);
  }, [query]);

  const searchData = async (input) => {
    try {
      const cachedData = await AsyncStorage.getItem(`search-${input.toLowerCase()}`);

      if (cachedData) {
        console.log("cachedData", cachedData);       
        setResults(JSON.parse(cachedData));
      } else {
        console.log("not cached");
        const filteredData = dummyData.filter((item) =>
          item.name.toLowerCase().includes(input.toLowerCase())
        );

        await AsyncStorage.setItem(`search-${input.toLowerCase()}`, JSON.stringify(filteredData));
        setResults(filteredData);
      }
    } catch (error) {
      console.error('Error accessing cache:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        placeholder="Search..."
        value={query}
        onChangeText={setQuery}
      />
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
        />
      ):(
          <Text style={styles.noResults}>No results found</Text>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
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
  item: {
    fontSize: 18,
    padding: 10,
  },
});
