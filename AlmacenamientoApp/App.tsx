import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import FileUploader from './components/FileUploader';

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>☁️ Almacenamiento en la Nube</Text>
      <Text style={styles.subtitle}>Supabase Storage</Text>
      <FileUploader />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24, paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    flexGrow: 1,
  },
  title:    { fontSize: 26, fontWeight: '700', color: '#f8fafc', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 36 },
});