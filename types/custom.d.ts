// Global TypeScript definitions
import * as Bootstrap from 'bootstrap';

declare global {
  interface Window {
    bootstrap: typeof Bootstrap;
    $notification: {
      success: (message: string, title?: string, duration?: number) => void;
      error: (message: string, title?: string, duration?: number) => void;
      info: (message: string, title?: string, duration?: number) => void;
      warning: (message: string, title?: string, duration?: number) => void;
    };
  }
}

// This export is needed to make this a module
export {};
