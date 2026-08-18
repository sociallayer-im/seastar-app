// Minimal trailing-edge debounce, replacing lodash's for our only use case
// (debounced search handlers; no .cancel/.flush needed).
export function debounce<A extends unknown[]>(fn: (...args: A) => unknown, wait: number): (...args: A) => void {
    let timer: ReturnType<typeof setTimeout> | undefined
    return (...args: A) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), wait)
    }
}
