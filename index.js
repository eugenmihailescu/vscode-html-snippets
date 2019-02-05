import extractSnippets from "./src/bootstrap";
import { createWriteStream } from "fs";

// if the first argument is given then it is regarded as the output filename
// otherwise by default we are outputing to stdout

let outputFilename = process.argv.length > 2 ? process.argv[2] : false;
let writer = outputFilename
	? createWriteStream(outputFilename)
	: process.stdout;

extractSnippets(writer)
	.then(data => {
		if (outputFilename) {
			console.log(
				"The following HTML snippets were written to " + outputFilename + ":"
			);
		}
		console.log(
			Object.keys(data)
				.map(key => " \x1b[0m\x1b[1m\x1b[32m\u2713 \x1b[0m " + key)
				.join("\n")
		);
	})
	.catch(reason => {
		console.log(reason);
	});
