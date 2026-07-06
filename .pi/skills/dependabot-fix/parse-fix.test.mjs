import { test } from "node:test";
import assert from "node:assert/strict";
import { planFix } from "./parse-fix.mjs";

test("npm alert -> pnpm add at repo root", () => {
	const steps = planFix({
		ecosystem: "npm",
		package: "react",
		manifest: "package.json",
		fixed: "19.2.0",
	});
	assert.deepEqual(steps, [{ run: "pnpm add react@19.2.0", cwd: "." }]);
});

test("rust alert (transitive, real glib case) -> cargo update --precise in crate dir", () => {
	const steps = planFix({
		ecosystem: "rust",
		package: "glib",
		manifest: "src-tauri/Cargo.lock",
		fixed: "0.20.0",
	});
	assert.deepEqual(steps, [
		{ run: "cargo update -p glib --precise 0.20.0", cwd: "src-tauri" },
	]);
});

test("cargo ecosystem is an alias for rust", () => {
	const steps = planFix({
		ecosystem: "cargo",
		package: "glib",
		manifest: "Cargo.lock",
		fixed: "0.20.0",
	});
	assert.deepEqual(steps, [
		{ run: "cargo update -p glib --precise 0.20.0", cwd: "." },
	]);
});

test("npm alert in a workspace subdir resolves cwd from manifest", () => {
	const steps = planFix({
		ecosystem: "npm",
		package: "lodash",
		manifest: "packages/cli/package.json",
		fixed: "4.17.21",
	});
	assert.deepEqual(steps, [
		{ run: "pnpm add lodash@4.17.21", cwd: "packages/cli" },
	]);
});

test("unsupported ecosystem throws with a clear message", () => {
	assert.throws(
		() =>
			planFix({
				ecosystem: "pip",
				package: "django",
				manifest: "requirements.txt",
				fixed: "4.2",
			}),
		/unsupported ecosystem: pip/,
	);
});

test("missing fixed version throws", () => {
	assert.throws(
		() =>
			planFix({
				ecosystem: "npm",
				package: "x",
				manifest: "package.json",
				fixed: undefined,
			}),
		/no fixed version for x/,
	);
});
