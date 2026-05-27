import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { countries } from '../data/countries';
// @ts-ignore
import _ from '../../underscore-esm-min';
import { GameHeaderTime } from '../components/GameHeaderTime';
import { FlagQuestion } from '../components/FlagQuestion';
import { OptionButton } from '../components/OptionButton';
import { FeedbackScreenTime } from '../components/FeedbackScreenTime';

import { useCronometro } from '../hooks/useCronometro';

interface Country {
  name: string;
  code: string;
}

type GameStatus = 'question' | 'hit' | 'miss' | 'end';

export const  GameScreenTime = () => {
  const [points, setPoints] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [status, setStatus] = useState<GameStatus>('question');

  const [selectedCountry, setSelectedCountry] =
    useState<Country | null>(null);

  const [options, setOptions] = useState<Country[]>([]);
  const [chosenOption, setChosenOption] = useState<number>(-1);

  const router = useRouter();

  const { username } =
    useLocalSearchParams<{ username: string }>();

  const tempoRestante = useCronometro(30, () => {
    console.log('Tempo acabou!');
    setStatus('end');
    setChosenOption(-1);
  });

  const confirmTry = () => {
    if (
      selectedCountry &&
      options[chosenOption] &&
      selectedCountry.name === options[chosenOption].name
    ) {
      setPoints((p) => p + 1);
      setStatus('hit');
    } else {
      setStatus('miss');
    }

    setStep((s) => s + 1);
  };

  useEffect(() => {
    if (status === 'question') {
      const randomCountry =
        countries[Math.floor(Math.random() * countries.length)];

      setSelectedCountry(randomCountry);
      setChosenOption(-1);
    }
  }, [status]);

  useEffect(() => {
    if (selectedCountry) {
      const filteredCountries = countries.filter(
        (country: Country) =>
          country.name !== selectedCountry.name
      );
      const randomOptions = _.sample(filteredCountries, 3);
      randomOptions.push(selectedCountry);
      setOptions(_.shuffle(randomOptions));
    }
  }, [selectedCountry]);

  if (status !== 'question') {
    return (
      <FeedbackScreenTime
        status={status}
        username={username}
        points={points}
        tempoRestante={tempoRestante}
        onContinue={() => {
          if (tempoRestante <= 0) {
            setStatus('end');
          } else {
            setStatus('question');
          }
        }}
        onRestart={() => {
          setPoints(0);
          setStep(1);
          setChosenOption(-1);
          setStatus('question');
        }}
        onQuit={() => router.replace('/')}
      />
    );
  }

  if (!selectedCountry) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <GameHeaderTime
        onClose={() => router.replace('/')}
        step={step}
        points={points}
        tempoRestante={tempoRestante}
      />
      <FlagQuestion
        username={username || 'Jogador'}
        countryCode={selectedCountry.code}
      />
      <View style={styles.optionsContainer}>
        {options.map((option, idx) => (
          <OptionButton
            key={option.code}
            label={option.name}
            isSelected={idx === chosenOption}
            onPress={() => setChosenOption(idx)}
          />
        ))}
      </View>
      <View style={styles.confirmContainer}>
        <Button
          title="Confirmar"
          color="green"
          disabled={chosenOption === -1}
          onPress={confirmTry}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionsContainer: {
    flex: 4,
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
  },

  confirmContainer: {
    flex: 1,
    marginHorizontal: 50,
    justifyContent: 'center',
  },
});

export default GameScreenTime;
