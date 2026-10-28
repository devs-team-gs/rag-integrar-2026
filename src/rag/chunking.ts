/**
 * Cortar el markdown en pedazos indexables.
 *
 * Es una función pura a propósito: no depende de nada, así que no necesita ser
 * un servicio ni pasar por el contenedor de Nest. No todo tiene que ser
 * `@Injectable`. Además es la pieza que más se toca cuando el RAG responde mal,
 * y así se puede probar sin levantar la aplicación.
 */

export interface Chunk {
  seccion: string;
  contenido: string;
}

/** Menos que esto es un título suelto: no aporta nada al índice. */
const MIN_CARACTERES = 100;

/** Más que esto y el vector se difumina: el chunk habla de demasiadas cosas. */
const MAX_CARACTERES = 1500;

export function chunkear(markdown: string): Chunk[] {
  // Cortamos ANTES de cada "## " que esté al principio de una línea.
  // El lookahead (?=...) hace que el header quede dentro del pedazo que le sigue.
  const secciones = markdown.split(/\n(?=##\s)/);

  const chunks: Chunk[] = [];

  for (const seccion of secciones) {
    const texto = seccion.trim();
    if (texto.length < MIN_CARACTERES) continue;

    const titulo = texto.match(/^#{2,3}\s+(.+)$/m)?.[1] ?? 'Sin sección';

    if (texto.length <= MAX_CARACTERES) {
      chunks.push({ seccion: titulo, contenido: texto });
      continue;
    }

    // Sección larga: la partimos por párrafos, acumulando hasta el máximo.
    // Cortar por párrafos (y no cada N caracteres) evita partir una idea
    // —o peor, un bloque de código— por la mitad.
    //
    // OJO con el `&& acumulado` de la condición: si un párrafo YA VIENE más
    // largo que MAX_CARACTERES, no hay dónde cortarlo sin romperlo, así que
    // pasa entero. Por eso en la base vas a encontrar chunks que superan el
    // máximo — típicamente bloques de SQL o tablas largas. Es a propósito:
    // MAX_CARACTERES es el tamaño al que acumulamos, no un tope duro.
    let acumulado = '';
    for (const parrafo of texto.split(/\n\n+/)) {
      if (acumulado.length + parrafo.length > MAX_CARACTERES && acumulado) {
        chunks.push({ seccion: titulo, contenido: acumulado.trim() });
        acumulado = '';
      }
      acumulado += parrafo + '\n\n';
    }
    if (acumulado.trim().length >= MIN_CARACTERES) {
      chunks.push({ seccion: titulo, contenido: acumulado.trim() });
    }
  }

  return chunks;
}
