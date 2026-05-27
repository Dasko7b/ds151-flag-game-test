import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

type Score = {
  username: string;
  points: number;
};

export default function Placar() {
  const [tipo, setTipo] = useState<'scores' | 'timedscores'>('scores');
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScores = async (modo: 'scores' | 'timedscores') => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:3000/${modo}`
      );

      const data = await response.json();
      const sorted = data.sort((a: Score, b: Score) => b.points - a.points);

      setScores(sorted);
    } catch (error) {
      console.error('Erro ao buscar placar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores(tipo);
  }, []);

  const handleChangeType = (novoTipo: 'scores' | 'timedscores') => {
    setTipo(novoTipo);
    fetchScores(novoTipo);
  };

  return (
    <View style={styles.container}>
      {/* BOTÕES */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, tipo === 'scores' && styles.activeButton]}
          onPress={() => handleChangeType('scores')}
        >
          <Text style={styles.buttonText}>Placar Normal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            tipo === 'timedscores' && styles.activeButton,
          ]}
          onPress={() => handleChangeType('timedscores')}
        >
          <Text style={styles.buttonText}>Placar Temporizado</Text>
        </TouchableOpacity>
      </View>

      {/* LOADING */}
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={scores}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.item}>
              {index + 1}º {item.username} - {item.points} pts
            </Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 200
  },

  activeButton: {
    backgroundColor: '#8888AA',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  item: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});