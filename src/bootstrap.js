import download from "download-git-repo";
import { readFile } from "fs";
import { glob } from "glob";
import { mkdir, track } from "temp";
import { parseString } from "xml2js";
import pkgjson from "../package.json";

/**
 * @description Write the given data to the stream
 * @param {Writable} writer A writtable stream (eg. filestream|stdout, etc)
 * @param {Object} data The data to write
 * @returns {Promise}
 */
const writeOutput = (writer, data) => {
	return new Promise((resolve, reject) => {
		writer.on("error", () => reject(false));
		writer.on("finish", () => resolve(data));
		writer.write(JSON.stringify(data, null, 2), "utf8");
		writer.end();
	});
};

/**
 * @description Parse the given Sublime XML-formatted snippet file
 * @param {String} filename The source snippet filename
 * @returns {Promise}
 */
const parseSnippetFile = filename => {
	return new Promise((resolve, reject) => {
		// open the snippet file
		readFile(filename, function(err, buffer) {
			if (err) {
				reject(err);
			}

			const xml = buffer.toString("utf8");

			// parse the snippet's XML
			parseString(xml, function(err, json) {
				if (err) {
					reject(err);
				}
				const sublime_snippet = json.snippet;

				// build the target VSCode snippet entry
				const vscode_snippet = {
					prefix: sublime_snippet.tabTrigger.join(),
					scope: "html",
					body: sublime_snippet.content.join("").split("\n"),
					description: sublime_snippet.description.join()
				};

				resolve({
					[sublime_snippet.tabTrigger]: vscode_snippet
				});
			});
		});
	});
};

/**
 * @description Parses the given collection of Sublime XML-formatted snippet files
 * @param {Array} files The files
 * @param {Writable} writer A writtable stream (eg. filestream|stdout, etc)
 * @param {callback} resolve A callback triggered on success
 * @param {callback} reject A callback triggered on error
 */
const parseSnippetFiles = (files, writer, resolve, reject) => {
	// schedule snippets parsing
	let promises = files.map(filename => parseSnippetFile(filename));

	// when all resolved or rejected
	Promise.all(promises)
		.then(snippets => {
			writeOutput(writer, Object.assign({}, ...snippets))
				.then(resolve)
				.catch(reject);
		})
		.catch(err => {
			reject(err);
		});
};

/**
/**
 * @description Builds the HTML snippet settings file for VSCode
 * @param {Writable} writer A writtable stream (eg. filestream|stdout, etc)
 * @return {Promise}
 */
const extractSnippets = writer => {
	return new Promise((resolve, reject) => {
		// Automatically track and cleanup temps at exit
		track();

		// create a tempdir
		mkdir("html-snippets", function(err, dirPath) {
			// fetch, parse and build the HTML snippets for each given repo in `snippets` (see packages.json)

			Object.keys(pkgjson.snippets.git).forEach(repo => {
				// download the source Github HTML snippets for Sublime
				download(repo, dirPath, { clone: false }, function(err) {
					if (err) {
						reject(err);
					}

					// iterate through snippets files
					glob(dirPath + pkgjson.snippets.git[repo], function(err, files) {
						if (err) {
							reject(err);
						}

						// schedule snippets parsing
						parseSnippetFiles(files, writer, resolve, reject);
					});
				});
			});
		});
	});
};

export default extractSnippets;
