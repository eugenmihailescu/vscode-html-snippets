# vscode-html-snippets
Provides a set of custom HTML snippets for VSCode

This package provides a script that fetches a set of Sublime HTML snippets from an external Github repository ([joshnh/HTML-Snippets](https://github.com/joshnh/HTML-Snippets)), then parses and builds the VSCode equivalent.

## Install this package

Assuming that you have already NodeJS installed on your system then just run the command below. Otherwise read the [Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/) on [nodejs.org](https://nodejs.org) website.

```
cd /path/to/clone-this-repo
git clone git://github.com/eugenmihailescu/vscode-html-snippets
cd ./vscode-html-snippets
```

## Build the VSCode HTML snippets

The script fetches, parses and builds the HTML snippets for the given `snippets` Github repositories. On success writes a JSON object either to a given output file or, when not specified, to the standard output.

First thing first, make sure your current directory is the right one:

```
cd /path/to/clone-this-repo/vscode-html-snippets
```

Then, to write the snippets to a file (eg. ~/.config/Code Insiders/User/snippets/`html-snippets.code-snippets`) run the following command at your terminal:

```
npm run build -- /path/to/my-snippets.code-snippets
```

or if you prefer to output the result to the standard output then:

```
npm run build
```

You are almost done! Keep reading...

## Install the snippets to VSCode

Please follow the [Creating your own snippets](https://code.visualstudio.com/docs/editor/userdefinedsnippets) instructions at VSCode website.