// Dingel Hafizia Madrasa — normalized fee rules
export const FEE_CATEGORIES = Object.freeze({ STANDARD:"STANDARD", ATIM:"ATIM", N_RSD:"N_RSD", CUSTOM:"CUSTOM", NO_FEE:"NO_FEE" });

export function normalizeFeeCategory(studentOrCategory) {
  const raw = typeof studentOrCategory === "string"
    ? studentOrCategory
    : (studentOrCategory?.feeCategory || studentOrCategory?.type || studentOrCategory?.studentType || studentOrCategory?.category || "STANDARD");
  const value = String(raw).trim().toUpperCase().replace(/[ -]+/g,"_");
  if (["ATIM","ORPHAN"].includes(value)) return FEE_CATEGORIES.ATIM;
  if (["N_RSD","NRSD","NON_RESIDENTIAL"].includes(value)) return FEE_CATEGORIES.N_RSD;
  if (["NO_FEE","FREE","POOR_FREE"].includes(value)) return FEE_CATEGORIES.NO_FEE;
  if (value === "CUSTOM") return FEE_CATEGORIES.CUSTOM;
  return FEE_CATEGORIES.STANDARD;
}

export function monthlyFeeFromStudent(student) {
  const category = normalizeFeeCategory(student);
  if (category === FEE_CATEGORIES.ATIM || category === FEE_CATEGORIES.NO_FEE) return 0;
  return Math.max(Number(student?.monthlyFee ?? student?.monthlyFees ?? 0) || 0, 0);
}

export function calculateFee(expected, paid) {
  const expectedAmount = Math.max(Number(expected) || 0, 0);
  const paidAmount = Math.min(Math.max(Number(paid) || 0, 0), expectedAmount);
  const dueAmount = Math.max(expectedAmount - paidAmount, 0);
  const status = expectedAmount === 0 ? "FREE" : paidAmount === 0 ? "UNPAID" : paidAmount < expectedAmount ? "PARTIAL" : "PAID";
  return { expectedAmount, paidAmount, dueAmount, status };
}
