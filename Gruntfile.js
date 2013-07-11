module.exports = function ( grunt ) {

    // Project configuration.
    grunt.initConfig( {
        pkg    : grunt.file.readJSON( 'package.json' ),
        concat : {
            options : {
                separator : ';'
            },
            dist    : {
                src  : [
                    'javascripts/application.js',
                    'javascripts/helpers.js',
                    'javascripts/history.js',
                    'javascripts/model.js',
                    'javascripts/router.js',
                    'javascripts/views.js',
                    'javascripts/amd.js'
                    ],
                dest : 'javascripts/dist/coccyx.js'
            },
            demoapp : {
                src  : [
                    'javascripts/application.js',
                    'javascripts/helpers.js',
                    'javascripts/history.js',
                    'javascripts/model.js',
                    'javascripts/router.js',
                    'javascripts/views.js',
                    'javascripts/amd.js'
                    ],
                dest : 'demoapp/javascripts/libs/coccyx.js'
            }
        },
        handlebars: {
            compile: {
                options: {
                    namespace: 'Handlebars.templates',
                    // Use only the template name as the key for the precompiled template object
                    processName: function(filePath) { // input:  templates/_header.hbs
                        var pieces = filePath.split('/');
                        return pieces[pieces.length - 1]; // output: _header.hbs
                    }
                },
                files: {
                    'demoapp/javascripts/templates/hb.js': 'demoapp/javascripts/templates/*.tmpl'
                }
            }
        },
        watch  : {
            scripts : {
                files   : ['demoapp/javascripts/templates/*.tmpl','javascripts/**/*.js'],
                tasks   : ['handlebars', 'concat'],
                options : {
                    interrupt : true
                }
            }
        }
    } );

    // Load the plugins
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks('grunt-contrib-handlebars');

    // Default task(s).
    grunt.registerTask( 'default', ['concat'] );

    // Alias Tasks
    // grunt.registerTask( 'dev', 'Running Grunt dev', ['concat:dist'] );
    // grunt.registerTask( 'prod', 'Running Grunt prod', ['concat:dist'] );

};
