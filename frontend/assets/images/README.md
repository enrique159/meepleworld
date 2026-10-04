# Imágenes de Inicio

[`create_table_background.jpg`](create_table_background.jpg) es la fotografía vertical del acceso «Crear mesa»: 1024 × 1536 px, proporción 2:3. Se recreó a partir de la fotografía de amigos jugando entregada por el responsable, usando la herramienta integrada ImageGen. El archivo generado se exportó como JPEG con calidad 88; no contiene texto ni degradado. Flutter aplica el recorte con `BoxFit.cover`, las esquinas redondeadas y el overlay morado.

La composición conserva la reunión y la iluminación cálida, y amplía el ambiente y la mesa hacia arriba y abajo. Es un recurso visual local, no una foto ni datos de una mesa publicada por un usuario.

## Prompt utilizado

Se conserva el texto exacto enviado al generador como referencia para futuras variantes:

```text
Use case: photorealistic-natural.
Asset type: portrait background photograph for the tall "Crear mesa" quick-action card in a mobile board-game app.
Input image 1: edit target and scene reference, the attached square photograph of friends playing board games around a wooden table in a warm living room.
Primary request: recreate and expand the scene vertically into a portrait image with aspect ratio 2:3 (1024 wide × 1536 high). Preserve the subject, warm amber indoor lighting, convivial mood, wooden gaming table, colorful dice and game pieces, smiling adult friends, cozy window and lamps. Recompose the original scene thoughtfully for the narrow portrait framing: keep the central friends and the gaming table clearly visible, with the table running down into the foreground; extend the room naturally above and the table/foreground below rather than stretching or merely cropping the square. Natural human faces and hands, realistic proportions and coherent perspective.
Composition/framing: friendly candid photograph, warm living room; main people and board-game action readable in the upper and middle area, quieter wooden table and foreground in the bottom quarter to allow a white UI label and plus icon overlay later.
Constraints: photo only; do not render any text, labels, icons, borders, rounded corners, purple gradient or UI. No watermark. Preserve the original board-game gathering theme and natural photographic detail.
```
