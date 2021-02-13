//plug-in
var gulp = require('gulp');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var source = require('vinyl-source-stream');


// gulpタスクの作成
gulp.task('build', function (done) {
  browserify({
    entries: ['src/app.js'] // ビルド元のファイルを指定
  }).bundle()
    .pipe(source('bundle.js')) // 出力ファイル名を指定
    .pipe(gulp.dest('dist/')); // 出力ディレクトリを指定
  done();
});
gulp.task('browser-sync', function (done) {
  browserSync.init({
    server: {
      baseDir: "./", // 対象ディレクトリ
      index: "index.html" //indexファイル名
    }
  });
  done();
});
gulp.task('bs-reload', function (done) {
  browserSync.reload();
  done();

});

// Gulpを使ったファイルの監視
gulp.task('default', gulp.series(gulp.parallel('build', 'browser-sync'), function () {
  gulp.watch('./src/*.js', gulp.task('build'));
  gulp.watch("./*.html", gulp.task('bs-reload'));
  gulp.watch("./dist/*.+(js|css)", gulp.task('bs-reload'));
}));
