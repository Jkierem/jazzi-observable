import Async from "https://deno.land/x/jazzi@v3.0.4/Async/mod.ts"
import metaData from "../package.json" assert { type: "json" }

const printLn = (str: string) => Async.of(() => console.log(str))

const removeFile = Async.from((file: string) => Deno.remove(file, { recursive: true }))

metaData.files.forEach(file => {
    printLn(`Deleting ${file}...`)
    .chain(() => removeFile.provide(file))
    .zipLeft(printLn(`Deleted ${file}...`))
    .recover(() => printLn(`Could not delete ${file}`))
    .unsafeRun()
})