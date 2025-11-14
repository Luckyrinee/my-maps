import React, { useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
// importa a chave da API do arquivo .env
import { GOOGLE_MAPS_API_KEY } from '@env';


export default function App() {
  // referência para o componente do mapa
  const mapRef = useRef(null);
  // estado do campo de busca
  const [search, setSearch] = useState('');
  // estado da região do mapa
  const [region, setRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  // estado do marcador
  const [marker, setMarker] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
  });

  // função chamada quando buscar uma localização
  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      // faz a requisição a API de geocodificação
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(search)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        // se encontrou atualiza região eo marcador
        const location = data.results[0].geometry.location;
        const newRegion = {
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
        setMarker({ latitude: location.lat, longitude: location.lng });
        // centraliza o mapa animando para a nova região
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      } else {
        Alert.alert('Local não encontrado', 'Tente outro nome.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar a localização.');
    }
  };

  // renderização do componente
  return (
    <View style={styles.container}>
      <View style={{ height: 40 }} />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar localização..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Buscar</Text>
        </TouchableOpacity>
      </View>
      {(!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === '') && (
        <Text style={{ color: 'red', textAlign: 'center', margin: 10 }}>
          Erro: API Key não encontrada. Verifique o arquivo .env e o babel.config.js.
        </Text>
      )}
      {/* mapa e marcador */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
      >
        <Marker
          coordinate={marker}
          title={search || "São Paulo"}
          description={search ? `Local buscado: ${search}` : "Capital financeira do Brasil"}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
});