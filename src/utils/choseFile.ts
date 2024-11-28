interface ChooseFileOption {
    accepts?: string[];
    validator?: (file: File) => void;
}

function chooseFile (opts?: ChooseFileOption): Promise<File[]> {
    return new Promise((resolve) => {
        const el = document.createElement('input')
        el.id = 'choose-file'
        el.style.position = 'absolute'
        el.style.visibility = 'hidden'
        el.style.top = '0'
        el.style.left = '0'

        el.type = 'file'
        el.accept = opts?.accepts?.join(',') || ''
        el.addEventListener('change', () => {
            if (!el.files?.length) {
                return
            }

            const files = Array.from(el.files)
            const { validator } = opts || {}
            files.forEach((file) => {
                if (opts?.accepts?.length && !opts.accepts.includes(file.type)) {
                    throw new Error('')
                }

                if (validator) {
                    validator(file)
                }
            })
            resolve(files)
            el.remove()
        })

        window.addEventListener('focus', ()=> {
            if (!el.files?.length) {
                el.remove()
            }
        })

        document.body.appendChild(el)
        el.click()
    })
}

export default chooseFile
