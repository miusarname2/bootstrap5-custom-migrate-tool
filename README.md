# Bootstrap 5 Migration & Tempus Dominus Integration Tool

[![LICENSE: MIT](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://raw.githubusercontent.com/miusarname2/bootstrap5-custom-migrate-tool/refs/heads/master/LICENSE)

A flexible Gulp‑based command‑line script to upgrade your Bootstrap 4 projects to Bootstrap 5, refresh common CDNs, and optionally add or remove Tempus Dominus date‑picker integrations. Includes automated JSCodeshift transforms for date‑picker and modal components.

## Features

- **Bootstrap 4 → 5 Migration**: Automatically replace legacy Bootstrap 4 class names, utility classes, and deprecated components (e.g. `.jumbotron`, `.media`) with Bootstrap 5 equivalents.
- **Data‑Attribute Updates**: Rename `data-*` attributes to `data-bs-*` across HTML and templates.
- **CDN Link Refresh**: Swap out local scripts/styles for the latest CDN URLs:
  - Popper 2
  - Bootstrap 5 CSS/JS
  - jQuery 3.7
  - Font Awesome 6
  - DataTables and bootstrap-select v5
- **Multi‑File & Template Support**: Works on any glob of files—including HTML, ASPX, CSHTML, EJS, ERB, HBS, JSP, PHP, Vue, TS/JS, Twig, and more.
- **Tempus Dominus Integration**:
  - **Add**: Prompt to inject Tempus Dominus CSS/JS into `<head>` or replace old scripts; support initializing multiple calendar IDs via interactive prompts.
  - **Remove**: Strip out Tempus Dominus v4 CSS/JS references if no longer needed.
- **Automated JSCodeshift**: After migration, runs the following transforms on your source files:
  1. **replace-datetimepicker.js** – Converts `$("#myPicker").datetimepicker()` calls into `new TempusDominus(document.getElementById('myPicker'), options)`.
  2. **replace-modal.js** – Applies custom modal transformations (see script for details).
- **Verbose Mode**: Optionally log each file processed and summary counts of changes.

## Installation

```bash
git clone https://github.com/your-org/bootstrap-5-migrate-tool.git
cd bootstrap-5-migrate-tool
npm install
```

## Usage

1. Copy your project files (HTML, templates, JS, etc.) into the `src/` folder (or point `--src` to your codebase).
2. Run the migration task:
   ```bash
   npx gulp migrate [--src <source>] [--dest <output>] [--glob <pattern>] [--overwrite] [--verbose]
   ```
3. Follow the interactive prompts:
   - **Remove Tempus Dominus?** (yes/no)
   - **Add Tempus Dominus calendar?** (yes/no)
   - If adding, specify how many pickers to initialize and their element IDs.
4. After file transformation, JSCodeshift runs to update date‑picker and modal code in your JS files.

By default, files are overwritten in place. Use `--dest <folder>` to write outputs elsewhere.

## Options

| Flag          | Description                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------- |
| `--src`       | Source directory or glob for files (default: `./src`)                                         |
| `--dest`      | Destination folder (default: `./`; ignored if `--overwrite` set)                              |
| `--glob`      | Glob pattern for files (default: `**/*.{html,htm,js,ts,cshtml,ejs,php,vue,twig,…}`)           |
| `--overwrite` | Overwrite files in place (cannot be used with `--dest`)                                      |
| `--verbose`   | Print each file processed and detailed transform counts                                      |

## File Transforms

- **Gulp Task (`gulp migrate`)**
  - Uses `gulp-replace` to scan and replace classes, attributes, and CDN links.
  - Injects or removes Tempus Dominus assets based on prompts.
  - Streams results through `dest()` and logs summaries.
- **JSCodeshift Scripts**
  - `replace-datetimepicker.js`: Converts legacy `datetimepicker()` calls to `TempusDominus` instantiation. Must be passed the picker `--id`.
  - `replace-modal.js`: Applies project‑specific modal rewrites in your JS.

## Post‑Migration Tips

- Review with the [Bootstrap 5 Migration Guide](https://getbootstrap.com/docs/5.3/migration/).
- Use the [Bootstrap Deprecated Classes browser extension](https://github.com/julien-deramond/bootstrap-deprecated-classes-extension) to catch any missed classes.
- Add missing negative margin utilities or print styles if needed.
- Test UI in all browsers; IE11 support is dropped unless you include a polyfill like [bootstrap-ie11](https://github.com/coliff/bootstrap-ie11).

## License

Released under the MIT License.

