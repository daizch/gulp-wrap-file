var through2 = require('through2');
var gutil = require('gulp-util');
var path = require('path');

var PluginError = gutil.PluginError;

const WRAPPER = {
    'amd': 'define("{modName}", function(require, exports, module){' +
    '{file}' +
    '});'
};

module.exports = function (opt) {
    var CWD = process.cwd();
    opt = opt || {};
    var truncatePrefixLen = opt.truncatePrefixLen || 0;

    if (opt.type) {
        opt.wrapper = WRAPPER[opt.type];
    }

    return through2.obj(function (file, enc, callback) {

        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError('gulp-wrapper', 'stream is not supported'), file);
        }

        var content = file.contents.toString();
        var fp = file.path;
        var extname;
        var modName;

        if (opt.nameReplacer) {
            file.modName = opt.nameReplacer(file.path);
        } else {
            extname = path.extname(fp);
            modName = fp.replace(CWD + '/', '').replace(extname, '');

            if (truncatePrefixLen > 0) {
                modName = modName.split('/').slice(truncatePrefixLen).join('/');
            }
            file.modName = modName;
        }
        if (typeof opt.wrapper === 'function') {
            content = opt.wrapper(content, file);
        } else if (typeof opt.wrapper === 'string') {
            content = opt.wrapper.replace('{file}', content).replace('{modName}', modName);
        }

        file.contents = new Buffer(content);

        callback(null, file);
    });
};