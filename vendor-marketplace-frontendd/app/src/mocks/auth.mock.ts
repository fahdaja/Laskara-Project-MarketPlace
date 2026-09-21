import type { AuthUser } from "~/src/types/auth";

export const MOCK_PASSWORD = "Test1234!";

export const MOCK_USERS: AuthUser[] = [
  {
    id: 1,
    email: "superadmin@test.com",
    fullName: "Super Admin",
    role: "SUPER_ADMIN",
    avatarUrl: null,
    isSuspended: false,
    createdAt: "2026-05-01T08:00:00.000Z",
  },

  {
    id: 2,
    email: "validator@test.com",
    fullName: "Admin Validator",
    role: "ADMIN_VALIDATOR",
    avatarUrl: null,
    isSuspended: false,
    createdAt: "2026-05-01T08:00:00.000Z",
  },

  {
    id: 3,
    email: "finance@test.com",
    fullName: "Finance Admin",
    role: "ADMIN_FINANCE",
    avatarUrl: null,
    isSuspended: false,
    createdAt: "2026-05-01T08:00:00.000Z",
  },

  {
    id: 4,
    email: "client@test.com",
    fullName: "Client User",
    role: "CLIENT",
    avatarUrl: null,
    isSuspended: false,
    createdAt: "2026-05-01T08:00:00.000Z",
  },

  {
    id: 5,
    email: "merchant@test.com",
    fullName: "Merchant Owner",
    role: "MERCHANT_OWNER",
    avatarUrl: null,
    isSuspended: false,
    createdAt: "2026-05-01T08:00:00.000Z",
  },

  {
    id: 6,
    email: "associate@test.com",
    fullName: "Merchant Associate",
    role: "MERCHANT_ASSOCIATE",
    avatarUrl: null,
    isSuspended: false,
    createdAt: "2026-05-01T08:00:00.000Z",
  },
];

export const MOCK_CLIENT = MOCK_USERS.find((user) => user.role === "CLIENT")!;
