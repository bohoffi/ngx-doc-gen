<img src="https://raw.githubusercontent.com/bohoffi/ngx-doc-gen/develop/assets/logo.svg" width="150">

<!-- variables -->
[npm-image]: https://badge.fury.io/js/ngx-doc-gen.svg
[npm-url]: https://www.npmjs.com/package/ngx-doc-gen

# ngx-doc-gen 📚 [![npm version](https://img.shields.io/npm/v/ngx-doc-gen.svg)](https://www.npmjs.com/package/ngx-doc-gen)

> Automatically generate your library's API docs using Angular CLI or NX.

## Credits <a name="credits"></a>

The initial spark was given by the folks from the Angular team ([angular/components](https://github.com/angular/components)) who are using a perfectly working base implementation on documentation generation utilizing [Dgeni](https://github.com/angular/dgeni).

Props to those who deserve it 🍻

Most of the code as well as the templates and styles originate from their repository.

## 📕 Installation / Configuration

Using NX:
```bash
npm install --save-dev ngx-doc gen
nx generate ngx-doc-gen:configure
```

Using Angular CLI
```bash
ng add ngx-doc-gen
```

Those calls will add a `doc-gen` target similiar to the `build` one to all touched library projects.

## 🤖 Generation

Using NX:
```bash
nx run <project>:doc-gen
```

Using Angular CLI:
```bash
ng doc-gen <project>
```

While generation is running ngx-doc-gen will scan the given library for its entrypoints  - or entrypoint if there is just one - and extract the public API. The heavy lifting is done by Dgeni.

After extraction it categorizes your API in like modules, services, etc. - just like its done when looking at the Angular Material docs - and processes specific templates.

After everything is done ngx-doc-gen will output an HTML file per entrypoint into the output directory (read on for configuration).

## 📖 Configuration options (`configure` / `ng add`)

#### `--projects`

* Type: `string[]`
* Defines the libraries which should get configured for documentation generation
* Will throw an error if a project is listed which does not exist in the workspace
* Default: `[]`
* Example:
  * NX: `ng generate ngx-doc-gen:configure --projects lib-a,lib-b`
  * Angular CLI: `ng add ngx-doc-gen --projects lib-a,lib-b`
  * Both examples will only configure the given library projects

If not provided or left empty - the default - `configure` (Generator) and `ng add` (Angular CLI) will scan your workspace for all __buildable__ library projects and condigures them for documentation generation.

## ⚙️ Generation options

### Per CLI

#### `--log-level`

* Type: `'error' | 'warn' | 'debug' | 'verbose'`
* Defines the log level Dgeni uses while generation
* Default: `'warn'`

#### `--output-path`

* Type: `Path`
* Defines the output path for the generated files (relative to working directory)
* Default: `'docs'`

#### `--exclude-base`

* Type: `string[]`
* Defines base clases to exclude from generation
* Default: `[]`
* Example:
  * Your API contains a service extending `Observable` which would include members like `subscribe()` in your documentation. This could be prevented as follows:
  * `--exclude-base Observable`

#### `--dry-run`

* Type: `boolean`
*  Would let the entrypoint scanning run without generating any documentation
* Default: `false`

### Per workspace config (`angular.json` / `workspace.json` / `project.json`)

Every CLI parameter can also be bound to the `doc-gen` target in your workspace configuration so you don't have to pass them on every CLI call.

```json
// Example given for a project.json
...
"<project>": {
  "targets": {
    "doc-gen": {
      "executor": "ngx-doc-gen:generate",
      "options": {
        "logLevel": "verbose",
        "outputPath": "./docs/libs/<project>",
        "excludeBase": [
          "Observable"
        ]
      }
    }
  }
}
...
```

## 🎨 Styling

As the generated docs are just plain HTML files you apply whatever styling you want. For convinience ngx-doc-gen comes with two SCSS mixins.

### `core`

Applies some general styles for font, spacing, borders, etc. Just include the mixing in your root stylesheet.

```scss
@use 'ngx-doc-gen/styles' as ngx-doc-gen;

@include ngx-doc-gen.core();
```

### `docs-theme`

Applies some Angular Material touch. Just pass your Angular Material theme into the mixin.

```scss
@use 'ngx-doc-gen/styles/theming' as ngx-doc-gen;

@include ngx-doc-gen.docs-theme($theme);
```
