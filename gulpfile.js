const replace = require('gulp-replace');
const gulpIf = require('gulp-if');
const inquirer = require('inquirer');
const { exec } = require('child_process');
const { src, dest, task, series } = require('gulp');

/**
 * Options that may be set via cli flags \
 * For example: \
 * `npx gulp migrate  --src "./src-dir" --overwrite --verbose` */
const DEFAULT_OPTIONS = {
  /** string that will be passed to the gulp {@link src} function */
  src: './src',
  /** string that will be passed to the gulp {@link dest} function */
  dest: `./`,
  /** overwrite the existing files in place. **Cannot be used with --dest flag** */
  overwrite: true,
  /** print the path of each generated / modified file to the console */
  verbose: true,
  /** Default glob for files to search in. Default: Search all folder and files recursively */
  defaultFileGlob: '**/*.{asp,aspx,cshtml,gohtml,gotmpl,ejs,erb,hbs,html,htm,js,jsp,php,ts,twig,vue}',
};

async function migrate(cb) {
  const options = parseArgs();

  console.log(options);

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'removeTempus',
      message: '¿Desea eliminar tempusdominus?',
      default: false
    },
    {
      type: 'confirm',
      name: 'addCalendar',
      message: '¿Desea añadir el calendario de Tempus Dominus en el <head>?',
      default: false
    }
  ]);

  const { removeTempus, addCalendar } = answers;

  let calendarIds = [];
  if (addCalendar) {
    const { count } = await inquirer.prompt([{ type: 'number', name: 'count', message: '¿Cuántos calendarios desea inicializar?', default: 1, validate: v => Number.isInteger(v) && v > 0 || 'Debe ser un número entero mayor que 0' }]);
    for (let i = 1; i <= count; i++) {
      const { id } = await inquirer.prompt([{ type: 'input', name: 'id', message: `Dame el id del calendario ${i}`, validate: v => !!v || 'El id no puede estar vacío' }]);
      calendarIds.push(id);
    }
  }

  // process.exit(0)

  let dataAttrChanged = 0;
  let CDNLinksChanged = 0;
  let cssClassChanged = 0;

  let stream = src([`${options.src}/${options.defaultFileGlob}`], { base: options.overwrite ? './' : undefined })
    .pipe(
      replace(
        /<script\b(?:\s+type=['"]text\/javascript['"])?\s+src=['"](\.\.\/){2}lib\/bootstrap\/popper\.min\.js['"]><\/script>/g,
        () => {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>';
        }
      )
    )
    .pipe(
      replace(
        /<link\b(?:\s+rel=['"]stylesheet['"])?(?:\s+type=['"]text\/css['"])?\s+href=['"](\.\.\/){2}lib\/font-awesome\/css\/all\.min\.css['"]\s*\/?\>/g,
        '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer" />'
      )
    )
    .pipe(
      replace(/<link rel=["']stylesheet["'] type=["']text\/css["'] href=["']\.\.\/\.\.\/lib\/bootstrap\/bootstrap-4\.6\.1\/css\/bootstrap4-toggle\.min\.css["']>/g, function () {
        CDNLinksChanged++;
        return '<link href="https://cdn.jsdelivr.net/npm/bootstrap5-toggle@5.1.1/css/bootstrap5-toggle.min.css" rel="stylesheet">';
      })
    )
    .pipe(
      replace(
        /<link\b(?:\s+rel=['"]stylesheet['"])?(?:\s+type=['"]text\/css['"])?\s+href=['"](\.\.\/){2}lib\/datatables\/DataTables-1\.11\.3\/css\/dataTables\.bootstrap4\.min\.css['"]\s*\/?>/g,
        '<link rel="stylesheet" href="https://cdn.datatables.net/2.2.2/css/dataTables.dataTables.css" />'
      )
    )
    .pipe(
      replace(/<script type=["']text\/javascript["'] src=["']\.\.\/\.\.\/lib\/bootstrap\/bootstrap-4\.6\.1\/js\/bootstrap4-toggle\.min\.js["']><\/script>/g, function () {
        CDNLinksChanged++;
        return '<script src="https://cdn.jsdelivr.net/npm/bootstrap5-toggle@5.1.1/js/bootstrap5-toggle.jquery.min.js"></script>';
      })
    )
    .pipe(
      replace(
        /<script\b(?:\s+type=['"]text\/javascript['"])?\s+src=['"](\.\.\/){2}lib\/datatables\/DataTables-1\.11\.3\/js\/dataTables\.bootstrap4\.min\.js['"]><\/script>/g,
        () => {
          CDNLinksChanged++;
          return '<script src="https://cdn.datatables.net/2.2.2/js/dataTables.js"></script>';
        }
      )
    )
    .pipe(
      replace(/<script type=["']text\/javascript["'] src=["']\.\.\/\.\.\/lib\/bootstrap\/popper\.min\.js["']><\/script>/g, function () {
        CDNLinksChanged++;
        return '<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>';
      })
    )
    .pipe(
      replace(
        /<script\b(?:\s+type=['"]text\/javascript['"])?\s+src=['"](\.\.\/){2}lib\/jquery\/jquery\.min\.js['"]><\/script>/g,
        () => {
          CDNLinksChanged++;
          return '<script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>';
        }
      )
    )
    .pipe(
      replace(
        /<script\b(?:\s+type=['"]text\/javascript['"])?\s+src=['"](\.\.\/){2}lib\/bootstrap\/bootstrap-select-1\.13\.14\/js\/bootstrap-select\.min\.js['"]><\/script>/g,
        () => {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta3/dist/js/bootstrap-select.min.js"></script>';
        }
      )
    )
    .pipe(
      replace(
        /<link rel=["']stylesheet["'] type=["']text\/css["'] href=["']\.\.\/\.\.\/lib\/bootstrap\/bootstrap-select-1\.13\.14\/css\/bootstrap-select\.min\.css["']>/g,
        function () {
          CDNLinksChanged++;
          return '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-select@1.14.0-beta3/dist/css/bootstrap-select.min.css">';
        }
      )
    )
    .pipe(
      replace(/<link rel=["']stylesheet["'] type=["']text\/css["'] href=["']\.\.\/\.\.\/lib\/bootstrap\/bootstrap-4\.6\.1\/css\/bootstrap\.min\.css["']>/g, function () {
        CDNLinksChanged++;
        return '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">';
      })
    )
    .pipe(
      replace(
        /<script\b(?:\s+type=['"]text\/javascript['"])?\s+src=['"](\.\.\/){2}lib\/bootstrap\/bootstrap-4\.6\.1\/js\/bootstrap\.min\.js['"]><\/script>/g,
        function () {
          CDNLinksChanged++;
          return '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.min.js" integrity="sha384-VQqxDN0EQCkWoxt/0vsQvZswzTHUVOImccYmSyhJTp7kGtPed0Qcx8rK9h9YEgx+" crossorigin="anonymous"></script>';
        }
      )
    )
    .pipe(
      replace(
        /\sdata-(animation|autohide|backdrop|boundary|container|content|custom-class|delay|dismiss|display|html|interval|keyboard|method|offset|pause|placement|popper-config|reference|ride|selector|slide(-to)?|target|template|title|toggle|touch|trigger|wrap)=/g,
        function (match, p1) {
          if (p1 == 'dismiss') {
            return match;
          }
          dataAttrChanged++;
          return ' data-bs-' + p1 + '=';
        }
      )
    )
    /* Se comenta porque la clase bs-toggle no existe en bootstrap-toggle-5
      .pipe(
      replace(/\[data-toggle=/g, function () {
        dataAttrChanged++;
        return '[data-bs-toggle=';
      })
    )*/
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-danger\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-danger' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-dark\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-dark' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-info\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-info' + p2;
      })
    )
    .pipe(
      replace(/<div\s+class=(['"])divBotones\1>/g, function () {
        cssClassChanged++;
        return '<div class="divBotones text-center">';
      })
    )
    .pipe(
      replace(
        /<div\s+class=(['"])sidebar-buttons\1>/g,
        function () {
          cssClassChanged++;
          return '<div class="sidebar-buttons text-center">';
        }
      )
    )
    .pipe(
      replace(/(<div\b[^>]*\bclass\s*=\s*['"][^'"]*?)\btable-responsive\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'table-responsive overflow-x-visible' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-light\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-light' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-pill\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'rounded-pill' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-primary\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-primary' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-secondary\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-secondary' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-success\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-success' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bbadge-warning\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-bg-warning' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bborder-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'border-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bborder-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'border-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"])\s*\bclose\b\s*(['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'btn-close' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control-input\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-check-input' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control-label\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-check-label' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control custom-checkbox\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-check' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control custom-radio\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-check' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-file-input\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-control' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-file-label\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-label' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-range\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-range' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-select-sm\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-select-sm' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-select-lg\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-select-lg' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-select\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-select' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bcustom-control custom-switch\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-check form-switch' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-sm-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-sm-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-md-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-md-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-lg-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-lg-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-xl-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-xl-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-sm-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-sm-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-md-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-md-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-lg-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-lg-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropdown-menu-xl-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropdown-menu-xl-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropleft\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropstart' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bdropright\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'dropend' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-sm-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-sm-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-md-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-md-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-lg-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-lg-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-xl-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-xl-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-sm-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-sm-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-md-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-md-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-lg-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-lg-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfloat-xl-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'float-xl-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-italic\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'fst-italic' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-bold\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'fw-bold' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-bolder\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'fw-bolder' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-light\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'fw-light' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-lighter\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'fw-lighter' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bfont-weight-normal\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'fw-normal' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-control-file\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-control' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-control-range\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'form-range' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-group\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'mb-3' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-inline\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'd-flex align-items-center' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bform-row\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'row' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bjumbotron-fluid\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'rounded-0 px-0' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bjumbotron\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'bg-light mb-4 rounded-2 py-5 px-3' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmedia-body\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'flex-grow-1' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmedia\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'd-flex' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bml-\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ms-' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bml-n\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ms-n' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmr-\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'me-' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bmr-n\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'me-n' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bno-gutters\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'g-0' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpl-\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ps-' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpr-\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'pe-' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bpre-scrollable\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'overflow-y-scroll' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-item\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + '' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-16by9\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ratio-16x9' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-1by1\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ratio-1x1' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-21by9\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ratio-21x9' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive-4by3\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ratio-4x3' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bembed-responsive\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'ratio' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'rounded-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-lg\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'rounded-3' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'rounded-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\brounded-sm\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'rounded-1' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bsr-only sr-only-focusable\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'visually-hidden-focusable' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bsr-only-focusable\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'visually-hidden-focusable' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bsr-only\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'visually-hidden' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-hide\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'd-none' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-sm-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-sm-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-md-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-md-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-lg-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-lg-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-xl-left\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-xl-start' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-sm-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-sm-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-md-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-md-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-lg-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-lg-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-xl-right\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'text-xl-end' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\btext-monospace\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'font-monospace' + p2;
      })
    )
    .pipe(
      replace(/(<[^>]*class\s*=\s*['"][^'"]*)\bwidth\b([^'"]*['"])/g, function (match, p1, p2) {
        cssClassChanged++;
        return p1 + 'collapse-horizontal' + p2;
      })
    )
    .pipe(replace(/<select([^>]*)\bclass=['"]([^'"]*)form-control(-lg|-sm)?([^'"]*)['"]([^>]*)>/g, '<select$1class="$2form-select$3$4"$5>'))
    .pipe(replace(/<select([^>]*)\bclass=['"]([^'"]*)form-control\b([^'"]*['"])/g, '<select$1class="$2form-select$3'))
    .pipe(replace('<span aria-hidden="true">&times;</span>', ''));

  if (addCalendar) {
    const calendarLink = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@eonasdan/tempus-dominus@6.9.4/dist/css/tempus-dominus.min.css" crossorigin="anonymous">';
    const calendarScript = '<script src="https://cdn.jsdelivr.net/npm/@eonasdan/tempus-dominus@6.9.4/dist/js/tempus-dominus.min.js" crossorigin="anonymous"></script>';

    // Flag que indica si encontramos y reemplazamos el <script> viejo
    let foundOldScript = false;

    stream = stream
      // 1) Intentamos sustituir el script viejo
      .pipe(replace(
        /<script\b[^>]*tempusdominus-bootstrap-4\.min\.js[^>]*><\/script>/g,
        match => {
          foundOldScript = true;
          // Reemplazamos directamente por link+script
          return `${calendarLink}\n        ${calendarScript}`;
        }
      ))
      // 2) Si no había script viejo, inyectamos en <head>
      .pipe(gulpIf(
        () => !foundOldScript,
        replace(
          /<head>/g,
          match => `${match}\n        ${calendarLink}\n        ${calendarScript}`
        )
      ));
  }

  if (removeTempus) {
    stream = stream
      // Remove Tempus Dominus CSS
      .pipe(
        replace(
          /<link\b(?:\s+rel=['"]stylesheet['"])?(?:\s+type=['"]text\/css['"])?\s+href=['"](\.\.\/){2}lib\/bootstrap\/tempusdominus-bootstrap-4\.min\.css['"]\s*\/?\>/g,
          ''
        )
      )
      // Remove Tempus Dominus JS
      .pipe(
        replace(
          /<script\b(?:\s+type=['"]text\/javascript['"])?\s+src=['"](\.\.{2}\/){1}lib\/bootstrap\/tempusdominus-bootstrap-4\.min\.js['"]><\/script>/g,
          ''
        )
      );
  }

  return stream
    .pipe(dest(options.dest))
    .on('data', (data) => {
      if (options.verbose) {
        console.log(`Wrote file: ${data.path}`);
      }
    })
    .on('end', async () => {
      console.log(`Completed! Changed ${cssClassChanged} CSS class names, ${dataAttrChanged} data-attributes and ${CDNLinksChanged} CDN links.`);
      // Ejecutar jscodeshift para cada id de calendario
      if (addCalendar && calendarIds.length) {
        for (const id of calendarIds) {
          const cmd = `npx jscodeshift -t replace-datetimepicker.js --id ${id} src/AdministracionUsuariosGrupos.js`;
          console.log(cmd);
          await new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
              if (err) return reject(stderr);
              if (options.verbose) console.log(stdout);
              resolve();
            });
          });
        }
        console.log('Transformaciones con jscodeshift completadas para todos los calendarios.');
      }
      const cmd = `npx jscodeshift -t replace-modal.js src/AdministracionUsuariosGrupos.js`;
      await new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
          if (err) return reject(stderr);
          if (options.verbose) console.log(stdout);
          resolve();
        });
      });
      cb();
    });
}

/** parses cli args array and return an options object */
function parseArgs() {
  const options = { ...DEFAULT_OPTIONS };
  const argv = process.argv;
  argv.forEach((flag, i) => {
    const value = argv[i + 1];
    switch (flag) {
      case '--src': options.src = value; break;
      case '--dest': options.dest = value; break;
      case '--glob': options.defaultFileGlob = value; break;
      case '--overwrite': options.overwrite = true; options.dest = './'; if (argv.includes('--dest')) throw new Error('Cannot use --overwrite and --dest together.'); break;
      case '--verbose': options.verbose = true; break;
      default: break;
    }
  });
  return options;
}

task('migrate', migrate);
