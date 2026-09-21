import test from "node:test"; import assert from "node:assert/strict"; import { validateCapture } from "../lib/payment-validation.ts";
const valid = { orderStatus: "COMPLETED", captureStatus: "COMPLETED", capturedValue: "9.90", capturedCurrency: "EUR", expectedCents: 990, recordedCents: 990, recordedCurrency: "EUR" };
test("un paiement confirmé et conforme est accepté", () => assert.equal(validateCapture(valid), true));
test("un paiement échoué n'est jamais accepté", () => assert.equal(validateCapture({ ...valid, captureStatus: "DECLINED" }), false));
test("un montant ou une devise divergente bloque le déblocage", () => { assert.equal(validateCapture({ ...valid, capturedValue: "0.90" }), false); assert.equal(validateCapture({ ...valid, capturedCurrency: "USD" }), false); });
