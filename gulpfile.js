var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

var paths = {
    js: ["js/gorilla.scroller.js", "js/*.js", "js/**/*.js"],
    sass: ["scss/gorilla.scroller.scss"]
};

gulp.task("lint", function () {
    return gulp.src(paths.js)
		.pipe($.jshint())
		.pipe($.jshint.reporter("default"));
});

gulp.task("minify", ["lint"], function () {
    return gulp.src(paths.js)
		.pipe($.sourcemaps.init())
		.pipe($.uglify())
		.pipe($.concat("gorilla.scroller.min.js"))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest("dist"));
});

gulp.task("js", ["minify"], function () {
    return gulp.src(paths.js)
		.pipe($.concat("gorilla.scroller.js"))
		.pipe(gulp.dest("dist"));
});

gulp.task('sass', function () {
    return gulp.src(paths.sass)
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'compressed'
        }).on('error', $.sass.logError))
		.pipe($.autoprefixer({
		    browsers: ['last 2 versions', 'ie >= 9']
		}))
        .pipe($.sourcemaps.write())
		.pipe(gulp.dest('css'));
});

gulp.task('default', ['sass', 'js'], function () {
    gulp.watch(["scss/*.scss"], ['sass']);
    gulp.watch(paths.js, ['minify']);
});