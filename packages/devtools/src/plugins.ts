import type { DevtoolsPlugin } from './types';

/**
 * Stores developer-tooling metadata only. Feature execution remains owned by
 * the host application and its core AccessibilityProvider.
 */
export class DevtoolsPluginRegistry {
  private readonly plugins = new Map<string, DevtoolsPlugin>();

  register(plugin: DevtoolsPlugin): () => void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`A plugin with id "${plugin.id}" is already registered.`);
    }

    this.plugins.set(plugin.id, plugin);
    return () => this.plugins.delete(plugin.id);
  }

  list(): readonly DevtoolsPlugin[] {
    return [...this.plugins.values()];
  }
}
