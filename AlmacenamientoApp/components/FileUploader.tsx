import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../lib/storageClient';

export default function FileUploader() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0]);
      setStatusMsg('');
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setFile(result.assets[0]);
      setStatusMsg('');
    }
  };

 const uploadToSupabase = async (uri: string, fileName: string, mimeType: string) => {
  const uniqueName = `${Date.now()}_${fileName}`;

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: uniqueName,
    type: mimeType,
  } as any);

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(uniqueName, formData, { contentType: mimeType });

  if (error) throw error;
  return uniqueName;
};

  const handleUpload = async () => {
    if (!image && !file) {
      Alert.alert('Sin contenido', 'Selecciona una imagen o un archivo primero.');
      return;
    }
    setUploading(true);
    setStatusMsg('');
    try {
      const results: string[] = [];
      if (image) {
        const name = image.fileName ?? `photo_${Date.now()}.jpg`;
        const mime = image.mimeType ?? 'image/jpeg';
        const uploaded = await uploadToSupabase(image.uri, name, mime);
        results.push(`✅ Imagen subida:\n${uploaded}`);
      }
      if (file) {
        const uploaded = await uploadToSupabase(
          file.uri, file.name,
          file.mimeType ?? 'application/octet-stream'
        );
        results.push(`✅ Archivo subido:\n${uploaded}`);
      }
      setStatusMsg(results.join('\n\n'));
    } catch (err: any) {
      setStatusMsg(`❌ Error: ${err.message ?? 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Imagen */}
      <TouchableOpacity style={styles.btn} onPress={pickImage}>
        <Text style={styles.btnText}>🖼️ Seleccionar imagen</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image.uri }} style={styles.preview} />}

      {/* Archivo */}
      <TouchableOpacity style={[styles.btn, styles.btnBlue]} onPress={pickFile}>
        <Text style={styles.btnText}>📄 Seleccionar archivo</Text>
      </TouchableOpacity>
      {file && <Text style={styles.fileName}>📎 {file.name}</Text>}

      {/* Subir */}
      <TouchableOpacity
        style={[styles.btn, styles.btnGreen, uploading && styles.btnDisabled]}
        onPress={handleUpload}
        disabled={uploading}
      >
        <Text style={styles.btnText}>
          {uploading ? 'Subiendo...' : '⬆️ Subir al servicio'}
        </Text>
      </TouchableOpacity>

      {uploading && (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 16 }} />
      )}

      {statusMsg !== '' && (
        <View style={[
          styles.statusBox,
          statusMsg.includes('❌') ? styles.statusError : styles.statusOk,
        ]}>
          <Text style={styles.statusText}>{statusMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', alignItems: 'center' },
  btn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 12, marginVertical: 8,
    width: '100%', alignItems: 'center',
  },
  btnBlue:     { backgroundColor: '#0ea5e9' },
  btnGreen:    { backgroundColor: '#10b981', marginTop: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText:     { color: '#fff', fontWeight: '600', fontSize: 16 },
  preview: {
    width: 200, height: 200, borderRadius: 12,
    marginVertical: 12, borderWidth: 2, borderColor: '#6366f1',
  },
  fileName:    { color: '#cbd5e1', fontSize: 13, marginVertical: 8, textAlign: 'center' },
  statusBox:   { marginTop: 20, padding: 16, borderRadius: 10, width: '100%' },
  statusOk:    { backgroundColor: '#064e3b' },
  statusError: { backgroundColor: '#7f1d1d' },
  statusText:  { color: '#fff', fontSize: 13, lineHeight: 22 },
});