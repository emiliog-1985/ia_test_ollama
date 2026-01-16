# React + TypeScript + Vite

Esta plantilla proporciona una configuración básica para que React funcione en Vite con HMR y algunas reglas de ESLint.

Actualmente, hay dos plugins oficiales disponibles:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) usa [Babel](https://babeljs.io/) (o [oxc](https://oxc.rs) cuando se usa en [rolldown-vite](https://vite.dev/guide/rolldown)) para actualización rápida.
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) usa [SWC](https://swc.rs/) para actualización rápida.

## Compilador de React

El compilador de React no está habilitado en esta plantilla debido a su impacto en el rendimiento de desarrollo y compilación. Para agregarlo, consulta [esta documentación](https://react.dev/learn/react-compiler/installation).

## Ampliación de la configuración de ESLint

Si está desarrollando una aplicación de producción, le recomendamos actualizar la configuración para habilitar las reglas de lint con reconocimiento de tipos:

```js
export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extends: [
// Otras configuraciones...

// Elimine tseslint.configs.recommended y reemplácelo con esto:

tseslint.configs.recommendedTypeChecked,
// Alternativamente, use esto para reglas más estrictas:

tseslint.configs.strictTypeChecked,
// Opcionalmente, agregue esto para reglas de estilo:

tseslint.configs.stylisticTypeChecked,

// Otras configuraciones...
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// otras opciones...
},
},
])
```

También puedes instalar [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) y [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) para las reglas de lint específicas de React:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
globalIgnores(['dist']),
{
files: ['**/*.{ts,tsx}'],
extensions: [
// Otras configuraciones...
// Habilitar reglas de pelusa para React
reactX.configs['recommended-typescript'],
// Habilitar reglas de pelusa para React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// Otras opciones...
},
},
])
```
