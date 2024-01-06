/**
 * @type {import("@cspell/cspell-types").CSpellUserSettings}
 */
module.exports = {
	version: "0.2",
	language: "en",
	dictionaries: [
		"markdown",
		"bash",
		"git",
		"java",
		"typescript",
		"node",
		"npm",
	],
	words: [
		"risu",
		"risu's",
		"zenn",
		"lockb",
		"bunfig",
		"biomejs",
		"textlint",
		"textlintcache",
		"smarthr",
		"tamasfe",
		"esbenp",
		"humanwhocodes",
		"quickfix",
		"automerge",
		"proofdict",
		"taichi",
		"davidanson",
	],
	enableGlobDot: true,
	useGitignore: true,
	ignorePaths: [
		".git/",
		// ignore license files
		"LICENSE",
		"LICENSE_code",
		// ignore auto-generated files
		".gitignore",
		"bun.lockb",
		// ignore dictionary files
		"dict/",
	],
};
