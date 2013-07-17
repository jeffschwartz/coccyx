module.exports = function ( grunt ) {

    // Project configuration.
    grunt.initConfig( {
        pkg    : grunt.file.readJSON( 'package.json' ),
        concat : {
            options : {
                separator : '\n;'
            },
            dist    : {
                src  : [
                    'javascripts/banner.js',
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
                    'javascripts/banner.js',
                    'javascripts/application.js',
                    'javascripts/helpers.js',
                    'javascripts/history.js',
                    'javascripts/model.js',
                    'javascripts/router.js',
                    'javascripts/views.js',
                    'javascripts/pubsub.js',
                    'javascripts/amd.js'
                    ],
                dest : '../demoapp/public/javascripts/libs/coccyx.js'
            }
        },
        uglify: {
            my_target: {
                files: {
                    'javascripts/dist/coccyx.min.js': ['javascripts/dist/coccyx.js']
                }
            }
        },
        compress: {
            main: {
                options: {
                  mode: 'gzip'
                },
                expand: true,
                cwd: 'javascripts/dist/',
                src: ['coccyx.min.js'],
                dest: '.',
                ext: '.gz.js'
            }
        },
        watch  : {
            scripts : {
                files   : ['javascripts/**/*.js'],
                tasks   : ['concat', 'uglify', 'compress'],
                options : {
                    interrupt : true
                }
            }
        }
    } );

    // Load the plugins
    grunt.loadNpmTasks( 'grunt-contrib-concat' );
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks( 'grunt-contrib-watch' );

    // Default task(s).
    grunt.registerTask( 'default', ['concat'] );

    // Alias Tasks
    grunt.registerTask( 'dev', 'Running Grunt dev task', ['concat:dist'] );
    grunt.registerTask( 'prod', 'Running Grunt prod task', ['concat:dist', 'uglify', 'compress'] );

};
