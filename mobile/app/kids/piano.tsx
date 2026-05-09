import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function PianoScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const webViewRef = useRef<WebView>(null);
  const [activeNote, setActiveNote] = useState('—');
  const [sustain, setSustain] = useState(false);
  const [reverb, setReverb] = useState(false);
  const [baseOctave, setBaseOctave] = useState(4);

  // Lock to landscape
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  // HTML content for the hidden audio bridge
  const audioBridgeHtml = `
    <html>
    <body>
    <script>
      let actx = null;
      let baseOctave = 4;
      let sustain = false;
      let reverb = false;
      let vol = 0.8;
      let reverbNode = null;
      let convolverBuffer = null;
      let activeNodes = {};

      function getCtx() {
        if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        if (actx.state === 'suspended') actx.resume();
        return actx;
      }

      function makeReverb(ctx) {
        const rate = ctx.sampleRate, len = rate * 2.5;
        const buf = ctx.createBuffer(2, len, rate);
        for (let c = 0; c < 2; c++) {
          const d = buf.getChannelData(c);
          for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
        }
        return buf;
      }

      function getConvolver(ctx) {
        if (!reverbNode) {
          reverbNode = ctx.createConvolver();
          if (!convolverBuffer) convolverBuffer = makeReverb(ctx);
          reverbNode.buffer = convolverBuffer;
          reverbNode.connect(ctx.destination);
        }
        return reverbNode;
      }

      const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

      function noteFreq(name, oct) {
        const midi = NOTE_NAMES.indexOf(name) + 12 * (oct + 1);
        return 440 * Math.pow(2, (midi - 69) / 12);
      }

      function playNote(name, oct) {
        const ctx = getCtx();
        const freq = noteFreq(name, oct);
        const key = name + oct;
        if (activeNodes[key]) stopNote(name, oct, true);

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc1.type = 'triangle'; osc1.frequency.value = freq;
        osc2.type = 'sine'; osc2.frequency.value = freq * 2;
        osc3.type = 'sine'; osc3.frequency.value = freq * 3;

        const g1 = ctx.createGain(), g2 = ctx.createGain(), g3 = ctx.createGain();
        g1.gain.value = 0.7; g2.gain.value = 0.2; g3.gain.value = 0.08;

        filter.type = 'lowpass'; filter.frequency.value = 4000; filter.Q.value = 1.2;

        osc1.connect(g1); osc2.connect(g2); osc3.connect(g3);
        g1.connect(filter); g2.connect(filter); g3.connect(filter);
        filter.connect(gain);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol * 0.9, ctx.currentTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(vol * 0.6, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(vol * 0.45, ctx.currentTime + 0.3);

        if (reverb) {
          const rv = getConvolver(ctx);
          const wet = ctx.createGain(); wet.gain.value = 0.35;
          const dry = ctx.createGain(); dry.gain.value = 0.65;
          gain.connect(dry); dry.connect(ctx.destination);
          gain.connect(wet); wet.connect(rv);
        } else {
          gain.connect(ctx.destination);
        }

        osc1.start(); osc2.start(); osc3.start();
        activeNodes[key] = { osc1, osc2, osc3, gain, ctx };
      }

      function stopNote(name, oct, immediate) {
        const key = name + oct;
        const n = activeNodes[key];
        if (!n) return;
        const { osc1, osc2, osc3, gain, ctx } = n;
        const t = ctx.currentTime;
        const rel = sustain ? 2.5 : 0.9;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (immediate ? 0.05 : rel));
        setTimeout(() => { try { osc1.stop(); osc2.stop(); osc3.stop(); } catch (e) { } }, ((immediate ? 0.05 : rel) + 0.1) * 1000);
        delete activeNodes[key];
      }

      window.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'PLAY') {
          playNote(data.note, data.octave);
        } else if (data.type === 'STOP') {
          stopNote(data.note, data.octave, data.immediate);
        } else if (data.type === 'SET_SUSTAIN') {
          sustain = data.value;
        } else if (data.type === 'SET_REVERB') {
          reverb = data.value;
        } else if (data.type === 'SET_OCTAVE') {
          baseOctave = data.value;
        }
      });
    </script>
    </body>
    </html>
  `;

  const playNote = (note: string, oct: number) => {
    setActiveNote(note + oct);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'PLAY', note, octave: oct }));
  };

  const stopNote = (note: string, oct: number) => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'STOP', note, octave: oct, immediate: false }));
  };

  const toggleSustain = () => {
    setSustain(!sustain);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'SET_SUSTAIN', value: !sustain }));
  };

  const toggleReverb = () => {
    setReverb(!reverb);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'SET_REVERB', value: !reverb }));
  };

  const changeOctave = (dir: 'up' | 'down') => {
    let newOct = baseOctave;
    if (dir === 'up' && baseOctave < 6) newOct = baseOctave + 1;
    if (dir === 'down' && baseOctave > 1) newOct = baseOctave - 1;
    setBaseOctave(newOct);
    webViewRef.current?.postMessage(JSON.stringify({ type: 'SET_OCTAVE', value: newOct }));
  };

  const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const BLACK_KEYS: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };

  const renderOctave = (oct: number) => {
    return WHITE_KEYS.map((note, idx) => {
      const hasBlack = BLACK_KEYS[note];
      return (
        <View key={note + oct} style={{ flexDirection: 'row', position: 'relative' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={() => playNote(note, oct)}
            onPressOut={() => stopNote(note, oct)}
            style={styles.wkey}
          >
            <LinearGradient
              colors={['#f5f0e8', '#e8e0cc', '#d4c89a']}
              style={styles.wkeyGradient}
            >
              <Text style={styles.klabel}>{note + oct}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {hasBlack && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPressIn={() => playNote(BLACK_KEYS[note], oct)}
              onPressOut={() => stopNote(BLACK_KEYS[note], oct)}
              style={[styles.bkey, { left: 42 }]}
            >
              <LinearGradient
                colors={['#1a1a22', '#0d0d14', '#1a1025']}
                style={styles.bkeyGradient}
              >
                <Text style={styles.bLabel}>{BLACK_KEYS[note].replace('#', '♯')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: audioBridgeHtml }}
        style={{ width: 0, height: 0, opacity: 0 }}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.navigate('../' as any)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#a78bfa" />
        </TouchableOpacity>
        <Text style={styles.brand}>GRAND PIANO</Text>
        <View style={styles.display}><Text style={styles.noteName}>{activeNote}</Text></View>
        <View style={styles.controls}>
          <View style={styles.octaveCtrl}>
            <TouchableOpacity onPress={() => changeOctave('down')} style={styles.octBtn}><Text style={{ color: '#a78bfa' }}>−</Text></TouchableOpacity>
            <Text style={styles.octVal}>{baseOctave}</Text>
            <TouchableOpacity onPress={() => changeOctave('up')} style={styles.octBtn}><Text style={{ color: '#a78bfa' }}>+</Text></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={toggleSustain} style={[styles.ctrlBtn, sustain && styles.ctrlBtnActive]}><Text style={styles.ctrlBtnText}>SUSTAIN</Text></TouchableOpacity>
          <TouchableOpacity onPress={toggleReverb} style={[styles.ctrlBtn, reverb && styles.ctrlBtnActive]}><Text style={styles.ctrlBtnText}>REVERB</Text></TouchableOpacity>
        </View>
      </View>

      <View style={styles.keyboardWrap}>
        <View style={styles.keyboard}>
          {renderOctave(baseOctave)}
          {renderOctave(baseOctave + 1)}
          <TouchableOpacity
            onPressIn={() => playNote('C', baseOctave + 2)}
            onPressOut={() => stopNote('C', baseOctave + 2)}
            style={styles.wkey}
          >
            <LinearGradient colors={['#f5f0e8', '#e8e0cc', '#d4c89a']} style={styles.wkeyGradient}>
              <Text style={styles.klabel}>C{baseOctave + 2}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0e',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#111116',
    borderBottomWidth: 1,
    borderBottomColor: '#222230',
  },
  backBtn: {
    padding: 5,
  },
  brand: {
    fontSize: 14,
    color: '#a78bfa',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  display: {
    backgroundColor: '#0d0d12',
    borderWidth: 1,
    borderColor: '#2a2a40',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  noteName: {
    fontSize: 18,
    color: '#e2c97e',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  octaveCtrl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  octBtn: {
    backgroundColor: '#1a1a26',
    borderWidth: 1,
    borderColor: '#333350',
    borderRadius: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  octVal: {
    fontSize: 14,
    color: '#666',
    minWidth: 15,
    textAlign: 'center',
  },
  ctrlBtn: {
    backgroundColor: '#1a1a26',
    borderWidth: 1,
    borderColor: '#333350',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  ctrlBtnActive: {
    backgroundColor: '#2a1a4a',
    borderColor: '#a78bfa',
  },
  ctrlBtnText: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  keyboardWrap: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  keyboard: {
    flexDirection: 'row',
    height: '80%',
    justifyContent: 'center',
  },
  wkey: {
    width: 60,
    height: '100%',
    marginHorizontal: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  wkeyGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  bkey: {
    width: 36,
    height: '60%',
    position: 'absolute',
    zIndex: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bkeyGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 5,
  },
  klabel: {
    fontSize: 12,
    color: '#888',
  },
  bLabel: {
    fontSize: 10,
    color: '#ccc',
  },
});
