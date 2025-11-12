import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerTenantSchema } from '@/lib/validations/schemas';
import { generateVerificationToken } from '@/lib/utils/helpers';
import { sendEmail, getVerificationEmailTemplate } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validation = registerTenantSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, name, phone } = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    const verificationToken = generateVerificationToken();
    const verificationExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        role: 'TENANT',
        provider: 'EMAIL',
        verificationToken,
        verificationExpiry,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}&type=tenant`;

    await sendEmail({
      to: email,
      subject: 'Verifikasi Email Anda',
      html: getVerificationEmailTemplate(name, verificationUrl),
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
