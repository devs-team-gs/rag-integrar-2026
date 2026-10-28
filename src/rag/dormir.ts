/** Pausa la ejecución. Lo usan el ritmo de la ingesta y el reintento ante un 429. */
export const dormir = (ms: number): Promise<void> =>
  new Promise((resolver) => setTimeout(resolver, ms));
