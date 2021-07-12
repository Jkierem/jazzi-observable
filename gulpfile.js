const { series, watch } = require("gulp")
const { unlink, copyFile } = require("fs").promises
const path = require('path');
const webpack = require("webpack")

const createWebpackConfig = (input) => {
    return {
        entry: `./src/Observable/${input}.js`,
        output: {
          path: path.resolve(__dirname),
          filename: `${input}.js`,
          libraryTarget: 'commonjs2'
        },
        experiments: {
          outputModule: true,
        },
        devtool: false,
        module: {
          rules: [
            {
              test: /\.js$/,
              use: 'babel-loader',
              exclude: /node_modules/
            }
          ]
        }
    };
}

const sourceFiles = [
    "index",
    "operators",
    "schedulers",
    "constructors"
]

const js = x => `${x}.js`
const dts = x => `${x}.d.ts`
const fromRoot = x => `./${x}`
const fromTypes = x => `./types/${x}`

const TaskType = {
    Dev: "Dev",
    Prod: "Prod"
}

const tryUnlink = async (path) => {
    try {
        await unlink(path)
        console.log(`Deleted ${path}`)
    } catch {
        console.warn(`Could not delete ${path}`)
    }
}

const tryCopy = async (input,output) => {
    try {
        await copyFile(input,output);
        console.log(`Copied ${input} to ${output}`)
    } catch {
        console.warn(`Could not copy ${input} to ${output}`)
    }
}

async function clean(){
    const files = sourceFiles
        .flatMap(file => [ js(file), dts(file) ])
        .map(fromRoot)
        .map(tryUnlink);
    await Promise.all(files);
}

const dev = cfg => ({ ...cfg, mode: "development", devtool: 'inline-source-map'})
const prod = cfg => ({ ...cfg, mode: "production" })
const webpackTask = (type) => (config) => {
    const webpackConfig = type === TaskType.Prod ? prod(config) : dev(config)
    return new Promise((resolve,reject) => {
        webpack(webpackConfig ,(err, stats) => { 
            if ( err ) {
                return reject(err)
            }
            if ( stats && stats.hasErrors() ) {
                return reject(stats.toJson().errors);
            }
            if ( stats && stats.hasWarnings() ) {
                console.warn(stats.toJson().warnings);
            }
            resolve()
        })
    })
}

const compileFiles = async (type) => {
    const files = sourceFiles
        .map(createWebpackConfig)
        .map(webpackTask(type))
    await Promise.all(files)
}

const copyTypings = async () => {
    const files = sourceFiles
        .map(dts)
        .map(def => [fromTypes(def), fromRoot(def)])
        .map(([src,dst]) => tryCopy(src,dst));
    await Promise.all(files);
}

function build(type){
    return async function buildingLib(){
        await compileFiles(type)
        await copyTypings()
    }
}

const generateSeries = (type) => {
    return build(type)
}
const generateCleanSeries = (type) => {
    return series(
        clean,
        generateSeries(type)
    )
}

exports.clean = clean
exports.dev = generateCleanSeries(TaskType.Dev);
exports.build = generateCleanSeries(TaskType.Prod);
exports.watch = () => watch("src/",{ ignoreInitial: false }, generateSeries(TaskType.Dev))