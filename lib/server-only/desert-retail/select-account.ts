import type { MeterAccount } from "./ravasvend-contract"

export function selectMeterAccount(accounts: readonly MeterAccount[], voucherCode: string): MeterAccount | null {
	return accounts.find((account) => account.voucherCode === voucherCode) ?? null
}
