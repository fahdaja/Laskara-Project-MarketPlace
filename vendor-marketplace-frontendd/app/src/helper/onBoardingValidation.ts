
export const validateOnBoardingSteps = (step: number, formData: any): { isValid: boolean; message?: string } => {
    if (step === 1) {
        if (!formData.bio || !formData.bio.trim()) return { isValid: false, message: "Silahkan isi deskripsi Toko" }
    }

    if (step === 2) {
        if (!formData.bankName) return { isValid: false, message: "Silahkan pilih bank terlebih dahulu" }
        const cleanAccountNumber = String(formData.accountNumber || "").trim()
        if (!cleanAccountNumber || isNaN(Number(cleanAccountNumber)) || cleanAccountNumber.length < 8) {
            return { isValid: false, message: "Nomor rekening harus berupa angka yang valid (minimal 8 digit)" }
        }
        if (!formData.accountHolder || !formData.accountHolder.trim()) return { isValid: false, message: "Nama pemilik rekening wajib diisi" }
    }

    if (step === 3) {
        if (!formData.securityPin) {
            return { isValid: false, message: "Nomor PIN wajib diisi" }
        }
        if (isNaN(Number(formData.securityPin))) {
            return { isValid: false, message: "PIN harus berupa angka" }
        }
        if (formData.securityPin.length !== 6) {
            return { isValid: false, message: "PIN harus 6 digit" }
        }
        if (formData.confirmPin !== undefined && formData.securityPin !== formData.confirmPin) {
            return { isValid: false, message: "Konfirmasi PIN tidak sama" }
        }
    }

    if (step === 4) {
        if (!formData.studentIdCard) {
            return { isValid: false, message: "Silahkan unggah foto/scan KTM terlebih dahulu" }
        }
        if (typeof formData.studentIdCard === "object" && formData.studentIdCard !== null && 'size' in formData.studentIdCard) {
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (formData.studentIdCard.size > maxSize) {
                return { isValid: false, message: "Ukuran file KTM maksimal 5MB" }
            }
        }
    }

    return { isValid: true }
}

