// biome-ignore lint/nursery/noDefaultExport:
export default {
	config: {
		extends: "markdownlint/style/prettier",
		"no-bare-urls": false,
	},
	showFound: true,
	fix: true,
	globs: ["**/*.md"],
	ignores: ["node_modules"],
};
