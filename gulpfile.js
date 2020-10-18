//пункт 5
let project_folder = require("path").basename(__dirname); //была но мы сделали по названию папки где находится//папка проекта в которую будет собираться проект - эту папку показывают заказчику - на сервер 
let source_folder = "#src"; // папка c исходниками
let fs = require('fs');
let path = {
    build: {//пути вывода - пути куда галп выгружет обработанные файлы ------project_folder
        html: project_folder + "/",
        css: project_folder + "/css",
        js: project_folder + "/js",
        images: project_folder + "/images",
        fonts: project_folder + "/fonts",
    },
    src: {//--------source_folder
        html: source_folder + "/*.html",
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        images: source_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        images: source_folder + "/images/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    //объект удаляет папку проекта когда мы его запускаем
    clean: "./" + project_folder + "/"
}
let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    //пункт 6
    browsersync = require("browser-sync").create(),
    concat = require('gulp-concat'),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    group_media = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fonter = require("gulp-fonter");
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false

    })
}
//пункт 8 
function html() {
    return src(path.src.html)
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
} //обрабатывает html-файлы
// function css() {
//     return src(path.src.css)
//         .pipe(
//             scss({
//                 outputStyle: "expanded"
//             })
//         )
//         .pipe(
//             group_media()
//         )
//         .pipe(
//             autoprefixer({
//                 overrideBrowserslist: ["last 10 versions"],
//                 cascade: true,
//                 grid: true
//             })
//         )

//         .pipe(dest(path.build.css))
//         .pipe(clean_css())
//         .pipe(
//             rename({
//                 extname: ".min.css"
//             })
//         )
//         .pipe(dest(path.build.css))
//         .pipe(browsersync.stream())
// } //обрабатываем css-файлы + sass - файлы
function css() {
    return src([
        '#src/scss/reset.scss',
        'node_modules/slick-carousel/slick/slick.scss',
        '#src/scss/style.scss'
    ])
        .pipe(concat('style.scss'))
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )
        .pipe(
            group_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 10 versions"],
                cascade: true,
                grid: true
            })
        )

        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
} //обрабатываем css-файлы + sass - файлы

// function js() {
//     return src(path.src.js)
//         // .pipe(fileinclude())
//         .pipe(dest(path.build.js))
//         .pipe(
//             uglify()
//         )
//         .pipe(
//             rename({
//                 extname: ".min.js"
//             })
//         )
//         .pipe(dest(path.build.js))
//         .pipe(browsersync.stream())

// } //обрабатывает js-файлы
function js() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/slick-carousel/slick/slick.min.js',
        '#src/js/script.js'
    ])
        .pipe(concat('script.js'))
        .pipe(dest(path.build.js))
        .pipe(
            uglify()
        )
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())

} //обрабатывает js-файлы

function img() {
    return src(path.src.images)
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 //0 to 7
            })
        )
        .pipe(dest(path.build.images))
        .pipe(browsersync.stream())
} //обрабатывает изображения

function fonts(params) {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
};

gulp.task('otf2ttf', function () {
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder + '/fonts/'));
})

function fontsStyle(params) {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}
function cb() { }

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], img);
} //можно изменять HTML и браузер фиксирует изменения, слежка за scss в css

function clean(params) {
    return del(path.clean);
} //чистит dist от лишних не нужных файлов

let build = gulp.series(clean, gulp.parallel(js, css, html, img, fonts), fontsStyle);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.img = img;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
//пункт 7