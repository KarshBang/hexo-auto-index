const fs = require('fs')
const path = require('path');

const defaultConfig = {
    showHide: false
}
function ls(filePath, callback, config = defaultConfig) {
    const state = fs.statSync(filePath)
    const filepathObj = path.parse(filePath)
    //todo add config
    if (!config.showHide && filepathObj.name.startsWith('.')) {
        return
    }
    if (state.isFile()) {
        callback(filePath, filepathObj, true)
    } else if (state.isDirectory()) {
        callback(filePath, filepathObj, false)
        let files = fs.readdirSync(filePath)
        files.forEach(file => {
            ls(path.join(filePath, file), callback, config)
        })
    }
}

function createCallback(basePath) {
    const res = []
    let dir = {data: []}
    function callback(filePath, filepathObj, isFile) {
        const reg = /^(\.(md|html))*$/
        if (reg.test(filepathObj.ext)) {
            dir.data.push({ path: path.relative(basePath, filePath.replace('.md', '/')), name: filepathObj.name, type: 'file' })
        }
        if (!isFile) {
            dir = { path: path.relative(basePath, filePath), name: filepathObj.name, data: [], type: 'index' }
            res.push(dir)
        }
    }
    return [res, callback]
}

module.exports = function (basePath, diyDir) {
    const [res, callback] = createCallback(basePath)
    ls(path.resolve(basePath, diyDir), callback)
    return res
}
