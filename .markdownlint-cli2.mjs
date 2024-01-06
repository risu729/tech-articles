import { gitignoreToMinimatch } from "@humanwhocodes/gitignore-to-minimatch";
import { readGitignoreFiles } from "eslint-gitignore";

// biome-ignore lint/nursery/noDefaultExport:
export default {
	config: {
		extends: "markdownlint/style/prettier",
		"no-bare-urls": false,
	},
	showFound: true,
	fix: true,
	globs: ["**/*.md"],
	ignores: [".git/", ...readGitignoreFiles({ cwd: import.meta.dir })].map(
		(ignorePattern) => gitignoreToMinimatch(ignorePattern),
	),
};
