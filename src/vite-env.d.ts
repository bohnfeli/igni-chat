/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_MATRIX_BACKEND?: "wasm";
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
