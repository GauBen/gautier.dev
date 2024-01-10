import "@total-typescript/ts-reset";
import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface PageData {
      title?: string;
      description?: string;
    }
  }

  interface ViewTransition {
    updateCallbackDone: Promise<void>;
    ready: Promise<void>;
    finished: Promise<void>;
    skipTransition: () => void;
  }

  interface Document {
    startViewTransition(updateCallback: () => Promise<void>): ViewTransition;
  }
}
