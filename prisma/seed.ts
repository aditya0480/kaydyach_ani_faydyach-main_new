import 'dotenv/config'
import { prisma_db } from '../lib/prisma'
import bcrypt from 'bcryptjs'

const prisma = prisma_db

async function main() {
    const email = 'admin@kaydyacha.com'
    const name = 'Admin User'
    const password = await bcrypt.hash('admin123', 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name,
            password,
            role: 'ADMIN',
            isVerified: true,
        },
    })

    console.info('Admin user created/found:', user)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
