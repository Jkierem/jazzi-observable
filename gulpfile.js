const { series, watch } = require("gulp")
const { unlink } = require("fs").promises

const webpack = require("webpack")
const observableConfig = require("./webpack-observable.config")
const operatorsConfig = require("./webpack-operators.config")
const schedulersConfig = require("./webpack-schedulers.config")

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

async function clean(cb){
    await tryUnlink("./index.js");
    await tryUnlink("./operators.js");
    await tryUnlink("./schedulers.js");
    cb()
}

const dev = cfg => ({ ...cfg, mode: "development", devtool: 'inline-source-map'})
const prod = cfg => ({ ...cfg, mode: "production" })
const webpackTask = (type,config) => {
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

function build(type){
    return async function buildingLib(){
        await webpackTask(type,observableConfig)
        await webpackTask(type,operatorsConfig)
        await webpackTask(type,schedulersConfig)
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