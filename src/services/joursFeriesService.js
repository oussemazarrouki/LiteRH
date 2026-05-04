import { supabase } from './supabase';

export async function getJoursFeries() {
  return supabase
    .from('jourferie')
    .select('id, nom, date')
    .order('date', { ascending: true });
}

export async function createJourFerie({ nom, date }) {
  return supabase
    .from('jourferie')
    .insert({ nom, date })
    .select('id, nom, date')
    .single();
}

export async function updateJourFerie(id, { nom, date }) {
  return supabase
    .from('jourferie')
    .update({ nom, date })
    .eq('id', id)
    .select('id, nom, date')
    .single();
}

export async function deleteJourFerie(id) {
  return supabase.from('jourferie').delete().eq('id', id);
}
