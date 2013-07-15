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
                    'javascripts/pubsub.js',
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
                    'javascripts/pubsub.js',
                    'javascripts/amd.js'
                    ],
                dest : '../demoapp/javascripts/libs/coccyx.js'
            }
        },
        watch  : {
            scripts : {
                files   : ['demoapp/javascripts/templates/*.tmpl','javascripts/**/*.js'],
                tasks   : ['concat'],
                options : {
                    interrupt : true
                }
            }
        }
    } );

    // Load the plugins
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-concat' );

    // Default task(s).
    grunt.registerTask( 'default', ['concat'] );

    // Alias Tasks
    // grunt.registerTask( 'dev', 'Running Grunt dev', ['concat:dist'] );
    // grunt.registerTask( 'prod', 'Running Grunt prod', ['concat:dist'] );

};
