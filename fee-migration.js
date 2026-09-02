// Dingel Hafizia Madrasa — legacy student/fee data normalizer
import { normalizeFeeCategory, monthlyFeeFromStudent } from "./fee-structure.js";

export function normalizeStudentRecord(row = {}) {
  const name = row.name ?? row.studentName ?? row.STUDENTS ?? row.student ?? "";
  const roll = row.roll ?? row.admissionId ?? row.studentId ?? row.ROL ?? row.rollNo ?? "";
  const phone = row.phone ?? row.guardianPhone ?? row["PH NO"] ?? "";
  const guardian = row.guardian ?? row.fatherName ?? row.father ?? "";
  const className = row.className ?? row.class ?? row.classSection ?? "";
  const category = normalizeFeeCategory(row);
  return {
    ...row,
    studentId: row.studentId || String(roll || `ST-${Date.now()}`),
    name: String(name),
    class: row.class || className,
    className: row.className || className,
    roll: row.roll || roll,
    phone: String(phone),
    guardian: String(guardian),
    feeCategory: category,
    monthlyFee: monthlyFeeFromStudent(row),
    status: row.status || "Active"
  };
}

export function normalizeStudentRows(rows = []) { return rows.map(normalizeStudentRecord); }
