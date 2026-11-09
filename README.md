# Su πtmd

Microapp en español para buscar cumpleaños, fechas de nacimiento y secuencias de 1 a 24 dígitos hasta en los primeros **10,000,000 decimales de π**. Al abrir carga automáticamente los diez millones; la primera búsqueda ya revisa todo el rango.

**Aplicación publicada:** https://pi-su-ptm.vercel.app/

## Funciones

- Viaje animado desde `3.14159…` hasta la primera coincidencia o el límite del conjunto de datos. El recorrido se acelera y salta decimales; no reproduce cada cifra.
- Formatos mes/día/año o día/mes/año, con año de dos o cuatro dígitos.
- Navegación por todas las coincidencias y copia de resultados.
- Carga automática de 10 millones de decimales en cinco bloques, con progreso y reintento si falla la conexión. La búsqueda se habilita cuando llega la secuencia completa.
- Oráculo de deceso ficticio, causas cósmicas y otra línea temporal. Es una broma matemática sin valor predictivo.
- Búsquedas y cálculos locales: la fecha introducida no se envía a ningún servidor.
- Interfaz adaptable, navegación con teclado y respeto al movimiento reducido.

## Ejecutar

Requiere Node.js; no usa dependencias externas.

```sh
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Abre http://localhost:8080. Debe servirse por HTTP para cargar los módulos y el archivo de decimales.

## Desplegar en Vercel

Importa este repositorio. `vercel.json` configura el comando `node scripts/build.mjs` y el directorio `dist`.

## Oráculo ficticio

1. Nacimiento y fecha actual se codifican como `MMDDAAAA` y se suman como enteros.
2. Índice = `(suma + universo × 314159) módulo (2,000,000 − 11)`.
3. Se toman 12 dígitos reales de π desde ese índice.
4. Días = `(fragmento módulo 25,550) + 1`.
5. Fecha ficticia = fecha actual + días.

La fecha actual es la del dispositivo. El mismo nacimiento, día, conjunto de decimales y universo producen el mismo resultado. La fórmula aparece en pantalla.

## Precisión

La posición 1 es el primer decimal, el `1` de `3.14159…`. La ausencia de una secuencia solo se refiere al rango revisado, indicado en pantalla. No está demostrado que π contenga toda secuencia posible.

El rango de búsqueda no altera el oráculo: su receta sigue usando exclusivamente los primeros dos millones de decimales.

`scripts/generate-pi.cpp` contiene el generador de decimales mediante Chudnovsky y GMP. El archivo de datos está incluido.

Para regenerar los bloques: compila el generador con `g++ -O3 scripts/generate-pi.cpp -lgmpxx -lgmp -o /tmp/generate-pi`, calcula `10000000` decimales y pasa ese archivo a `node scripts/prepare-expanded.mjs /ruta/pi-10m.txt`. El build comprueba la longitud y SHA-256 de cada bloque.
