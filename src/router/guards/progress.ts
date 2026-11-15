import nprogress from 'nprogress'

nprogress.configure({ showSpinner: false })

export const startProgress = () => nprogress.start()
export const doneProgress = () => nprogress.done()
