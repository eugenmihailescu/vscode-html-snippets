import extractSnippets from "./bootstrap";
import { Writable } from "stream";
import { inherits } from "util";

let memoryStream = {};

function MemoryStream() {
	Writable.call(this);
	memoryStream = new Buffer("");
}

inherits(MemoryStream, Writable);

MemoryStream.prototype._write = (chunk, encoding, callback) => {
	var buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, encoding);

	memoryStream = Buffer.concat([memoryStream, buffer]);

	callback();
};

it("downloads git + parse Sublime snippets => VSCode snippets", () => {
	expect.assertions(1);

	let writer = new MemoryStream();

	return extractSnippets(writer).then(data => {
		// the parsed `data` object and the written memoryStream are alike
		return expect(data).toMatchObject(JSON.parse(memoryStream.toString()));
	});
});
