const gulp = require('gulp');
/*const requireDir = require('require-dir');
const tasks = requireDir('tasks');*/

const {
	src,
	dest
} = require('gulp');
const sass = require('gulp-sass');
const bulk = require('gulp-sass-bulk-importer');
const prefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean-css');
const concat = require('gulp-concat');
const map = require('gulp-sourcemaps');
const bs = require('browser-sync');

const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');

const {
	watch,
	parallel,
	series
} = require('gulp');
const include = require('gulp-file-include');

function dev_js() {
	return src(['src/components/**/*.js', 'src/js/01_main.js'])
		.pipe(map.init())
		.pipe(uglify())
		.pipe(concat('main.js'))
		.pipe(map.write('../sourcemaps'))
		.pipe(dest('build/js/'))
    .pipe(bs.stream())
}
function bs_html() {
	bs.init({
		server: {
			baseDir: 'build/',
			host: '192.168.0.104',
			tunnel:true,
		},
		logPrefix: 'BS-HTML:',
		logLevel: 'info',
		logConnections: true,
		logFileChanges: true,
	})
}

function build_js() {
	return src(['src/components/**/*.js', 'src/js/01_main.js'])
		.pipe(uglify())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(concat('main.js'))
		.pipe(dest('build/js/'))
}


function watching() {
	watch('src/**/*.html', parallel(html));
	watch('src/**/*.scss', parallel(style));
	watch('src/**/*.js', parallel(dev_js));
	watch('src/fonts/*.ttf' , series(fontWoff,fontWoff2,move))
	watch('src/img/*.{jpeg,jpg,png,gif,svg}' , parallel(image))
}

function html() {
	 return src(['src/*.html'])
		.pipe(include())
		.pipe(dest('build'))
    .pipe(bs.stream())
}

function style() {
	return src('src/sass/**/*.scss')
		.pipe(map.init())
		//.pipe(bulk())
		.pipe(sass({
            outputStyle: 'nested',     // вложенный (по умолчанию) 
        }).on('error', sass.logError))
		.pipe(prefixer({
			overrideBrowserslist: ['last 8 versions'],
			browsers: [
				'Android >= 4',
				'Chrome >= 20',
				'Firefox >= 24',
				'Explorer >= 11',
				'iOS >= 6',
				'Opera >= 12',
				'Safari >= 6',
			],
		}))
		/*.pipe(clean({
			level: 2
		}))*/
		.pipe(concat('style.css'))
		.pipe(map.write('../sourcemaps/'))
		.pipe(dest('build/css/'))
    .pipe(bs.stream())
}

const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const imagemin = require('gulp-imagemin');

function image() {
	return src('src/img/*.{jpeg,jpg,png,gif,svg}')
	.pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]))
	.pipe(dest('build/img/'))
	.pipe(bs.stream())
}
function fontWoff(){
	return src('src/fonts/*.ttf')
	.pipe(ttf2woff())
	.pipe(dest('build/fonts/'))
	.pipe(bs.stream())
}
function move(){
	return src('src/fonts/*.ttf')
	.pipe(dest('build/fonts/'))
	.pipe(bs.stream())
}
function moveframe () {
	return src('src/bootstrap/*.*')
	.pipe(dest('build/bootstrap/'))
}
function fontWoff2(){
	return src('src/fonts/*.ttf')
	.pipe(ttf2woff2())
	.pipe(dest('build/fonts/'))
	.pipe(bs.stream())
}
exports.default = parallel(
	style,
	watching,
	build_js,
	bs_html,
	dev_js,
	html,
	fontWoff2,
	fontWoff,
	image,
	move,
	moveframe
)
