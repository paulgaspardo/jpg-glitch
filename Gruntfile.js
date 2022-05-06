// http://gruntjs.com/configuring-tasks
module.exports = function( grunt ) {
	var grunt_configuration = {
		pkg: grunt.file.readJSON( 'package.json' ),

		// concatenate all javascript files in scripts folder and compress them;
		// replace requirejs with the more lightweight almond js
		requirejs: {
			production: {
				options: {
					name: 'lib/almond',
					include: 'glitcher',
					baseUrl: 'scripts/',
					mainConfigFile: 'scripts/glitcher.js',
					out: 'build/glitcher.min.js',
					wrap: true
				}
			}
		},

		// minify css files in styles dir
		cssmin: {
			production: {
				files: {
					'build/glitcher.min.css': [ 'styles/glitcher.css' ]
				}
			}
		},

		// minify svg files
		svgmin: {
			production: {
				options: {
					plugins: [
						{ removeViewBox: false }
					]
				},
				files: [ {
					expand: true,
					cwd: './',
					src: 'images/icon/*.svg',
					dest: 'build/'
				}, {
					expand: true,
					cwd: './',
					src: 'images/logos/*.svg',
					dest: 'build/'
				} ]
			}
		},

		uglify: {
			options: {
				compress: {
					dead_code: true,
					properties: true,
					booleans: true,
					unused: true,
					hoist_funs: true,
					hoist_vars: true,
					if_return: true,
					join_vars: true
				},
				mangle: {
					sort: true,
					toplevel: true
				}
			},
			production: {
				files: [
					{ src: 'serviceworker.js', dest: 'build/serviceworker.min.js' },
					{ src: 'scripts/workers/glitchworker.js', dest: 'build/glitchworker.min.js' },
					{ src: [
						'scripts/lib/localforage.nopromises.js',
						'scripts/lib/md5.js',
						'scripts/workers/storageworker.js'
					], dest: 'build/storageworker.min.js' },
					{ src: [
						'scripts/lib/localforage.nopromises.js',
						'scripts/workers/settingsworker.js'
					], dest: 'build/settingsworker.min.js' }
				]
			}
		},

		// copy the index file
		copy: {
			productionTextBasedFiles: {
				options: { processContent: updateContent },
				files: [
					{ src: 'index.html', dest: 'build/index.html' },
					{ src: 'manifest.json', dest: 'build/manifest.json' },
					{ src: '.gitignore', dest: 'build/.gitignore' },
					{ src: 'LICENSE', dest: 'build/LICENSE' },
					{
						expand: true,
						cwd: './',
						src: [ 'lang/*.json' ],
						dest: 'build/'
					},
					
					// copying these files 'in place' to apply updateContent function 
					// that updates some of the paths in the minified files
					{ src: 'build/glitcher.min.js', dest: 'build/glitcher.min.js' },
					{ src: 'build/serviceworker.min.js', dest: 'build/serviceworker.min.js' },
					{ src: 'build/storageworker.min.js', dest: 'build/storageworker.min.js' },
					{ src: 'build/settingsworker.min.js', dest: 'build/settingsworker.min.js' },
					{ src: 'build/glitcher.min.css', dest: 'build/glitcher.min.css' }
				]
			},
			productionBinaryFiles: {
				files: [ {
					expand: true,
					cwd: './',
					src: [ 'images/*.jpg' ],
					dest: 'build/'
				}, {
					expand: true,
					cwd: './',
					src: [ 'images/logos/*.png' ],
					dest: 'build/'
				},
				{ src: 'favicon.ico', dest: 'build/favicon.ico' } ]
			}
		},

		// minify index file in production dir
		// including css and javascript
		htmlmin: {
			production: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					minifyCSS: true,
					minifyJS: {
						compress: {
							dead_code: true,
							properties: true,
							booleans: true,
							unused: true,
							hoist_funs: true,
							hoist_vars: true,
							if_return: true,
							join_vars: true
						},
						mangle: {
							sort: true,
							toplevel: true
						}
					},
					removeScriptTypeAttributes: true
				},
				files: [ {
					src: 'build/index.html', dest: 'build/index.html'
				} ]
			}
		},
	};

	// replace javscript and css paths when copying files
	function updateContent ( content, path ) {
		if ( path === 'index.html' ) {
			content = content
				.replace( 'styles/glitcher.css', 'glitcher.min.css' )
				.replace( 'scripts/lib/require.js', 'glitcher.min.js' )
				.replace( 'serviceworker.js', 'serviceworker.min.js' )
				.replace( "scriptEl.setAttribute( 'data-main', 'scripts/glitcher.js' );", '' );
		}

		if ( path === 'build/glitcher.min.js' ) {
			content = content
				.replace( 'scripts/workers/glitchworker.js', 'glitchworker.min.js' )
				.replace( 'scripts/workers/storageworker.js', 'storageworker.min.js' )
				.replace( 'scripts/workers/settingsworker.js', 'settingsworker.min.js' );
		}

		if ( path === 'build/serviceworker.min.js' ) {
			content = content
				.replace( /v\d+(.?\d*)+::/g, 'b' + Date.now() + '::' ) // 'v1.0.1::'' -> 'b{timestamp}'
				.replace( 'styles/glitcher.css', 'glitcher.min.css' )
				.replace( 'scripts/glitcher.js', 'glitcher.min.js' )
				.replace( 'scripts/workers/glitchworker.js', 'glitchworker.min.js' )
				.replace( 'scripts/workers/storageworker.js', 'storageworker.min.js' )
				.replace( 'scripts/workers/settingsworker.js', 'settingsworker.min.js' );
		}

		if ( path === 'build/storageworker.min.js' || 'build/settingsworker.min.js' ) {
			content = content.replace( /,importScripts\(.*\),/, ',' ); // replaces importScripts
		}

		if ( path === 'build/glitcher.min.css' ) {
			content = content.replace( /\.\.\/images\//gi, 'images/' ); // replaces importScripts
		}

		if ( path === 'manifest.json' ) {
			content = content.replace( 'serviceworker.js', 'serviceworker.min.js' );
		}

		return content;
	}

	grunt.initConfig( grunt_configuration );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-copy' );
	grunt.loadNpmTasks( 'grunt-contrib-htmlmin' );
	grunt.loadNpmTasks( 'grunt-svgmin' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );

	grunt.registerTask( 'default', [ 'requirejs', 'cssmin', 'svgmin', 'uglify', 'copy', 'htmlmin' ] );
	grunt.registerTask( 'production', [ 'requirejs', 'cssmin', 'copy' ] );
	grunt.registerTask( 'js', [ 'requirejs', 'uglify', 'copy' ] );
	grunt.registerTask( 'css', [ 'cssmin' ] );
	grunt.registerTask( 'cp', [ 'copy' ] );
	grunt.registerTask( 'html', [ 'copy', 'htmlmin' ] );
};