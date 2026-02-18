const { PrismaClient } = require('@prisma/client')

async function main() {
    const prisma = new PrismaClient()

    const employeeIds = process.argv.slice(2)

    if (employeeIds.length === 0) {
        console.log('使い方: node scripts/seed_user.js <氏名コード1> <氏名コード2> ...')
        console.log('例: node scripts/seed_user.js 20588648')
        process.exit(1)
    }

    for (const employeeId of employeeIds) {
        try {
            const existing = await prisma.user.findUnique({
                where: { employeeId },
            })

            if (existing) {
                console.log(`⏭️  ユーザー ${employeeId} は既に登録されています (ID: ${existing.id})`)
                continue
            }

            const user = await prisma.user.create({
                data: { employeeId },
            })

            console.log(`✅ ユーザー ${employeeId} を登録しました (ID: ${user.id})`)
        } catch (error) {
            console.error(`❌ ユーザー ${employeeId} の登録に失敗:`, error)
        }
    }

    await prisma.$disconnect()
}

main()
