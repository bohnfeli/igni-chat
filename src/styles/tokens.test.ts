import { describe, it, expect } from "vitest";
import tokensCss from "./tokens.css?raw";

describe("tokens.css", () => {
	it.each([
		["--color-canvas", "#131015"],
		["--color-surface", "#1b181d"],
		["--color-surface-high", "#232026"],
		["--color-surface-highest", "#2c2830"],
		["--color-primary", "#ff6a3d"],
		["--color-on-primary", "#1a0e08"],
		["--color-secondary", "#6c7278"],
		["--color-tertiary", "#6fb3ff"],
		["--color-neutral", "#2a262e"],
		["--color-on-surface", "#f3efea"],
		["--color-on-surface-muted", "#a39ca6"],
		["--color-verified", "#3ddc97"],
		["--color-error", "#ff5470"],
	] as const)("declares %s: %s", (name, value) => {
		expect(tokensCss).toContain(`${name}: ${value}`);
	});

	it.each([
		["--space-none", "0"],
		["--space-xs", "4px"],
		["--space-sm", "8px"],
		["--space-md", "16px"],
		["--space-lg", "24px"],
		["--space-xl", "32px"],
		["--space-2xl", "48px"],
		["--space-gutter", "16px"],
		["--space-margin", "24px"],
	] as const)("declares %s: %s", (name, value) => {
		expect(tokensCss).toContain(`${name}: ${value}`);
	});

	it.each([
		["--radius-none", "0px"],
		["--radius-sm", "4px"],
		["--radius-md", "8px"],
		["--radius-lg", "12px"],
		["--radius-xl", "18px"],
		["--radius-full", "9999px"],
	] as const)("declares %s: %s", (name, value) => {
		expect(tokensCss).toContain(`${name}: ${value}`);
	});

	it.each([
		["--font-display", "700 40px/1.1"],
		["--font-h1", "600 28px/1.15"],
		["--font-h2", "600 20px/1.2"],
		["--font-body-lg", "400 17px/1.5"],
		["--font-body-md", "400 15px/1.5"],
		["--font-body-sm", "400 13px/1.45"],
		["--font-label-md", "600 13px/1.2"],
		["--font-label-sm", "600 11px/1"],
		["--font-caption", "400 12px/1.3"],
		["--font-mono", "400 13px/1.4"],
	] as const)("%s starts with %s", (name, value) => {
		expect(tokensCss).toContain(`${name}: ${value}`);
	});

	it.each([
		["--font-display-tracking", "-0.02em"],
		["--font-h1-tracking", "-0.01em"],
		["--font-label-sm-tracking", "0.08em"],
	] as const)("declares %s: %s", (name, value) => {
		expect(tokensCss).toContain(`${name}: ${value}`);
	});

	it("uses Inter for text and JetBrains Mono for data", () => {
		expect(tokensCss).toContain('"Inter"');
		expect(tokensCss).toContain('"JetBrains Mono"');
	});
});
