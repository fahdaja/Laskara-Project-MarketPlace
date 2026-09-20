import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { OrderStatus, Role } from '@prisma/client';


describe('TransactionsController', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken!: string;
  let buyerToken!: string

  
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = module.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());
    await app.init()

    prisma= app.get<PrismaService>(PrismaService);

    const merchantUser = await prisma.user.upsert({
    where: { email: 'merchant-test@example.com' },
    update: {},
    create: {
      email: 'merchant-test@example.com',
      passwordHash: 'password123',
      fullName: 'Merchant Test',
      role: Role.MERCHANT_OWNER,
    },
  });

  const merchant = await prisma.merchant.upsert({
    where: { userId: merchantUser.id },
    update: {},
    create: {
      userId: merchantUser.id,
      shopName: 'Toko Test Spec',
      status: 'ACTIVE',
      bankAccounts: {
        create: {
        bankName: 'BCA',
        accountNumber: '123456789',
        accountHolderName: 'Merchant Test',
        isPrimary: true, 
      },
      }
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: 'client0@test.com' },
    update: {},
    create: {
      email: 'client0@test.com',
      passwordHash: 'password123',
      fullName: 'Buyer Test',
      role: Role.CLIENT,
    },
  });

  // 2. CREATE ORDER DUMMY ID: 1
  await prisma.order.create({
    data: {
      merchantId: merchant.id,
      clientId: buyerUser.id,
      gigId: 1, // Pastikan Gig ID 1 ada atau bikin dummy gig
      totalAmount: 150000,
      adminFee: 7500,
      status: OrderStatus.RELEASE_APPROVED_WAITING_FINANCE,
    },
  });

    const loginAdminResponse = await request(app.getHttpServer())
      .post('/auth/admin/login')
      .send({
        email: 'finance@test.com',
        password: 'finance123',
        role: 'ADMIN_FINANCE'
      })

      adminToken = loginAdminResponse.body.data?.access_token
      console.log('Response admin login:', loginAdminResponse.body)

      const loginBuyerResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'client1@test.com',
        password: 'client123',
        role: 'CLIENT'
      })

      buyerToken = loginBuyerResponse.body.data?.access_token

      console.log('Response buyer login:', loginBuyerResponse.body)
  });

  afterAll(async () => {
    await app.close();
  })

  describe('PATCH /transactions/:id/release', () => {
    it('harus mengembalikan status code 200/201', async () => {
    await prisma.order.update({
        where: { id: 1 },
        data: { status: OrderStatus.RELEASE_APPROVED_WAITING_FINANCE },
      });
      return request(app.getHttpServer())
      .patch('/transactions/1/release')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminId: 4})
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe(OrderStatus.COMPLETED)
      });
    });

    it('harus mengembalikan 403 jika bukan admin', async () => {
      expect(buyerToken).toBeDefined();
      const response = await request(app.getHttpServer())
      .patch('/transactions/1/release')
      .set('Authorization', `Bearer ${buyerToken}`)
      expect(response.status).toBe(403)
    })

    it('data tidak di temukan di database', async () => {
      return request(app.getHttpServer())
      .patch('/transactions/999/release')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404)
    })
  })

  describe('PATCH /transactions/:id/refund', () => {
    
    it('harus mengembalikan status code 200/201', async () => {
       await prisma.order.update({
        where: { id: 1 },
        data: { status: OrderStatus.REFUND_APPROVED_WAITING_FINANCE },
      });
      return request(app.getHttpServer())
      .patch('/transactions/1/refund')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ adminId: 4})
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe(OrderStatus.REFUNDED)
      });
    });

    it('harus mengembalikan 403 jika bukan admin', async () => {
      expect(buyerToken).toBeDefined();
      const response = await request(app.getHttpServer())
      .patch('/transactions/1/refund')
      .set('Authorization', `Bearer ${buyerToken}`)
      expect(response.status).toBe(403)
    })

    it('data tidak di temukan di database', async () => {
      return request(app.getHttpServer())
      .patch('/transactions/999/refund')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404)
    })
  })
});
