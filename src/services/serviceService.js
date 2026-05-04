import { supabase } from './supabase';

const SERVICE_SELECT = `id, nom, id_departement, departement:departement(id, nom)`;

export async function getServices() {
  return supabase.from('service').select(SERVICE_SELECT).order('nom', { ascending: true });
}

export async function createService({ nom, id_departement }) {
  return supabase
    .from('service')
    .insert({ nom, id_departement })
    .select(SERVICE_SELECT)
    .single();
}

export async function updateService(id, { nom, id_departement }) {
  return supabase
    .from('service')
    .update({ nom, id_departement })
    .eq('id', id)
    .select(SERVICE_SELECT)
    .single();
}

export async function deleteService(id) {
  return supabase.from('service').delete().eq('id', id);
}
