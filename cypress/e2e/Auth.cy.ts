
const api = 'https://sails-dev.sola.day'
const auth_field = 'solar_auth'
const true_auth = 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MjkwMjYsImFkZHJlc3NfdHlwZSI6ImVtYWlsIiwiaHR0cHM6Ly9oYXN1cmEuaW8vand0L2NsYWltcyI6eyJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJ1c2VyIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJ1c2VyIl0sIngtaGFzdXJhLXVzZXItaWQiOiIyOTAyNiJ9fQ.HDBzeDq0uDuQH9k8_E2r7BKRFrmxRwLHf1i8Mof0wPg'

describe.skip('Email Sign-in', () => {
    beforeEach(() => {
        cy.intercept('get', `${api}/siwe/verify`, {
            statusCode: 200,
            body: {result: 'ok', auth_token: '123'},
        })

        cy.intercept('post', `${api}/service/send_email`, {
            statusCode: 200,
            body: {result: "ok"},
        })

        cy.intercept('post', `${api}/profile/signin_with_email`, {
            statusCode: 200,
            body: {result: "ok", auth_token: 'auth_token'},
        })

        cy.setCookie('lang', 'en')
    })


    it.skip('Existed email user', () => {

        // mock profile/me
        cy.intercept('get', `${api}/profile/me`, {
            statusCode: 200,
            fixture: 'profile.json',
        })


        cy.visit('/?return=http://localhost:3000/status')

        // input email
        cy.get('input[name="email"]').type('475469442@qq.com')
        cy.get('input[name="email"]').type('{enter}')

        // input pin code
        cy.get('input[data-testid="pin-code-input"]').type('123456')

        // check return
        cy.url().should('eq', 'http://localhost:3000/status')
    })

    it.skip('New email user', () => {
        // mock profile/me
        cy.intercept('get', `${api}/profile/me?auth_token=auth_token`, {
            statusCode: 200,
            fixture: 'profile_no_handle.json',
        })

        cy.intercept('get', `${api}/profile/get_by_handle?handle=ppnnsspp`, {
            statusCode: 200,
            body: {profile: {}, message: 'mock'},
        })

        cy.intercept('get', `${api}/profile/get_by_handle?handle=ppnnsspp-2`, {
            statusCode: 200,
            body: {profile: null, message: 'mock'},
        })

        cy.intercept('post', `${api}/profile/create`, {
            statusCode: 200,
            body: { result: "ok", message:'mock' },
        })

        cy.visit('/?return=http://localhost:3000/status')

        // input email
        cy.get('input[name="email"]').type('475469442@qq.com')
        cy.get('input[name="email"]').type('{enter}')

        // input pin code
        cy.get('input[data-testid="pin-code-input"]').type('123456')

        // check return
        cy.url().should('eq', 'http://localhost:3000/register')

        // input existing username
        cy.get('input[name="username"]').type('ppnnsspp')
        cy.get('button').click()
        expect(cy.contains('User already exists').should('exist'))

        // input invalid username
        cy.get('input[name="username"]').type('--')
        cy.get('button').click()
        expect(cy.contains('Hyphens cannot appear consecutively').should('exist'))


        // input valid username
        cy.get('input[name="username"]').clear()
        cy.get('input[name="username"]').type('ppnnsspp-2')
        cy.get('button').click()
        cy.get('button').click()
    })

    it.skip('Bind email', () => {
        cy.setCookie(auth_field, true_auth)
        cy.setCookie('return', 'http://localhost:3000/status')


        cy.intercept('get', `${api}/profile/get_by_email?email=475469442@qq.com`, {
            statusCode: 200,
            body: {profile: null, message: 'mock'},
        })

        cy.intercept('get', `${api}/profile/get_by_email?email=exist@qq.com`, {
            statusCode: 200,
            body: {profile: {}, message: 'mock'},
        })

        cy.intercept('post', `${api}/profile/set_verified_email`, {
            statusCode: 200,
            body: {result: "ok"},
        })

        // input email to be used
        cy.visit('/bind-email')
        cy.get('input[name="email"]').type('exist@qq.com')
        cy.get('button').click()
        cy.contains('Email is already in use').should('exist')

        // input new email
        cy.get('input[name="email"]').clear()
        cy.get('input[name="email"]').type('475469442@qq.com')
        cy.get('button').click()
        cy.get('button').click()
        cy.url().should('eq', 'http://localhost:3000/verify-bind-email?email=475469442%40qq.com')

        cy.get('input[data-testid=pin-code-input]').type('12345')

        // check return
        cy.url().should('eq', 'http://localhost:3000/status')
    })
})


describe.skip('Middleware', () => {
    it('Redirect to root when no login', () => {
        cy.visit('/bind-email')
        cy.url().should('eq', 'http://localhost:3000/')
    })
})

describe.skip('Wallet Sign-in', () => {
    it('MetaMask Sign-in', () => {
        cy.visit('/?return=http://localhost:3000/status')
        cy.contains('MetaMask').click()
        cy.wait(10000)
        // check return
        cy.url().should('eq', 'http://localhost:3000/status')
    })
})

describe.skip('Zupass Sign-in', () => {
    it('Zupass Sign-in', () => {
        cy.visit('/?return=http://localhost:3000/status')
        cy.contains('Zupass').click()
        cy.wait(10000)
        // check return
        cy.url().should('eq', 'http://localhost:3000/status')
    })
})

describe.skip('Solana Sign-in', () => {
    it('Solana Sign-in', () => {
        cy.visit('/?return=http://localhost:3000/status')
        cy.contains('Solana').click()

        // connect wallet
        cy.wait(1000)
        cy.get('button[data-testid=solana-sigin-in-wallet]').click()
        cy.get('button[data-testid=solana-sigin-in-btn]').click()
        cy.wait(5000)

        // check return
        cy.url().should('eq', 'http://localhost:3000/status')
    })
})

describe('Farcast Sign-in', () => {
    it('Farcast Sign-in', () => {
        cy.visit('/?return=http://localhost:3000/status')

        cy.wait(5000)

        cy.get('div[data-testid=farcaster-option-item]').click()

        cy.wait(20000)

        // check return
        cy.url().should('eq', 'http://localhost:3000/register')
    })
})


