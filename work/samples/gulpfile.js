/**
 * Created by yuriy.horobey on 2015-06-23.
 */
var gulp = require('gulp');
var modulator = require('modulator');

var buildPath = function (f) {
    var filePath = f.base.substring(f.cwd.length);
    var path = 'build' + filePath;
    return path;
};
var depConfigFile = './samples/dependencies.js';
gulp.task('test', function (cb) {
    gulp.src('./sample-src/**/*.js')
        .pipe(modulator(depConfigFile, '../templates/standard-module.js'))
        .pipe(gulp.dest(buildPath));
});

