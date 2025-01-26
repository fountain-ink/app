type SettingsEvent = "saved" | "error";
type Listener = (error?: string) => void;

class SettingsEvents {
  private listeners: Map<SettingsEvent, Set<Listener>> = new Map();

  on(event: SettingsEvent, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit(event: SettingsEvent, error?: string) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(error);
      }
    }
  }
}

export const settingsEvents = new SettingsEvents();
