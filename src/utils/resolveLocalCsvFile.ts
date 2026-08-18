async function resolveLocalCsvFile() {
    return new Promise<string[]>((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.csv'
        input.onchange = async (e: any) => {
            const file = e.target.files[0]
            if (!file) return

            const selectedFile = file
            const nameArry = selectedFile.name.split('.')
            const name = nameArry[nameArry.length - 1].toLowerCase()

            if (name !== 'csv') {
                reject(new Error('Invalid file type'))
            }

            const reader = new FileReader()
            reader.readAsText(selectedFile)

            reader.onload = () => {
                const str: string = reader.result as string
                let rows = str.split('\n')
                rows = rows.map(item => {
                    return item.replace('\r', '')
                })

                rows = rows.filter(item => {
                    return !!item
                })

                resolve(rows)
            }
            reader.onerror = () => {
                reject(new Error('Resolve file error'))
            }
        }
        input.click()
    })
}

export default resolveLocalCsvFile