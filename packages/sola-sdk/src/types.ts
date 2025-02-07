export interface SolaSdkFunctionParams <T> {
    params: T
    clientMode: 'dev' | 'prod'
}