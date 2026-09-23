import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  type AccessibilityPlugin,
  type AccessibilityPreferences,
  type AccessibilityStorage,
  type PreferencePatch,
} from './types';

export const ACCESSIBILITY_STORAGE_KEY = 'a11y-toolkit:prefs';
const SAVED_PREFERENCES_SUFFIX = ':saved';
const PROFILES_SUFFIX = ':profiles';

export interface AccessibilityContextValue {
  preferences: AccessibilityPreferences;
  setPreferences: (preferences: AccessibilityPreferences) => void;
  updatePreferences: (patch: PreferencePatch) => void;
  savePreferences: () => void;
  loadPreferences: () => void;
  savedProfiles: readonly string[];
  saveProfile: (name: string) => void;
  loadProfile: (name: string) => void;
  deleteProfile: (name: string) => void;
  resetPreferences: () => void;
  plugins: readonly AccessibilityPlugin[];
  registerPlugin: (plugin: AccessibilityPlugin) => () => void;
}

export interface AccessibilityProviderProps extends PropsWithChildren {
  defaultPreferences?: Partial<AccessibilityPreferences>;
  storage?: AccessibilityStorage | null;
  storageKey?: string;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function browserStorage(): AccessibilityStorage | null {
  return typeof window === 'undefined' ? null : window.localStorage;
}

function mergePreferences(
  defaults: AccessibilityPreferences,
  patch?: Partial<AccessibilityPreferences>,
): AccessibilityPreferences {
  return {
    ...defaults,
    ...patch,
    version: 1,
    visual: { ...defaults.visual, ...patch?.visual },
    reading: { ...defaults.reading, ...patch?.reading },
    interaction: { ...defaults.interaction, ...patch?.interaction },
    custom: { ...defaults.custom, ...patch?.custom },
  };
}

function readProfiles(storage: AccessibilityStorage | null, storageKey: string) {
  if (!storage) return {} as Record<string, AccessibilityPreferences>;
  try {
    return (JSON.parse(storage.getItem(`${storageKey}${PROFILES_SUFFIX}`) ?? '{}') ?? {}) as Record<
      string,
      AccessibilityPreferences
    >;
  } catch {
    return {} as Record<string, AccessibilityPreferences>;
  }
}

export function AccessibilityProvider({
  children,
  defaultPreferences,
  storage = browserStorage(),
  storageKey = ACCESSIBILITY_STORAGE_KEY,
}: AccessibilityProviderProps) {
  const defaults = useMemo(
    () => mergePreferences(DEFAULT_ACCESSIBILITY_PREFERENCES, defaultPreferences),
    [defaultPreferences],
  );
  const [preferences, setPreferencesState] = useState<AccessibilityPreferences>(() => {
    if (!storage) return defaults;

    try {
      const saved = storage.getItem(storageKey);
      return saved
        ? mergePreferences(defaults, JSON.parse(saved) as AccessibilityPreferences)
        : defaults;
    } catch {
      return defaults;
    }
  });
  const [plugins, setPlugins] = useState<readonly AccessibilityPlugin[]>([]);
  const [savedProfiles, setSavedProfiles] = useState<readonly string[]>(() =>
    Object.keys(readProfiles(storage, storageKey)).sort(),
  );

  useEffect(() => {
    if (!storage) return;
    storage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences, storage, storageKey]);

  const setPreferences = useCallback((next: AccessibilityPreferences) => {
    setPreferencesState((current) => mergePreferences(current, next));
  }, []);

  const updatePreferences = useCallback((patch: PreferencePatch) => {
    setPreferencesState((current) => mergePreferences(current, patch));
  }, []);

  const savePreferences = useCallback(() => {
    if (!storage) return;
    storage.setItem(`${storageKey}${SAVED_PREFERENCES_SUFFIX}`, JSON.stringify(preferences));
  }, [preferences, storage, storageKey]);

  const loadPreferences = useCallback(() => {
    if (!storage) return;
    try {
      const saved =
        storage.getItem(`${storageKey}${SAVED_PREFERENCES_SUFFIX}`) ?? storage.getItem(storageKey);
      if (saved) setPreferencesState(mergePreferences(defaults, JSON.parse(saved)));
    } catch {
      // Invalid storage data must not stop the host application from rendering.
    }
  }, [defaults, storage, storageKey]);

  const saveProfile = useCallback(
    (name: string) => {
      const profileName = name.trim();
      if (!storage || !profileName) return;
      const profiles = readProfiles(storage, storageKey);
      profiles[profileName] = preferences;
      storage.setItem(`${storageKey}${PROFILES_SUFFIX}`, JSON.stringify(profiles));
      setSavedProfiles(Object.keys(profiles).sort());
    },
    [preferences, storage, storageKey],
  );

  const loadProfile = useCallback(
    (name: string) => {
      const profile = readProfiles(storage, storageKey)[name];
      if (profile) setPreferencesState(mergePreferences(defaults, profile));
    },
    [defaults, storage, storageKey],
  );

  const deleteProfile = useCallback(
    (name: string) => {
      if (!storage) return;
      const profiles = readProfiles(storage, storageKey);
      delete profiles[name];
      storage.setItem(`${storageKey}${PROFILES_SUFFIX}`, JSON.stringify(profiles));
      setSavedProfiles(Object.keys(profiles).sort());
    },
    [storage, storageKey],
  );

  const resetPreferences = useCallback(() => {
    setPreferencesState(defaults);
  }, [defaults]);

  const registerPlugin = useCallback((plugin: AccessibilityPlugin) => {
    setPlugins((current) => {
      if (current.some((registered) => registered.id === plugin.id)) {
        throw new Error(`Duplicate accessibility plugin: ${plugin.id}`);
      }
      return [...current, plugin];
    });
    return () =>
      setPlugins((current) => current.filter((registered) => registered.id !== plugin.id));
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      preferences,
      setPreferences,
      updatePreferences,
      savePreferences,
      loadPreferences,
      savedProfiles,
      saveProfile,
      loadProfile,
      deleteProfile,
      resetPreferences,
      plugins,
      registerPlugin,
    }),
    [
      deleteProfile,
      loadPreferences,
      loadProfile,
      plugins,
      preferences,
      registerPlugin,
      resetPreferences,
      savePreferences,
      saveProfile,
      savedProfiles,
      setPreferences,
      updatePreferences,
    ],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used inside AccessibilityProvider.');
  return context;
}
