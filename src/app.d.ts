import "unplugin-icons/types/svelte";

declare global {
  namespace App {
    interface PageData {
      title?: string;
      description?: string;
    }
  }
}

export {};
