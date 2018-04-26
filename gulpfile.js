var gulp = require('gulp');
var postcss = require('gulp-postcss');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');

var fs = require('fs');


gulp.task('css', function () {
    return gulp.src(['./css/*.css'])
        .pipe(cssnano())
        .pipe(gulp.dest('./dist/css'))
});

gulp.task('js', function(){
    return gulp.src(['./js/*.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('img',function () {
    gulp.src(['./images/*.*'])    //原图片的位置
        .pipe(imagemin())                   //执行图片压缩
        .pipe(gulp.dest('dist/images'));    //压缩后的图片输出的位置
});

gulp.task('watch',function(){
    gulp.watch('./images/*.*',['img']);
    gulp.watch('./css/*.css',['css']);
    gulp.watch('./js/*.js',['js']);
})


gulp.task('default', [ 'css','js','img','watch' ])
