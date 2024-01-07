// biome-ignore lint/nursery/noDefaultExport:
export default {
	config: {
		extends: "markdownlint/style/prettier",
		"single-h1": false,
		"no-bare-urls": false,
	},
	fix: true,
	globs: ["**/*.md"],
	ignores: ["node_modules"],
};
