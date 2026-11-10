import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import type { GameSystemRecord, HomebrewBase, HomebrewStructure } from '../systems/homebrew/types';
import { presetStructure } from '../systems/homebrew/presets';

/** Systèmes homebrew du MJ connecté (table game_systems). */
export function useGameSystems(userId: string | undefined, showAlert: (title: string, text: string) => void) {
  const [systems, setSystems] = useState<GameSystemRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadSystems = useCallback(async (): Promise<GameSystemRecord[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('game_systems')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false });
    // Table absente (migration non appliquée) : liste vide, sans alerte.
    return error ? [] : (data || []) as GameSystemRecord[];
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    loadSystems().then(list => {
      if (cancelled) return;
      setSystems(list);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [loadSystems]);

  const fetchSystems = async () => setSystems(await loadSystems());

  async function createSystem(name: string, base: HomebrewBase): Promise<GameSystemRecord | null> {
    const { data, error } = await supabase
      .from('game_systems')
      .insert([{ name: name.trim(), base, structure: presetStructure(base) }])
      .select('*')
      .single();
    if (error || !data) {
      showAlert('Erreur', error?.message || 'Impossible de créer le système.');
      return null;
    }
    setSystems(prev => [data as GameSystemRecord, ...prev]);
    return data as GameSystemRecord;
  }

  async function saveSystem(id: string, fields: { name: string; description: string | null; structure: HomebrewStructure }) {
    const { data, error } = await supabase
      .from('game_systems')
      .update({ name: fields.name.trim(), description: fields.description?.trim() || null, structure: fields.structure })
      .eq('id', id)
      .select('*')
      .single();
    if (error || !data) {
      showAlert('Erreur', error?.message || 'Impossible d’enregistrer le système.');
      return false;
    }
    setSystems(prev => prev.map(s => (s.id === id ? data as GameSystemRecord : s)));
    return true;
  }

  async function deleteSystem(id: string) {
    const { error } = await supabase.from('game_systems').delete().eq('id', id);
    if (error) {
      showAlert('Erreur', error.message || 'Impossible de supprimer le système.');
      return false;
    }
    setSystems(prev => prev.filter(s => s.id !== id));
    return true;
  }

  return { systems, loaded, fetchSystems, createSystem, saveSystem, deleteSystem };
}
