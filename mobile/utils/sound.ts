import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

let soundEnabled = true;

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
  return soundEnabled;
};

export const getSoundEnabled = () => soundEnabled;

export const playLetterSound = (letter: string) => {
  if (!soundEnabled || !letter) return;
  Speech.speak(letter.toLowerCase(), {
    language: 'en-US',
    rate: 0.9,
    pitch: 1.2,
  });
};

export const playWordSound = (word: string) => {
  if (!soundEnabled || !word) return;
  Speech.speak(word, {
    language: 'en-US',
    rate: 0.8,
    pitch: 1.1,
  });
};

export const playSuccessSound = () => {
  if (!soundEnabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  Speech.speak("Great!", { rate: 1.2, pitch: 1.5 });
};

export const playWrongSound = () => {
  if (!soundEnabled) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  Speech.speak("Oops!", { rate: 1.2, pitch: 0.8 });
};

export const playJumpSound = () => {
  if (!soundEnabled) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
