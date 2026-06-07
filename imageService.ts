import { decode } from 'base64-arraybuffer';
// OVDJE JE PROMJENA - dodano je /legacy na kraju
import * as FileSystem from 'expo-file-system/legacy';
import { SUPABASE_BUCKET_NAME, supabase } from './supabaseConfig';

export const uploadEventPoster = async (imageUri: string) => {
  try {

    const fileName = `poster_${Date.now()}.jpg`;


    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });


    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (error) {
      console.error("Supabase upload greška:", error);
      throw error;
    }

   
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_BUCKET_NAME)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;

  } catch (error) {
    console.error("Greška pri uploadu slike na Supabase:", error);
    throw error; 
  }
};