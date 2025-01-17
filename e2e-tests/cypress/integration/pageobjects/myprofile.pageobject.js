import { menu, verify } from './common.pageobject';

export const myprofile = {
    firstName: () =>
        cy
            .get('.ui-textContainer')
            .contains('Fornavn')
            .parents('.ui-labelItem')
            .find("span"),
    lastName: () =>
        cy
            .get('.ui-textContainer')
            .contains('Etternavn')
            .parents('.ui-labelItem')
            .find("span"),
    phoneNumber: () =>
        cy
            .get('.ui-textContainer')
            .contains('Telefonnummer')
            .parents('.ui-labelItem')
            .find("span"),
    logInMethod: () =>
        cy
            .get('h2.ui-section__headerTitle')
            .contains('Innloggingsmetode')
            .parents('.ui-section__item'),
    storedPayments: () =>
        cy
            .get('h2.ui-section__headerTitle')
            .contains('Lagrede betalingskort')
            .parents('.ui-section__item'),
    policyStatement: () =>
        cy
            .get('h2.ui-section__headerTitle')
            .contains('Personvern')
            .parents('.ui-section__item')
            .find("a"),

    saveValue: () =>
        cy
            .get('button.ui-editSection__fieldset__saveButton')
            .contains('Lagre')
            .parents("button")
            .click()
            .wait(200),
    cancel: () => cy.get('button').contains('Avbryt').parents("button").click(),
    editProfileName: () =>
        cy.get('button').contains('Endre navn').click(),
    setFirstName: firstname => cy.get('input#firstname').type('{selectall}{del}' + firstname),
    setLastName: lastname => cy.get('input#lastname').type('{selectall}{del}' + lastname),
    setProfileName: (firstname, lastname) => {
        cy.intercept('PATCH', '**/webshop/v1/profile').as('profile');

        cy.get('button').contains('Endre navn').click();
        cy.get('input#firstname').type('{selectall}{del}' + firstname);
        cy.get('input#lastname').type('{selectall}{del}' + lastname);
        cy.get('button.ui-editSection__fieldset__saveButton')
            .contains('Lagre')
            .click();
        cy.wait('@profile');
    },
    editPhoneNumber: () =>
        cy.get('button').contains('telefonnummer').click(),
    typePhoneNumber: phoneNumber => cy.get('input#phone').type('{selectall}{del}' + phoneNumber),
    setPhoneNumber: (phoneNumber) => {
        cy.intercept('PATCH', '**/webshop/v1/profile').as('profile');
        cy.intercept('GET', '**/ticket/v2/recurring-payments').as('recurringPayments');
        cy.intercept("GET", "**/webshop/v1/consent").as("consent")

        cy.get('button').contains('telefonnummer').click();
        cy.get('input#phone').type('{selectall}{del}' + phoneNumber);
        cy.get('button.ui-editSection__fieldset__saveButton')
            .contains('Lagre')
            .parents("button")
            .click();

        //The loading sometimes takes time
        cy.get('button.ui-editSection__fieldset__saveButton').then($button => {
            if($button.attr('aria-label').includes('Laster')){
                cy.wait(2000)
            }
        })

        cy.wait(['@profile','@recurringPayments','@consent']);
    },
    phoneError: () => cy.get("#phone-error"),
    travelCard: () => cy.get(".ui-travelCardText"),
    addTravelCard: () => cy.get('button').contains('Legg til t:kort').scrollIntoView(),
    removeTravelCardButton: () => cy.get('button').contains('Fjern t:kort'),
    removeTravelCard: () => {
        cy.get('button').contains('Fjern t:kort').click()
        cy.get('button.ui-editSection__fieldset__saveButton').contains('Fjern t:kort').click()
    },
    removeTravelCardWarning: () =>
        cy.get('h2.ui-section__headerTitle')
            .contains('Billettbærere')
            .parents('.ui-section__item')
            .find(".ui-editSection__fieldset__buttonGroup__deleteText"),
    travelCardError: () => cy.get("#tkort-error"),
    travelCardInput: () => cy.get('input#tkort'),

    emailConsent: () => cy.get('input#consent1186'),
    emailConsentLabel: () => cy.get("label[for='consent1186']"),
    notificationConsent: () => cy.get('input#consent1197'),
    notificationConsentLabel: () => cy.get("label[for='consent1197']"),

    storedPayment: type => cy.get('h2.ui-section__headerTitle')
        .contains('Lagrede betalingskort')
        .parents('.ui-section__item')
        .find('form.ui-editSection')
        .contains(type),
    storedPaymentIcon: type => cy.get('h2.ui-section__headerTitle')
        .contains('Lagrede betalingskort')
        .parents('.ui-section__item')
        .find('form.ui-editSection')
        .contains(type)
        .parents('form.ui-editSection')
        .find(".ui-editSection__icon")
        .find("img"),
    storedPaymentExpiry: type => cy.get('h2.ui-section__headerTitle')
        .contains('Lagrede betalingskort')
        .parents('.ui-section__item')
        .find('form.ui-editSection')
        .contains(type)
        .parents('form.ui-editSection')
        .find(".pageAccount__recurringPayment__expiry"),
    removeStoredPayment: type => cy.get('h2.ui-section__headerTitle')
        .contains('Lagrede betalingskort')
        .parents('.ui-section__item')
        .find('form.ui-editSection')
        .contains(type)
        .parents('form.ui-editSection')
        .find("button.ui-editSection__editButton"),
    storedPaymentRemovalWarning: () => cy.get(".ui-editSection__fieldset__buttonGroup__deleteText"),

    //remove or add (currently not used)
    travelCardOperation: (operation) => {
        const travelCardNo = Cypress.env('travelCardNo')

        cy.intercept('POST', '**/webshop/v1/travelcard').as('addTravelcard');
        cy.intercept('DELETE', '**/webshop/v1/travelcard').as(
            'removeTravelcard'
        );

        menu.myProfile().click();
        verify.verifyHeader('h2', 'Min profil');

        //Add or remove travel card
        cy.get('h2.ui-section__headerTitle')
            .contains('Billettbærere')
            .parents('.ui-section__item')
            .find('.ui-labelItem')
            .then(($elem) => {
                if ($elem.text().includes('Du har ingen t:kort registrert')) {
                    if (operation === 'add') {
                        cy.get('button')
                            .contains('Legg til t:kort')
                            .click({ force: true });
                        cy.get('input#tkort').type(travelCardNo);
                        cy.get('button')
                            .contains('Lagre')
                            .click({ force: true });
                        cy.wait('@addTravelcard');
                    }
                } else {
                    if (operation === 'remove') {
                        cy.get('button.ui-editSection__editButton')
                            .contains('Fjern t:kort')
                            .click({ force: true });
                        cy.get('button.ui-editSection__fieldset__saveButton')
                            .contains('Fjern t:kort')
                            .click({ force: true });
                        cy.wait('@removeTravelcard');
                    }
                }
            });
    }
};
