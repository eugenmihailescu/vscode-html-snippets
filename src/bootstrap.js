import download from "download-git-repo";
import { readFile, writeFile } from "fs";
import { glob } from "glob";
import { basename, extname } from "path";
import { mkdir, track } from "temp";
import { parseString } from "xml2js";

const colorOutput = (message, color, bright = "\x1b[1m") => {
	console.log("\x1b[0m" + (bright ? bright : "") + color + message + "\x1b[0m");
};

// poor's man help
if (process.argv.length < 3) {
	colorOutput(
		"Missing argument! The script's first argument should indicate the filename where the VSCode HTML snippets are going to be saved",
		"\x1b[41m"
	);

	console.log();

	colorOutput("Example:", "\x1b[32m");

	colorOutput(
		"\tnpm run " +
      basename(process.argv[1]) +
      " -- /path/to/vscode-snippets.file",
		"\x1b[33m"
	);

	console.log();
}

// output filename
const snippetFilename = process.argv[2];

// Automatically track and cleanup temps at exit
track();

// create a tempdir
mkdir("html-snippets", function(err, dirPath) {
	// download the source Github HTML snippets for Sublime
	download("joshnh/HTML-Snippets", dirPath, { clone: false }, function(err) {
		if (err) {
			throw err;
		}

		// iterate through snippets files
		glob(dirPath + "/**/*.sublime-snippet", function(err, files) {
			if (err) {
				throw err;
			}

			var vscode_snippets = {};

			files.forEach(filename => {
				// open the snippet file
				readFile(filename, function(err, buffer) {
					if (err) {
						throw err;
					}

					const xml = buffer.toString("utf8");

					// parse the snippet's XML
					parseString(xml, function(err, json) {
						if (err) {
							throw err;
						}
						const sublime_snippet = json.snippet;

						// build the target VSCode snippet entry
						const vscode_snippet = {
							prefix: sublime_snippet.tabTrigger.join(),
							scope: "html",
							body: sublime_snippet.content.join("").split("\n"),
							description: sublime_snippet.description.join()
						};

						vscode_snippets[
							"html-" + sublime_snippet.tabTrigger
						] = vscode_snippet;

						// write the snippets to the output file
						writeFile(
							snippetFilename,
							JSON.stringify(vscode_snippets, null, 2),
							function(err) {
								if (err) {
									throw err;
								}
								console.log(
									"- " + basename(filename).replace(extname(filename), "")
								);
							}
						);
					});
				});
			});
		});
	});
});
