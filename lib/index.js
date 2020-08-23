const url = require('url')
const index = require('./ls')

const styleMap = {
    big: (depth, name, path, type) => {
        if(type === 'index') {
            return `${'\t'.repeat(depth)} - ${'#'.repeat(depth + 1)} ${name}\n`
        }
        return `${'\t'.repeat(depth)} - ${'#'.repeat(depth + 1)} [${name}](${url.resolve('../', path)})\n`
    },
    small: (depth, name, path, type) => {
        if(type === 'index') {
            return `${'\t'.repeat(depth)} - ${name}\n`
        }
        return `${'\t'.repeat(depth)} - [${name}](${url.resolve('../', path)})\n`
    }
}


let selectedStyle = styleMap.small

function createData(root, depth = 0) {
    let res = ''
    const {path, name, data, type} = root
    res += selectedStyle(depth, name, path, type)
    if(type === 'index') {
        for(let node of data) {
            res += createData(node, depth + 1)
        }
    }
    return res
}

const title = hexo.config.language.startsWith('zh') ? '目录' : 'CONTENTS'
const config = hexo.config.auto_index || {}
const dir = config.dir || []
const dirList = typeof dir === 'string' ? [dir] : dir
const { max_depth = 1, remove_postfix = true, style = 'small' } = config
selectStyle = styleMap[style] || styleMap.small
if (dirList.length) {
    if (remove_postfix) {
        const pattern = new RegExp(`^(${dirList.join('|')})\/.*$`)
        hexo.extend.filter.register('after_post_render', (data) => {
            if (pattern.test(data.path)) {
                data.path = data.path.replace('.html', '/')
            }
        })
    }
    hexo.extend.generator.register('auto-index', function () {
        return dirList.reduce((list, name) => {
            const treeData = index(hexo.source_dir, name, remove_postfix)
            const text = createData(treeData[0])
            const content = hexo.render.renderSync({ text, engine: 'md' })
            const res = [{ path: `${name}/`, data: { title , content }, layout: 'page' }]
            return list.concat(res)
        }, [])
    });
}

