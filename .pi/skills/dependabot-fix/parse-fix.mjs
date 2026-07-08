import { dirname } from "node:path";

// ponytail: pure alert -> fix steps. cwd from manifest so it works at repo root or in workspaces/crates.
export function planFix(alert) {
	const { ecosystem, package: pkg, manifest, fixed } = alert;
	if (!fixed) throw new Error(`no fixed version for ${pkg}`);
	const cwd = dirname(manifest || ".") || ".";
	switch (ecosystem) {
		case "npm":
			return [{ run: `pnpm add ${pkg}@${fixed}`, cwd }];
		case "rust":
		case "cargo":
			return [{ run: `cargo update -p ${pkg} --precise ${fixed}`, cwd }];
		default:
			throw new Error(
				`unsupported ecosystem: ${ecosystem} (pkg ${pkg}); extend planFix`,
			);
	}
}
