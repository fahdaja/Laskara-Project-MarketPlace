import type { BoostGigs } from "../types/BoostGigs";

export const initialBoostGigs: BoostGigs [] = [
    {
        id: 1,
        duration_days: "3",
        subtitle: "Booster ringan",
        price: 50000
    },
    {
        id: 2,
        duration_days: "7",
        subtitle: "Pilihan populer",
        price: 110000
    },
    {
        id:3,
        duration_days: "30",
        subtitle: "Dominasi pasar",
        price: 450000
    }

]

export const boostTransferDestination = {
    bankName: "",
    accountNumber: "",
    accountHolder: "",
};