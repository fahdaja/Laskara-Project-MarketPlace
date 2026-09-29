import { Check, ChevronRight, CloudUpload, Copy, CreditCard, QrCode, X } from "lucide-react";
import { useEffect, useState } from "react";
import { boostTransferDestination, initialBoostGigs } from "~/src/data/mockBoost";
import type { BoostGigs } from "~/src/types/BoostGigs";
import { formatRupiah } from "~/src/utils/formatRupiah";

interface BoostGigsModalProps {
  gigTitle: string;
  onClose: () => void;
}

export default function BoostGigsModal({
  gigTitle,
  onClose,
}: BoostGigsModalProps): React.JSX.Element | null {
  const [boost, setBoost] = useState<BoostGigs | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<
    "gateway-qris" | "gateway-va" | "manual-transfer" | null
  >(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isAccountNumberCopied, setIsAccountNumberCopied] = useState(false);
  const [isOpenGateway, setIsOpenGateway] = useState<boolean>(false);
  const [isOpenManual, setIsOpenManual] = useState<boolean>(false);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const toggleGateway = () => setIsOpenGateway((prev) => !prev);
  const toggleManual = () => setIsOpenManual((prev) => !prev);
  const selectedPaymentLabel =
    paymentMethod === "gateway-qris"
      ? "Pembayaran otomatis · QRIS"
      : paymentMethod === "gateway-va"
        ? "Pembayaran otomatis · Virtual Account"
        : "Transfer manual";
  const isTransferDestinationConfigured = Boolean(
    boostTransferDestination.bankName &&
      boostTransferDestination.accountNumber &&
      boostTransferDestination.accountHolder,
  );

  const handleCopyAccountNumber = async () => {
    if (!boostTransferDestination.accountNumber) return;

    try {
      await navigator.clipboard.writeText(boostTransferDestination.accountNumber);
      setIsAccountNumberCopied(true);
      window.setTimeout(() => setIsAccountNumberCopied(false), 1500);
    } catch {
      setIsAccountNumberCopied(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && boost) setCurrentStep(2);
    if (currentStep === 2 && paymentMethod) setCurrentStep(3);
  };

  const handleCloseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-slate-950/40 backdrop-blur-xs">
      <button
        type="button"
        aria-label="Tutup modal boost"
        onClick={onClose}
        className="absolute inset-0 z-0 cursor-default"
      />
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-full shrink-0 bg-blue-500 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-white">
                Boost Your Sales!
              </h1>
              <p className="mb-3 text-sm font-semibold text-blue-100">{gigTitle}</p>
            </div>
            <button
              type="button"
              onClick={handleCloseClick}
              aria-label="Tutup modal boost"
              className="rounded-lg p-2 text-white transition hover:bg-white/15"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-200">
            Tampilkan Gig Anda di halaman utama dan peringkat teratas hasil
            pencarian untuk mendapatkan lebih banyak pesanan.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-5">
          <div className="mb-5 flex gap-2" aria-label={`Langkah ${currentStep} dari 3`}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 flex-1 rounded-full ${
                  currentStep >= step ? "bg-blue-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {currentStep === 1 && (
            <>
          <label className="flex space-x-5 ml-2 items-center mb-3 font-bold">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[11px] flex items-center justify-center">
              1
            </span>
            <h2 className="font-bold">Pilih Durasi promosi</h2>
          </label>
          {/* Option Boosting */}
          <div className="flex flex-col gap-3">
            {initialBoostGigs.map((option) => (
              <label
                key={option.id}
                className={`flex relative cursor-pointer items-center justify-between rounded-2xl border px-5 py-4 transition ${
                  boost?.id === option.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="boost"
                  value={option.id}
                  checked={boost?.id === option.id}
                  onChange={() => setBoost(option)}
                  className="accent-blue-600"
                />
                {option.id === 2 && (
                    <span className="bg-blue-100 px-3 py-1 rounded-full font-semibold text-blue-700 w-fit absolute -right-2 -top-1 text-xs text-[10px]">REKOMENDASI</span>
                  )}
                <div className="mr-auto flex flex-col">
                  
                  <h3 className="ml-4 font-bold">{option.duration_days} hari</h3>
                  <p className="ml-4 text-sm text-gray-500">{option.subtitle}
                  </p>
                </div>
                <h2 className="font-bold">{formatRupiah(option.price)}</h2>
              </label>
            ))}
          </div>
            </>
          )}

          {/* Option Metode Pembayaran */}
          {currentStep === 2 && (
          <div className="space-y-5 mt-4">
            <label className="text-md font-bold text-slate-800 flex items-center gap-5 ml-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[11px] flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold">Metode Pembayaran</h2>
            </label>
            <div className="space-y-5 mb-4">
              <button
                className={`flex justify-between items-center border-b border-slate-200 w-full px-4 py-3 text-left transition ${
                  isOpenGateway ? "bg-blue-50/30" : "bg-white hover:bg-slate-50"
                }`}
                onClick={() => {
                  console.log("payment gateaway ditekan");
                  toggleGateway();
                }}
              >
                <span>Pembayaran otomatis</span>
                <ChevronRight
                  size={18}
                  className={`transition-transform duration-200 ${isOpenGateway ? "rotate-90 text-blue-600" : "text-slate-400"}`}
                />
              </button>

              {/* sub option payment gateway*/}

              {isOpenGateway && (
                <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in duration-150">
                  {/* Opsi 1: QRIS */}
                  <label className="flex items-center justify-between bg-white border-2 border-slate-200 hover:border-blue-400 p-3.5 rounded-2xl cursor-pointer transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/20">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="gateway_type"
                        id="qris"
                        value="gateway-qris"
                        checked={paymentMethod === "gateway-qris"}
                        onChange={() => setPaymentMethod("gateway-qris")}
                        className="accent-blue-600 w-4 h-4 hidden"
                      />
                      <QrCode size={18} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        QRIS
                      </span>
                    </div>
                  </label>

                  {/* Opsi 2: Virtual Account */}
                  <label className="flex items-center justify-between bg-white border-2 border-slate-200 hover:border-blue-400 p-3.5 rounded-2xl cursor-pointer transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/20">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="gateway_type"
                        id="va"
                        value="gateway-va"
                        checked={paymentMethod === "gateway-va"}
                        onChange={() => setPaymentMethod("gateway-va")}
                        className="accent-blue-600 w-4 h-4 hidden"
                      />
                      <CreditCard size={18} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Virtual Account
                      </span>
                    </div>
                  </label>
                </div>
              )}

              <button
                className={`flex justify-between items-center w-full border-b border-slate-200 px-4 py-3 text-left transition ${
                  isOpenManual ? "bg-blue-50/30" : "bg-white hover:bg-slate-50"
                }`}
                onClick={() => {
                  console.log("manual transfer berhasil ditekan");
                  toggleManual();
                }}
              >
                <span>Pembayaran manual</span>
                <ChevronRight
                  size={18}
                  className={`transition-transform duration-200 ${isOpenManual ? "rotate-90 text-blue-600 " : "text-slate-400"}`}
                />
              </button>

              {/* sub option payment manual */}

              {isOpenManual && (
                <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in duration-150">
                  <label className="flex items-center justify-between bg-white border-2 border-slate-200 hover:border-blue-400 p-3.5 rounded-2xl cursor-pointer transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50/20">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="manual_type"
                        id="manual-va"
                        value="manual-transfer"
                        checked={paymentMethod === "manual-transfer"}
                        onChange={() => setPaymentMethod("manual-transfer")}
                        className="accent-blue-600 w-4 h-4 hidden"
                      />
                      <CreditCard size={18} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Transfer Manual
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
          )}

          {currentStep === 3 && paymentMethod === "manual-transfer" && (
          <div className="space-y-4 mt-4 mb-7">
            <label className="text-md font-bold text-slate-800 flex items-center gap-5 ml-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[11px] flex items-center justify-center">
                3
              </span>
              <h2>Transfer Manual</h2>
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              {isTransferDestinationConfigured ? (
                <>
                  <div className="mb-3">
                    <span className="text-sm text-slate-500">Bank tujuan</span>
                    <p className="font-semibold text-slate-800">{boostTransferDestination.bankName}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm text-slate-500">Nomor rekening</span>
                    <div className="flex items-center justify-between gap-3">
                      <p className="break-all font-bold tracking-wide text-slate-900">
                        {boostTransferDestination.accountNumber}
                      </p>
                      <button
                        type="button"
                        onClick={handleCopyAccountNumber}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        aria-label="Salin nomor rekening"
                      >
                        {isAccountNumberCopied ? <Check size={16} /> : <Copy size={16} />}
                        {isAccountNumberCopied ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Atas nama</span>
                    <p className="font-semibold text-slate-800">{boostTransferDestination.accountHolder}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm font-medium text-amber-800">
                  Rekening tujuan transfer belum tersedia. Hubungi admin sebelum melakukan transfer.
                </p>
              )}
            </div>
            <p className="text-sm text-slate-600">
              Setelah transfer, unggah bukti pembayaran untuk verifikasi.
            </p>

            <div className="flex flex-col items-center justify-center ">
                <label className="flex flex-col items-center justify-center w-full py-5 px-4 bg-white border-2  border-gray-200 rounded-2xl cursor-pointer hover:border-blue-400 transition">
                    <CloudUpload size={35} className="text-blue-700 font-bold" />
                <span className="text-blue-900 font-semibold">
                  Drop files here or click to browse
                </span>
                <span className="text-xs text-slate-400">
                  PDF, JPG, or ZIP(Max 150mb)
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf,.zip"
                  className="hidden"
                  onChange={handleFileChange}
                />
                </label>
                {proofFile && (
                  <span className="mt-2 text-sm text-slate-600">{proofFile.name}</span>
                )}
            </div>
          </div>
          )}

          {currentStep === 3 && paymentMethod !== "manual-transfer" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Ringkasan Pembayaran</h2>
              <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 px-4">
                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="text-sm text-slate-500">Paket boost</span>
                  <span className="text-right text-sm font-semibold text-slate-800">
                    {boost?.subtitle}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="text-sm text-slate-500">Durasi promosi</span>
                  <span className="text-right text-sm font-semibold text-slate-800">
                    {boost?.duration_days} hari
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="text-sm text-slate-500">Metode pembayaran</span>
                  <span className="text-right text-sm font-semibold text-slate-800">
                    {selectedPaymentLabel}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="font-semibold text-slate-800">Total</span>
                  <span className="font-bold text-slate-900">
                    {boost ? formatRupiah(boost.price) : "-"}
                  </span>
                </div>
              </div>
              <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Detail QRIS atau Virtual Account akan tersedia setelah payment gateway untuk boost terhubung.
              </p>
            </div>
          )}

          {/* Total Pembayaran */}
        </div>
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-7 py-4">
            <div className="flex flex-col">
              <span className="text-gray-600">Total Pembayaran</span>
              <span className="font-bold">{boost ? formatRupiah(boost.price) : "Pilih durasi"}</span>
            </div>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((step) => (step - 1) as 1 | 2)}
                  className="rounded-lg px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Kembali
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 1 ? !boost : !paymentMethod}
                  className="rounded-lg bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  disabled={
                    paymentMethod === "manual-transfer" &&
                    (!proofFile || !isTransferDestinationConfigured)
                  }
                  className="rounded-lg bg-blue-500 px-3 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Konfirmasi pembayaran
                </button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
