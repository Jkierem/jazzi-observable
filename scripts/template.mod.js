import { dirname, resolve } from "https://deno.land/std@0.83.0/path/mod.ts"
import { walk, ensureDir } from "https://deno.land/std@0.83.0/fs/mod.ts";

const last = arr => arr[arr.length - 1];

const replaceTemplate = (symbolTable,debug=false) => (code) => {
  return Object.entries(symbolTable).reduce((acc,[value,replace]) => {
    return acc.replaceAll(value,replace)
  },code)
}

const isNotLineComment = x => !x.startsWith("#");
const isIgnored = file => Boolean(file.path.match("__"))

const loadSymbols = (symbolPath) => {
    const text = Deno.readTextFileSync(symbolPath);
    return text
      .split("\n")
      .filter(isNotLineComment)
      .filter(Boolean)
      .map(x => x.split(":=").map(x => x.trim() ))
      .reduce((acc,[key,value]) => ({ ...acc , [key] : value }),{})
}

const fixImports = (data) => {
  return data.replaceAll(/from ["'].*["'];?\s?/gm,(str) => {
    const path = last(str.trim().replaceAll(/["';]/g,"").split("from "));
    const isFile = Boolean(path.match(/(\/[a-z][^\/]*)$/))
    const isFolder = Boolean(path.match(/(\/[A-Z_][^\/]*)$/))
    const isUrl = Boolean(path.startsWith("https"))
    const isImplicitIndex = path === "./" || path === "."
    const isJazzi = path.startsWith("jazzi")

    let ret = path;
    if( isUrl ){
      ret = path.match(/.[t]s;$/gm) ? `from "${path}";` : `from "${path}.ts";`
    } else if( isImplicitIndex ){
      ret = `from "./mod.ts"`;
    } else {
      if( isFolder ){
        ret = `from "${path}/mod.ts";\n`
      }
      if( isFile ){
        ret = `from "${path}.ts";\n`
      }
    }
    if( isJazzi ){
      let fin = ""
      if( ret.includes("dist")){
        fin = ret
          .replace("jazzi/dist", `https://deno.land/x/jazzi@v3.0.4`)
      } else {
        fin = ret
          .replace("jazzi", `from "https://deno.land/x/jazzi@v3.0.4/mod.ts";`)
      }
      return fin
    }
    return ret
  })
}

const template = ({
    symbols,
    input,
    output,
    debug,
    dry
}) => {
    const srcPath = resolve(input)
    const outPath = resolve(output)
    const symbs = loadSymbols(symbols)
    const replaceDestination = file => file.replace(srcPath,last(outPath.split("/")))
    if(debug){
      console.log({
        source: srcPath,
        output: outPath,
      })
      console.log("Symbols: \n", symbs)
    }
    return {
        run: async (onEnd = () => {}) => {
            const files = walk(input);
            for await (const file of files){
              if( file.isFile && !isIgnored(file) ){
                if( debug ){
                  console.log("Processing: ", file.path)
                }
                const rawData = await Deno.readTextFile(file.path)
                const data = fixImports(rawData)
                const target = replaceDestination(resolve(file.path)).replace("index","mod");
                if(debug){
                  console.log("Writing: ", target)
                }
                if( dry ){
                  console.log(target)
                  console.log(data)
                } else {
                  await ensureDir(dirname(target));
                  await Deno.writeTextFile(target,data);
                }
              }
            }
            if(debug){
              console.log("Finished interpolation process")
            }
            onEnd()
        }
    }
}

export default template