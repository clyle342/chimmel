import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPhone = process.env.ADMIN_PHONE ?? '+254700000000';
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: Role.ADMIN },
    create: { phone: adminPhone, role: Role.ADMIN }
  });

  const owner = await prisma.user.upsert({
    where: { phone: '+254711111111' },
    update: { role: Role.OWNER },
    create: { phone: '+254711111111', role: Role.OWNER }
  });

  const driverUser = await prisma.user.upsert({
    where: { phone: '+254722222222' },
    update: { role: Role.DRIVER },
    create: { phone: '+254722222222', role: Role.DRIVER }
  });

  await prisma.driverProfile.upsert({
    where: { userId: driverUser.id },
    update: { status: 'APPROVED', isOnline: true },
    create: {
      userId: driverUser.id,
      vehicleType: 'Sedan',
      plate: 'KAA 123A',
      capacityNotes: 'Small crate',
      docSubmitted: true,
      status: 'APPROVED',
      isOnline: true
    }
  });

  await prisma.trip.create({
    data: {
      ownerId: owner.id,
      pickup: 'Westlands',
      dropoff: 'Karen',
      petType: 'DOG',
      petSize: 'M',
      ownerRides: true,
      routeBand: 'CITY'
    }
  });
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
