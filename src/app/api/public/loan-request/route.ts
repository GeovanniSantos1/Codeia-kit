import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function isValidCPF(cpf: string) {
  const cleaned = cpf.replace(/\D/g, '')
  return cleaned.length === 11
}

function isValidCNPJ(cnpj: string) {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.length === 14
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      fullName, email, phone, cpf, birthDate, address,
      isClt, companyName, companyCnpj, jobPosition, monthlyIncome, occupation,
      loanAmount, loanPurpose, loanTermMonths,
      guaranteeDescription,
    } = body

    // Basic validation
    const errors: string[] = []
    if (!fullName?.trim()) errors.push('Nome completo é obrigatório')
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('E-mail inválido')
    if (!phone?.trim()) errors.push('Telefone é obrigatório')
    if (!cpf?.trim() || !isValidCPF(cpf)) errors.push('CPF inválido (informe os 11 dígitos)')
    if (!birthDate?.trim()) errors.push('Data de nascimento é obrigatória')
    if (!monthlyIncome?.trim()) errors.push('Renda mensal é obrigatória')
    if (isClt) {
      if (!companyName?.trim()) errors.push('Nome da empresa é obrigatório para trabalhador CLT')
      if (companyCnpj && !isValidCNPJ(companyCnpj)) errors.push('CNPJ inválido')
    } else {
      if (!occupation?.trim()) errors.push('Ocupação é obrigatória')
    }
    if (!loanAmount?.trim()) errors.push('Valor do empréstimo é obrigatório')
    if (!loanPurpose?.trim()) errors.push('Finalidade do empréstimo é obrigatória')
    if (!guaranteeDescription?.trim()) errors.push('Descrição da garantia é obrigatória')

    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    const application = await db.loanApplicationRequest.create({
      data: {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        cpf: cpf.replace(/\D/g, ''),
        birthDate: birthDate.trim(),
        address: address?.trim() || null,
        isClt: Boolean(isClt),
        companyName: isClt ? (companyName?.trim() || null) : null,
        companyCnpj: isClt ? (companyCnpj?.replace(/\D/g, '') || null) : null,
        jobPosition: isClt ? (jobPosition?.trim() || null) : null,
        monthlyIncome: monthlyIncome.trim(),
        occupation: !isClt ? (occupation?.trim() || null) : null,
        loanAmount: loanAmount.trim(),
        loanPurpose: loanPurpose.trim(),
        loanTermMonths: loanTermMonths ? Number(loanTermMonths) : null,
        guaranteeDescription: guaranteeDescription.trim(),
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, id: application.id }, { status: 201 })
  } catch (error) {
    console.error('Loan request error:', error)
    return NextResponse.json({ errors: ['Erro interno. Tente novamente.'] }, { status: 500 })
  }
}
