# Flowgorithm Studio v14.7 — Corrección del build de pruebas móviles

Esta versión resuelve el error de compilación de TypeScript `TS2322` en `tests/mobile-ux-v146.test.ts:13`.

## Causa

`beforeEach(() => vi.useFakeTimers())` devuelve `VitestUtils`, mientras que Vitest espera que el hook no devuelva nada o devuelva una función de limpieza. La corrección usa llaves para que el retorno sea `void`.

## Cambios

- Se corrigió el `beforeEach` del test de gestos móviles.
- Se actualizó la versión de `package.json` a `1.4.7`.
- No cambió la UI ni el intérprete ni los retos.

## Instalar en macOS

```bash
cd ~/Proyectos
unzip -o ~/Downloads/Flowgorithm-Studio-v14.7-Build-TS-Movil-Corregido.zip -d ~/Proyectos
cd ~/Proyectos/Flowgorithm-Studio
npm install --include=dev
npm run verify
npm run dev:lan
```

**No hacer push a GitHub hasta que la verificación termine correctamente.** El ZIP no incluye `node_modules` ni `.git`, y sobrescribe el contenido sin eliminar tu repositorio.
