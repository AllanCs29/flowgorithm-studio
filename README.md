# Flowgorithm Studio

**Academia visual para aprender lógica de programación desde cero**, mediante diagramas de flujo, lecciones interactivas y un editor en español. Disponible en Mac, PC y como aplicación web instalable (PWA) para iPhone.

**Versión de esta entrega:** **1.4.7 · Corrección de compilación TypeScript para las pruebas móviles; mantiene las mejoras UX de v14.6**.

[**Abrir la aplicación publicada**](https://allancs29.github.io/flowgorithm-studio/) · [Informe de auditoría](docs/AUDITORIA-v14.4.md) · [Guía para probarla en iPhone](docs/PRUEBAS-UX-MOVIL.md) · [Compatibilidad](docs/COMPATIBILITY.md)

> Proyecto educativo independiente, inspirado en los diagramas de Flowgorithm. **No es Flowgorithm oficial ni promete compatibilidad completa con todos los archivos `.fprg`.**

## Qué incluye

| Área | Contenido |
| --- | --- |
| Curso | **16 clases**, distribuidas en **11 niveles**: bloques, variables, Entrada/Salida, decisiones, ciclos, acumuladores, funciones y retos integradores |
| Biblioteca | **100 ejercicios** en 11 mundos: **94 programáticos** y **6 de interacción con el editor** |
| Evaluación | **224 casos de prueba** configurados para las 94 prácticas programáticas; donde procede también se comprueba la estructura del algoritmo |
| Editor | Declarar, Asignar, Entrada, Salida, Si, Mientras, Hacer mientras, Para, funciones y otros bloques |
| Simulación | Ejecución paso a paso, inspección de variables, seguimiento visual de decisiones y resultado |
| Código | Generadores de Python, JavaScript, C, C++ y Java, **con limitaciones explícitas** |
| Trabajo sin señal | PWA instalable desde HTTPS, precaché del programa y progreso local por navegador/dispositivo |

Los **224 casos** son datos sintéticos de prueba definidos en el repositorio; **no son estadísticas de estudiantes reales ni validan por sí solos la usabilidad con principiantes**. Consulta el [informe de auditoría](docs/AUDITORIA-v14.4.md) para interpretar la cobertura.

## Para empezar a aprender

1. Entra a la aplicación y elige **Empezar mi primera clase**.
2. **Lee la meta del ejercicio** antes de tocar el diagrama. En iPhone se presenta compacta encima del diagrama; tócala para expandirla y consultar «Qué revisaré» o la ayuda.
3. En el editor, toca una pieza para editarla o mantén pulsado sobre ella para moverla. **Los datos que debes aprender a escribir aparecen vacíos** cuando insertas bloques nuevos.
4. **Intenta resolverlo a tu manera**. En móvil, no se señala automáticamente el bloque correcto: «¿Necesitas ayuda?» abre los pasos y permite activar el resaltado opcional.
5. Ejecuta el diagrama y usa **Comprobar mi reto**. Si no pasa, consulta la explicación y la pista y vuelve a intentarlo.
6. Puedes **repasar clases anteriores** sin borrar tu progreso.

**Sintaxis importante de Flowgorithm:** en Asignar, `total = 7 + 8` guarda un resultado; en Si, `=` compara. Para unir textos se usa `&` (`"Hola " & nombre`); para sumar números, `+`. [Referencia oficial sobre operadores](https://flowgorithm.org/documentation/operators.html).

## Ejecutar desde la Terminal de Mac

Requisitos: Node.js **22** recomendado y npm. Desde la carpeta del proyecto:

```bash
npm install --include=dev
npm run verify
npm run dev:lan
```

Abre `http://localhost:5173` en Mac. En el iPhone conectado al mismo Wi-Fi, abre la URL **Network** que imprime Vite. **La dirección local HTTP sirve para desarrollar y revisar la interfaz; no instala offline en iPhone**.

Comandos adicionales:

| Comando | Para qué sirve |
| --- | --- |
| `npm run dev` | Servidor de desarrollo local |
| `npm run dev:lan` | Acceso de otros dispositivos en la misma red |
| `npm run verify` | Revisión de estructura móvil, ESLint, Vitest y compilación |
| `npm test` | Pruebas automáticas |
| `npm run build` | Compilación de producción en `dist/` con paquete offline |
| `npm run preview` | Revisar la compilación local |

**Dependencias:** esta entrega no incluye `node_modules` ni `package-lock.json`. La instalación en CI utiliza versiones exactas del `package.json`, pero hace falta generar, comprobar y subir un lockfile para máxima reproducibilidad. No uses `npm audit fix --force` sin revisar los cambios.

## Publicar en GitHub Pages

El archivo [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) **verifica las pruebas, compila y publica** el proyecto en cada cambio subido a `main`. Si `npm run verify` falla, se interrumpe el despliegue.

1. En GitHub Desktop, abre este repositorio y guarda tus cambios con **Commit to main**.
2. Haz **Push origin**.
3. En GitHub, abre **Actions → Publicar Flowgorithm Studio** y confirma que la ejecución quede verde.
4. Entra a [la aplicación publicada](https://allancs29.github.io/flowgorithm-studio/).

El workflow configura `BASE_PATH=/flowgorithm-studio/` para que Vite cargue correctamente las rutas. **No publiques el `index.html` original directamente**: React debe compilarse a la carpeta `dist`.

## Instalarla en el iPhone y estudiar offline

Abre el enlace HTTPS en **Safari normal**, espera a que indique *Listo para estudiar sin internet*, pulsa **Compartir → Agregar a pantalla de inicio** y ábrela una vez desde el ícono con conexión. Después prueba el modo Avión. El almacenamiento de iOS puede ser eliminado por el sistema en determinadas circunstancias; guarda respaldos periódicos.

**No hay inicio de sesión ni sincronización Firebase en esta versión.** El progreso se conserva **localmente en cada dispositivo**. La app no incorpora análisis de uso de estudiantes en un servidor. Instalarla en la pantalla de inicio no la convierte en una aplicación nativa distribuida por App Store.

## Auditoría, UX y documentación

- [Auditoría v14.4 y datos de prueba](docs/AUDITORIA-v14.4.md)
- [Guía de pruebas de usabilidad en iPhone](docs/PRUEBAS-UX-MOVIL.md)
- [Criterios didácticos y lenguaje](docs/GUIA-DIDACTICA.md)
- [Compatibilidad con Flowgorithm original](docs/COMPATIBILITY.md)
- [Arquitectura](ARCHITECTURE.md)
- [Historial de versiones](CHANGELOG.md)

Los `README-V*.md` existentes se conservan **solo como registro histórico** y pueden describir funcionalidades anteriores. Este README es la referencia vigente.

## Límites y contribuciones

No todos los operadores, archivos, arreglos, funciones intrínsecas y conversiones están implementados igual que en Flowgorithm original. La generación de C puede rechazar algunas concatenaciones de cadenas con un mensaje explícito para evitar generar código incorrecto. No existe todavía una prueba instrumental completa de accesibilidad ni un estudio de usabilidad con muestra representativa.

Si encuentras un fallo, abre un **Issue** con la clase/reto, los pasos para reproducirlo, lo esperado, lo ocurrido y el dispositivo. **No compartas contraseñas, claves ni archivos con datos privados.** No se ha elegido una licencia de reutilización para este repositorio; consulta a la persona propietaria antes de redistribuir o reutilizar el código.
