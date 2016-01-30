/**
 * Created by yuriy.horobey on 2015-06-23.
 */
// consts
const PLUGIN_NAME = 'fet-modulator';


var through = require('through2');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');

var templatesCache = {};
var config;
// plugin level function (dealing with files)
function fetModulator(configFile, templateFileName, serviceLocatorVarName) {

    serviceLocatorVarName = serviceLocatorVarName || '$L';

    //refresh config!
    var configRealPath = fs.realpathSync(configFile);
    delete require.cache[require.resolve(configRealPath)]
    var config = require(configRealPath);

    // creating a stream through which each file will pass
    var stream = through.obj(function (file, enc, cb) {
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return cb();
        }


        var relativePath = file.path.substring(file.base.length);
        var configKey = relativePath.substring(0, relativePath.lastIndexOf('\.')).replace(/[\\]+/g, '/');

        var fileContents = file.contents.toString();


        var tplCacheKey = templateFileName.trim().toLowerCase();
        var template;
        if (templatesCache.hasOwnProperty(tplCacheKey)) {
            template = templatesCache[tplCacheKey];

        } else {
            template = fs.readFileSync(templateFileName).toString();
            templatesCache[tplCacheKey] = template;
        }
        var configEntry = config[configKey];
        if (!configEntry) {
            console.log(chalk.yellow('Warning: ') + chalk.red.bold(configKey) + ' has no config entry, ' + chalk.yellow.bold('skipping'));
            cb();
            return;
        }
        var registrar = config[configKey].registrar;
        if (!registrar || typeof registrar !== 'function') {
            console.log(chalk.yellow('Warning: ') + chalk.red.bold(configKey) + ' has no registrar function or it is not a function.');
            registrar = '';
        }
        registrar = registrar.toString();
        var concat = configEntry.concat;
        if (concat) {
            var concatPathParsed = path.parse(file.path);
            fileContents = concatenate(fileContents, concatPathParsed.dir + path.sep, concat);
        }
        template = processTemplate(template, fileContents, registrar, serviceLocatorVarName);

        file.contents = new Buffer(template);

        // make sure the file goes through the next gulp plugin
        this.push(file);
        console.log(chalk.green.bold(relativePath) + ' processed');

        // tell the stream engine that we are done with this file
        cb();
    });

    // returning the file stream
    return stream;
};

function concatenate(fileContents, dir, concat) {
    if (Object.prototype.toString.call(concat) !== '[object Array]') {
        console.log(chalk.yellow('Warning: wrong value for concat, skipping'));
        return fileContents;
    }
    while (concat.length) {
        var file = concat.shift().trim();
        if (file.substr(-3) !== '.js') {
            file += '.js';
        }
        try {
            concatContents = fs.readFileSync(dir + file).toString();
        }catch(e){
            throw new Error('Unable to concat file: "'+dir+file+'".\nOriginal error: '+e);
        }
        fileContents += concatContents;
    }
    return fileContents;
}
function processTemplate(template, fileContents, registrar, serviceLocatorVarName) {
    template = template
        .replace('$SERVICE_LOCATOR_NAME$', serviceLocatorVarName)
        .replace('$SERVICE_SRC$', fileContents)
        .replace('$SERVICE_REGISTRAR$', registrar);
    return template;

}
// exporting the plugin main function
module.exports = fetModulator;