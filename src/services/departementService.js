import { supabase } from './supabase';

export async function getDepartements() {
  return supabase.from('departement').select('id, nom').order('nom', { ascending: true });
}

export async function createDepartement(nom) {
  return supabase.from('departement').insert({ nom }).select('id, nom').single();
}

export async function updateDepartement(id, nom) {
  return supabase.from('departement').update({ nom }).eq('id', id).select('id, nom').single();
}

export async function deleteDepartement(id) {
  return supabase.from('departement').delete().eq('id', id);
}
