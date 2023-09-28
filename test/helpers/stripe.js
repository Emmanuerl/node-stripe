const sinon = require("sinon");
const { Stripe } = require("stripe");
const { faker } = require("@faker-js/faker");

/**
 * @typedef {sinon.SinonStubbedInstance<Stripe>} Stub
 *
 * @typedef CreateInvoiceInput
 * @prop {string} customer
 * @prop {number} amount
 *
 * @typedef CreateSubscriptionInput
 * @prop {string} customer
 * @prop {string} price
 */

/**
 * generates a mock of the stripe sdk
 * @returns {Stub}
 */
const getInstance = () => new Stripe();

function newSubscription() {
  return {
    id: faker.string.uuid(),
    latest_invoice: {
      payment_intent: {
        client_secret: faker.string.alphanumeric(24),
      },
    },
  };
}

function newInvoice() {
  return {
    id: faker.string.uuid(),
    payment_intent: {
      client_secret: faker.string.alphanumeric(24),
    },
  };
}

/**
 *
 * @param {Stub} stripe
 * @param {CreateInvoiceInput} input
 * @returns
 */
function mockCreateInvoice(stripe, input) {
  const invoice = newInvoice();

  const create = sinon
    .stub(stripe.invoices, "create")
    .withArgs()
    .resolves(invoice);

  const appendItems = sinon
    .stub(stripe.invoiceItems, "create")
    .withArgs({
      customer: input.customer,
      amount: input.amount * 100,
      invoice: invoice.id,
    })
    .resolves();

  const finalise = sinon
    .stub(stripe.invoices, "finalizeInvoice")
    .withArgs(invoice.id, {
      expand: ["payment_intent"],
    })
    .resolves(invoice);

  return { create, appendItems, finalise };
}

/**
 *
 * @param {Stub} stripe
 * @param {CreateSubscriptionInput} input
 * @returns
 */
function mockCreateSubscription(stripe, input) {
  const subscription = newSubscription();
  return sinon
    .stub(stripe.subscriptions, "create")
    .withArgs({
      customer: input.customer,
      items: [
        {
          price: input.price,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    })
    .resolves(subscription);
}

module.exports = { mockCreateInvoice, getInstance, mockCreateSubscription };
