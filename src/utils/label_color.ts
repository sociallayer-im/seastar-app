const hexToRgb = (str: string) => {
    let hexs = null
    const reg = /^\#?[0-9A-Fa-f]{6}$/
    if (!reg.test(str)) return ['255','255','255'] as string[]
    str = str.replace('#', '') // 去掉#
    hexs = str.match(/../g) // 切割成数组 409EFF => ['40','9E','FF']
    // 将切割的色值转换为16进制
    for (let i = 0; i < hexs!.length; i++) hexs![i] = parseInt(hexs![i], 16) + ''
    return hexs as string[] // 返回rgb色值[64, 158, 255]
}

export const getLightColor = (color: string, level: number) => {
    const reg = /^\#?[0-9A-Fa-f]{6}$/
    if (!reg.test(color)) return '#fff'
    const rgb = hexToRgb(color)
    // 循环对色值进行调整
    for (let i = 0; i < 3; i++) {
        rgb![i] = Math.floor((255 - Number(rgb![i])) * level + Number(rgb![i])) + '' // 始终保持在0-255之间
    }
    return `rgb(${rgb![0]},${rgb![1]},${rgb![2]})`  // [159, 206, 255]
}

export function stringToColor(str: string) {
    // 使用一个简单的哈希函数将字符串转换为数值
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (str.charCodeAt(i) + ((hash << 5) - hash)) * 2
    }
    // 转换为颜色代码
    let color = '#'
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF
        color += ('00' + value.toString(16)).substr(-2)
    }
    return color
}


export const getLabelColor = (label?: string, light?: number) => {
    let res = ''
    if (label) {
        res = stringToColor(label)
    } else {
        res = '#e6934c'
    }


    if (light) {
        // hex to rgb
        res = getLightColor(res, light)
        console.log(res)
        return res
    } else {
        return res
    }
}
