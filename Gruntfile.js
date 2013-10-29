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
                    'javascripts/amdshim.js',
                    'javascripts/application.js',
                    'javascripts/helpers.js',
                    'javascripts/history.js',
                    'javascripts/model.js',
                    'javascripts/collection.js',
                    'javascripts/router.js',
                    'javascripts/views.js',
                    'javascripts/eventer.js',
                    'javascripts/ajax.js',
                    // 'javascripts/pubsub.js', removed from main lib starting with v0.6.0
                    'javascripts/amd.js'
                    ],
                dest : 'javascripts/dist/coccyx.js'
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
                src: ['javascripts/dist/coccyx.min.js'],
                ext: '.gz.js'
            }
        },
        copy: {
            todev: {
                files: [
                    {src: ['javascripts/dist/coccyx.js'], dest: '../demoapp/public/javascripts/libs/coccyx.js'}
                ]
            }
        },
        watch  : {
            scripts : {
                files   : ['javascripts/*.js'],
                tasks   : ['prod'],
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
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask( 'default', ['watch'] );

    // Alias Tasks
    grunt.registerTask( 'dev', 'Running Grunt dev task', ['copy:todev'] );
    grunt.registerTask( 'prod', 'Running Grunt prod task', ['concat:dist', 'uglify', 'compress'] );
    grunt.registerTask( 'prod_and_dev', 'Running Grunt prod_and_dev task', ['prod', 'dev'] );

};
