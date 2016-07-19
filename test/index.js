var wrapper = require('../');
var gutil = require('gulp-util');
var fs = require('fs');
var pjoin = require('path').join;
var path = require('path');
var should = require('should');
require('mocha');

describe('gulp test', function () {
    it('test amd wrapper', function (done) {

        var fakeFilePath = pjoin(process.cwd(), '/test/fixtures/file.js');
        var getFakeFile = function (fileContent) {

            return new gutil.File({
                path: fakeFilePath,
                cwd: './test/',
                base: './test/fixture/',
                contents: new Buffer(fileContent || '')
            });
        };

        var fakeFile = getFakeFile("module.exports = { init: function () { }, bindEvent: function () { $('.J_addTodo').on('click', addTodo); } };"),
            stream = wrapper({
                type: 'amd'
            });

        stream.on('data', function (file) {
            var fp = file.path;
            var dirname = process.cwd();
            var extname = path.extname(fp);

            file.modName.should.eql(fp.replace(dirname + '/', '').replace(extname, ''));
            file.contents.toString().should.eql(String(fs.readFileSync(fakeFilePath)));
        });

        stream.once('end', function () {
            done();
        });

        stream.write(fakeFile);
        stream.end();
    })
});