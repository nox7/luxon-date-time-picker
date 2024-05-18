const gulp = require("gulp");
const ts = require("gulp-typescript");
const sass = require("gulp-sass")(require("sass"));
const babel = require("gulp-babel");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("default", (done) => {
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe(babel({
      plugins: [
        [
          "babel-plugin-transform-remove-imports",
          {
            test: ["^bootstrap$", "^luxon$"]
          }
        ],
        [
          "babel-plugin-transform-rewrite-imports",
          {
            appendExtension: ".js"
          }
        ]
      ]
    }))
    .pipe(gulp.dest("dist/js"))
    .on("end", () => {
      gulp.src("./src/SCSS/DatePickerComponent.scss")
      .pipe(sass.sync({outputStyle: "compressed", sourceMap: true}).on("error", sass.logError))
      .pipe(gulp.dest("./dist/css"))
      done();
    });
});