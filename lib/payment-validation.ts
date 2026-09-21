export function amountFromCents(value: number) { return (value / 100).toFixed(2); }
export function validateCapture(input: { orderStatus: string; captureStatus?: string; capturedValue?: string; capturedCurrency?: string; expectedCents: number; recordedCents: number; recordedCurrency: string }) {
  return input.orderStatus === "COMPLETED" && input.captureStatus === "COMPLETED" && input.capturedValue === amountFromCents(input.expectedCents) && input.capturedCurrency === "EUR" && input.recordedCents === input.expectedCents && input.recordedCurrency === "EUR";
}
