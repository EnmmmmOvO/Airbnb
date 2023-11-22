import 'cypress-file-upload';

describe('UI Test', () => {
  it('Register a user', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Sign up').click()
    cy.url().should('include', 'localhost:3000/register')
    cy.get('input[name="email"]')
      .focus()
      .type('cs6080@cse.unse.edu.au')
    cy.get('input[name="name"]')
      .focus()
      .type('6080 HD')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('input[name="confirmPassword"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="register-button"]').click()
    cy.url().should('include', 'localhost:3000/')
  })

  it('Register second user', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Sign up').click()
    cy.url().should('include', 'localhost:3000/register')
    cy.get('input[name="email"]')
      .focus()
      .type('cs60802@cse.unse.edu.au')
    cy.get('input[name="name"]')
      .focus()
      .type('6080 HD 2')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('input[name="confirmPassword"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="register-button"]').click()
    cy.url().should('include', 'localhost:3000/')
  })

  it('Create A Hosting', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs6080@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.contains('Switch to hosting').click()
    cy.url().should('include', 'localhost:3000/myHosting')
    cy.contains('Create A Hosting').click()
    cy.url().should('include', 'localhost:3000/createHosting')
    cy.get('input[name="title"]')
      .focus()
      .type('HD Rooms')
    cy.get('[data-testid="nob"]')
      .find('select')
      .select('2')
    cy.get('[data-testid="pType"]')
      .find('select')
      .select('1')
    cy.get('input[name="rent"]')
      .type('12580')
    cy.get('input[name="street1"]')
      .type('Unit 1')
    cy.get('input[name="street2"]')
      .type('88 Long Street')
    cy.get('input[name="city"]')
      .type('Kensington')
    cy.get('[data-testid="state"]')
      .find('select')
      .select('1')
    cy.get('input[name="postcode"]')
      .type('2033')
    cy.get('[data-testid="add-bedrooms-button"]').click()
    cy.get('[data-testid="bedsnumber0"]')
      .find('select')
      .select('2')
    cy.get('[data-testid="bedstype0"]')
      .find('select')
      .select('1')
    cy.get('[data-testid="add-bedrooms-button"]').click()
    cy.get('[data-testid="bedsnumber1"]')
      .find('select')
      .select('1')
    cy.get('[data-testid="bedstype1"]')
      .find('select')
      .select('4')
    cy.get('[data-testid="add-amenity-button"]').click()
    cy.get('[data-testid="add-amenity-button"]').click()
    cy.get('[data-testid="add-amenity-button"]').click()
    cy.get('[data-testid="amenities0"]')
      .find('input')
      .focus()
      .type('Wifi')
    cy.get('[data-testid="amenities1"]')
      .find('input')
      .focus()
      .type('Air Conditioner')
    cy.get('[data-testid="amenities2"]')
      .find('input')
      .focus()
      .type('Washing Machine')

    cy.get('[data-testid="image-upload"]').attachFile('test1.jpg');
    cy.get('[data-testid="submit"]').click()

    cy.wait(1000)
    cy.url().should('include', 'localhost:3000/myHosting')
  })

  it('Edit Hosting', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs6080@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.contains('Switch to hosting').click()
    cy.url().should('include', 'localhost:3000/myHosting')
    cy.wait(1000)
    cy.get('[data-testid="edit-button').first().click()
    cy.url().should('include', 'localhost:3000/hosting/');
    cy.get('input[name="title"]')
      .focus()
      .type('HD Rooms Nice!!!')
    cy.get('[data-testid="image-upload"]').attachFile('test2.jpg');
    cy.get('[data-testid="submit"]').click()
    cy.wait(1000)
    cy.url().should('include', 'localhost:3000/myHosting')
  })

  it('Publish a hosting', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs6080@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.contains('Switch to hosting').click()
    cy.url().should('include', 'localhost:3000/myHosting')
    cy.wait(1000)
    cy.get('[data-testid="publish-button').first().click()
    cy.get('[data-testid="start-date0"')
      .find('input')
      .focus()
      .type('2023-12-01')
    cy.get('[data-testid="end-date0"')
      .find('input')
      .focus()
      .type('2023-12-30')
    cy.get('[data-testid="publish-data-select-button"]').click()
  })

  it('Unpublished A hosting', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs6080@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.contains('Switch to hosting').click()
    cy.url().should('include', 'localhost:3000/myHosting')
    cy.wait(1000)
    cy.get('[data-testid="unpublish-button').first().click()
  })

  it('Publish hosting again', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs6080@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.contains('Switch to hosting').click()
    cy.url().should('include', 'localhost:3000/myHosting')
    cy.wait(1000)
    cy.get('[data-testid="publish-button').first().click()
    cy.get('[data-testid="start-date0"')
      .find('input')
      .focus()
      .type('2023-12-01')
    cy.get('[data-testid="end-date0"')
      .find('input')
      .focus()
      .type('2023-12-30')
    cy.get('[data-testid="publish-data-select-button"]').click()
  })

  it('Booking', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs60802@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.wait(1000)
    cy.get('[data-testid="listing-img"]').first().click()
    cy.wait(1000)
    cy.get('[data-testid="start-date-picker"]')
      .find('input')
      .focus()
      .type('2023-12-05')
    cy.get('[data-testid="end-date-picker"]')
      .find('input')
      .focus()
      .type('2023-12-15')
    cy.get('[data-testid="booking-button"]').click()
  })

  it('Exit the application', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs60802@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.wait(1000)
    cy.get('[data-testid="profile-button"]').click()
  })

  it('Exit and then reenter', () => {
    cy.visit('localhost:3000/');
    cy.url().should('include', 'localhost:3000/')
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs60802@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
    cy.wait(1000)
    cy.get('[data-testid="profile-button"]').click()
    cy.get('[data-testid="profile-button"]').click()
    cy.contains('Log in').click()
    cy.url().should('include', 'localhost:3000/login')
    cy.get('input[name="email"]')
      .focus()
      .type('cs60802@cse.unse.edu.au')
    cy.get('input[name="password"]')
      .focus()
      .type('608023T3')
    cy.get('[data-testid="signin-button"]').click()
    cy.url().should('include', 'localhost:3000/')
  })
})
