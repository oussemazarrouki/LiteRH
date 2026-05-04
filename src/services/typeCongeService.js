import { supabase } from './supabase';

export async function getTypeConges() {
  return supabase
    .from('typeconge')
    .select('id, label, est_deductible')
    .order('label', { ascending: true });
}

export async function createTypeConge({ label, est_deductible }) {
  return supabase
    .from('typeconge')
    .insert({ label, est_deductible })
    .select('id, label, est_deductible')
    .single();
}

export async function updateTypeConge(id, { label, est_deductible }) {
  return supabase
    .from('typeconge')
    .update({ label, est_deductible })
    .eq('id', id)
    .select('id, label, est_deductible')
    .single();
}

export async function deleteTypeConge(id) {
  return supabase.from('typeconge').delete().eq('id', id);
}
