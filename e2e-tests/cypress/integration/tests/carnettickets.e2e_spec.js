import { menu, verify } from '../pageobjects/common.pageobject';
import {
    newTicket,
    options,
    summary,
    traveller,
    zone
} from '../pageobjects/buyticket.pageobject';
import { myprofile } from '../pageobjects/myprofile.pageobject';

describe('carnet ticket purchase', () => {
    beforeEach(function () {
        cy.visitMainAsAuthorized();

        cy.intercept("**/ticket/v1/search/zones").as("zones")
        menu.buyCarnetTicket().click();
        cy.wait("@zones")
        verify.verifyHeader('h2', 'Kjøp nytt klippekort');
    });

    it('should display default ticket parameters', () => {
        //Type
        newTicket.travelType().should("contain", "Buss og trikk")

        //Product
        newTicket.carnetTickets().should("contain", "10 billetter")

        //Traveller
        newTicket.travellerSection().then($traveller => {
            options.areVisible($traveller, true)
            options.value($traveller).should("contain", "1 Voksen")
        })

        //Zones
        newTicket.departureZoneSection().should("be.visible")
        zone.departureZone().should("have.value", "ATB:TariffZone:1")
        zone.departureZoneTariff("ATB:TariffZone:1").should("have.text", "A")
        newTicket.arrivalZoneSection().should("be.visible")
        zone.arrivalZone().should("have.value", "ATB:TariffZone:1")
        zone.arrivalZoneTariff("ATB:TariffZone:1").should("have.text", "A")

        //Price
        newTicket.price()
            .should("contain", "400,00")
            .and("contain", "kr")
        newTicket.mva()
            .should("contain", "24,00")
    })

    it('summary should show default ticket parameters', () => {
        newTicket.goToSummary()

        //Verify defaults
        summary.ticketDetails("Billettype").should("contain", "Klippekort")
        summary.ticketDetails("Reisetype").should("contain", "Buss / trikk")
        summary.ticketDetails("Antall billetter").should("contain", "10 billetter")
        summary.ticketDetails("Reisende").should("contain", "1 Voksen")
        summary.ticketDetails("Sone").should("contain", "Reise i 1 sone (A)")
        summary.ticketDetails("Gyldig fra").should("contain", "Kjøpstidspunkt")
        summary.price().should("contain", "400,00")
    })

    it('summary should be enabled for existing travel card', () => {
        newTicket.infoText().should("not.contain", "Legg til et t:kort før kjøp av billett")
        newTicket.goToSummaryButton().should("not.have.class", "ui-button--disabled")
        newTicket.goToSummary()
        verify.verifyHeader('h2', 'Oppsummering');
    })

    it('should include all payment options', () => {
        newTicket.goToSummary()
        verify.verifyHeader('h2', 'Oppsummering');

        summary.paymentOption("vipps").click()
        summary.paymentOptionLabel("vipps").should("contain", "Vipps")

        summary.paymentOption("visa").click()
        summary.paymentOptionLabel("visa").should("contain", "Visa")

        summary.paymentOption("mastercard").click()
        summary.paymentOptionLabel("mastercard").should("contain", "MasterCard")
    })

    it('stored payment cards should be available as payment method', () => {
        newTicket.goToSummary()
        verify.verifyHeader('h2', 'Oppsummering');

        //Pre
        summary.paymentOption("vipps").click()
        summary.payButton().should('contain', 'Gå til betaling')

        //Verify
        summary.storedPaymentOption("Visa").click()
        summary.storedPaymentOptionLabel("Visa").should("contain", "Visa, **** 0004")
        summary.storedPaymentOptionExpiry("Visa").should("contain", "Utløpsdato 08/24")
        summary.storedPaymentOptionIcon("Visa").should("have.attr", "src", "images/paymentcard-visa.svg")
        summary.payButton().should('contain', 'Betal nå')

        summary.storedPaymentOption("MasterCard").click()
        summary.storedPaymentOptionLabel("MasterCard").should("contain", "MasterCard, **** 0000")
        summary.storedPaymentOptionExpiry("MasterCard").should("contain", "Utløpsdato 06/24")
        summary.storedPaymentOptionIcon("MasterCard").should("have.attr", "src", "images/paymentcard-mastercard.svg")
        summary.payButton().should('contain', 'Betal nå')
    })

    it('new card should be able to save', () => {
        newTicket.goToSummary()
        verify.verifyHeader('h2', 'Oppsummering');

        //stored payment is default checked
        summary.paymentOption("vipps").should("not.be.checked")
        summary.paymentOption("vipps").click()
        summary.storePayment().should("not.exist")
        summary.storePaymentLabel().should("not.exist")

        summary.paymentOption("visa").click()
        summary.storePaymentConfirm().should("be.visible").and("not.be.checked")
        summary.storePaymentLabel().should("be.visible").and("contain", "Lagre betalingskort")

        summary.paymentOption("visa").click()
        summary.storePaymentConfirm().should("be.visible").and("not.be.checked")
        summary.storePaymentLabel().should("be.visible").and("contain", "Lagre betalingskort")
    })

    it('leaving the summary should remember changed ticket parameters', () => {
        const trav = 'Barn'

        //Set non-default values
        traveller.showOptions()
        traveller.set(trav)

        //Go to summary and back
        newTicket.goToSummary()
        verify.verifyHeader('h2', 'Oppsummering');
        summary.back()

        //Verify previously set values
        newTicket.travellerSection().then($traveller => {
            options.value($traveller).should("contain", "1 " + trav)
        })
    })

    it('changing traveller should update the offer and summary', () => {
        let currentOffer = 400
        const trav = 'Barn'

        //Change
        traveller.showOptions()
        traveller.set(trav)
        cy.wait("@zones")

        //Verify
        newTicket.price().then($price => {
            let price = parseInt($price.text().replace(".", "").split(",")[0])
            expect(price).to.not.eq(currentOffer)
            expect(price).to.be.lt(currentOffer)
            currentOffer = price
        })
        newTicket.goToSummary()
        summary.price().then($price => {
            let price = parseInt($price.text().replace(".", "").split(",")[0])
            expect(price).to.be.eq(currentOffer)
        })
        summary.ticketDetails("Reisende").should("contain", "1 " + trav)
        summary.back()
        newTicket.price().then($price => {
            let price = parseInt($price.text().replace(".", "").split(",")[0])
            expect(price).to.be.eq(currentOffer)
        })
    })

    //TODO: Zones are temporarily disabled
    xit('changing zones should update the offer and summary', () => {
        let currentOffer = 400
        const arrZone = 'B1'

        //Change
        zone.arrivalZone().select(arrZone)
        cy.wait("@zones")

        //Verify
        newTicket.price().then($price => {
            let price = parseInt($price.text().replace(".", "").split(",")[0])
            expect(price).to.not.eq(currentOffer)
            expect(price).to.be.gt(currentOffer)
            currentOffer = price
        })
        newTicket.goToSummary()
        summary.price().then($price => {
            let price = parseInt($price.text().replace(".", "").split(",")[0])
            expect(price).to.be.eq(currentOffer)
        })
        summary.ticketDetails("Sone").should("contain", "Reise fra sone A til sone " + arrZone)
        summary.back()
        newTicket.price().then($price => {
            let price = parseInt($price.text().replace(".", "").split(",")[0])
            expect(price).to.be.eq(currentOffer)
        })
    })

})