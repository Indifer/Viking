var FILE_ENCODING = 'utf-8',
    SRC_DIR = '../dev/src',
    LIBS_DIR = '../dev/libs',
    DIST_PATH = '../dist/viking.js',
    DIST_MIN_PATH = '../dist/viking.min.js';

var _fs = require('fs'),
    _path = require('path'),
    _pkg = JSON.parse(readFile('../package.json')),
    _now = new Date(),
    _replacements = {
        NAME: _pkg.name,
        EMAIL: _pkg.author.email,
        AUTHOR: _pkg.author.name,
        VERSION_NUMBER: _pkg.version,
        HOMEPAGE: _pkg.homepage,
        LICENSE: _pkg.licenses[0].type,
        BUILD_DATE: _now.getFullYear() + '/' + pad(_now.getMonth() + 1) + '/' + pad(_now.getDate()) + ' ' + pad(_now.getHours()) + ':' + pad(_now.getMinutes())
    };

function readFile(filePath) {
    return _fs.readFileSync(filePath, FILE_ENCODING);
}

function tmpl(template, data, regexp) {
    function replaceFn(match, prop) {
        return (prop in data) ? data[prop] : '';
    }
    return template.replace(regexp || /::(\w+)::/g, replaceFn);
}

function uglify(srcPath) {
    var
        uglyfyJS = require('uglify-js'),
        ast = uglyfyJS.minify(readFile(srcPath));
    if (ast.error) {
        console.log(JSON.stringify(ast));
    }
    return ast.code;
}

function minify() {
    var license = tmpl(readFile(SRC_DIR + '/license.txt'), _replacements);
    // we add a leading/trailing ";" to avoid concat issues (#73)
    var code = uglify(DIST_PATH);
    if (code) {
        _fs.writeFileSync(DIST_MIN_PATH, license + ';' + code + ';', FILE_ENCODING);
        console.log(' ' + DIST_MIN_PATH + ' built.');
    }
}

function purgeDeploy() {
    [DIST_PATH, DIST_MIN_PATH].forEach(function (filePath) {
        if (_fs.existsSync(filePath)) {
            _fs.unlinkSync(filePath);
        }
    });
    console.log(' purged deploy.');
}

function build() {
    var wrapper = readFile(SRC_DIR + '/wrapper.js'),
        deploy = tmpl(wrapper, {
            license: readFile(SRC_DIR + '/license.txt'),
            // signals_js: readFile(LIBS_DIR + '/signals.js'),
            // crossroads_js: readFile(LIBS_DIR + '/crossroads.js'),
            core_js: readFile(SRC_DIR + '/core.js'),
            util_js: readFile(SRC_DIR + '/util.js'),
            history_js: readFile(SRC_DIR + '/history.js'),
            view_js: readFile(SRC_DIR + '/view.js'),
            app_js: readFile(SRC_DIR + '/app.js'),
        }, /\/\/::(\w+)::\/\//g);

    _fs.writeFileSync(DIST_PATH, tmpl(deploy, _replacements), FILE_ENCODING);
    console.log(' ' + DIST_PATH + ' built.');
}

function pad(val) {
    val = String(val);
    if (val.length < 2) {
        return '0' + val;
    } else {
        return val;
    }
}

// --- run ---
purgeDeploy();
build();
minify();