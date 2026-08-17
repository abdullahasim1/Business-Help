import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const upmatchKnowledge = `
UpMatch Recruitment Knowledge Base

Company overview:
UpMatch is a recruitment and hiring support platform that helps job seekers find suitable roles and helps employers manage candidates. The assistant should answer questions about jobs, applications, interviews, hiring support, candidate follow-up, and recruitment workflow.

For job seekers:
Candidates can ask about available jobs, how to apply, application status, interview preparation, CV/resume tips, required documents, salary expectations, notice period, relocation, remote or onsite preferences, and follow-up. If a candidate wants to apply, collect name, phone number, email address, job title or area of interest, experience level, location preference, and expected salary if they are comfortable sharing it.

Job categories:
UpMatch can support roles across administration, sales, customer support, marketing, operations, IT, software development, finance, HR, healthcare support, warehouse, logistics, and entry-level roles. If a user asks for a specific job and exact vacancy data is not available, explain that the team can check current openings and collect their contact details for follow-up.

Application process:
The normal process is: share basic contact details, tell the team what job or role you want, submit or prepare your CV/resume, short screening call, employer review, interview scheduling, interview feedback, and final offer or next steps. The assistant should keep this explanation simple and friendly.

Required candidate details:
Important lead details are full name, phone number, email address, target job/role, years of experience, current city, preferred work type, and best time to contact. The widget already asks name, phone, and email first. After that, ask only the missing job-related details that are relevant to the user's question.

CV and resume guidance:
A strong CV should include clear contact details, a short professional summary, recent work experience, measurable achievements, relevant skills, education, certifications, and correct dates. Keep the CV clean, one to two pages where possible, and tailor it to the job description. Avoid spelling mistakes, fake experience, unclear job titles, and missing phone/email.

Interview preparation:
Candidates should prepare by reading the job description, researching the company, practicing common interview questions, preparing examples from past work, confirming interview time and format, dressing appropriately for the role, testing phone/internet for online interviews, and preparing salary and availability answers.

Common interview questions:
Tell me about yourself. Why are you interested in this role? What experience do you have? What are your strengths? What challenges have you handled? Why should we hire you? What salary are you expecting? When can you start? The assistant can help the user practice answers.

Application status:
If a candidate asks about status, explain that the recruitment team can confirm after checking the application record. Ask for name, phone, email, and role applied for if not already captured. Do not invent a status.

For employers:
Employers can ask for hiring support, candidate sourcing, screening, interview coordination, shortlist creation, follow-up, and recruitment process help. Collect company name, contact person name, phone, email, role to hire for, number of vacancies, required skills, location, salary range, and hiring timeline.

Hiring workflow:
Employer hiring workflow is: define role requirements, receive candidate profiles, screening, shortlist, interviews, feedback, offer, and onboarding. UpMatch can help organize communication and candidate follow-up through chat/call leads.

Pricing and exact live vacancies:
Exact pricing, current live jobs, employer contracts, and final salary packages are not stored in this knowledge base. If asked, say the team can confirm and offer to collect contact details. Never make up a price, vacancy count, salary, or guarantee.

Contact and follow-up:
The assistant should always be helpful and professional. If the answer needs human confirmation, ask for the user's details and tell them the recruitment team will follow up. For urgent hiring or job support, recommend using the call widget.

Tone and language:
Use clear, simple English only. Keep answers short, practical, and recruitment-focused. Never reply in Roman Urdu or Hinglish.
`;

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The demo seed is disabled in production.");
  }

  const seedPassword = process.env.SEED_PASSWORD;
  if (!seedPassword) throw new Error("Set SEED_PASSWORD before running the demo seed.");
  const passwordHash = await hashPassword(seedPassword);

  await prisma.user.upsert({
    where: { email: "super@example.com" },
    update: { passwordHash },
    create: {
      name: "Super Admin",
      email: "super@example.com",
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });

  const existingBusiness = await prisma.business.findFirst({ where: { name: "ABC Solar" } });
  const business = existingBusiness
    ? existingBusiness
    : await prisma.business.create({
        data: {
          name: "ABC Solar",
          website: "https://example.com",
          agentName: "Sarah AI",
          agentInstructions:
            "You are a helpful AI assistant for ABC Solar. Answer questions using the business knowledge provided. Never invent information.",
          welcomeMessage: "Hi! Ask me about ABC Solar services.",
          primaryColor: "#0f766e",
          agentLanguage: "English",
          agentTone: "Friendly",
          knowledgeText:
            "Business Hours: Monday-Friday 9 AM - 6 PM. Services: Solar Installation, Solar Maintenance, Solar Consultation. Service area: local residential and small commercial customers."
        }
      });

  await prisma.user.upsert({
    where: { email: "admin@abcsolar.test" },
    update: { passwordHash, businessId: business.id },
    create: {
      name: "ABC Solar Admin",
      email: "admin@abcsolar.test",
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: business.id
    }
  });

  const existingUpmatchBusiness = await prisma.business.findFirst({ where: { name: "UpMatch Recruitment" } });
  const upmatchBusiness = existingUpmatchBusiness
    ? existingUpmatchBusiness
    : await prisma.business.create({
        data: {
          name: "UpMatch Recruitment",
          website: "http://localhost:3002",
          agentName: "UpMatch AI",
          agentInstructions:
            "You are a helpful recruitment assistant for UpMatch. Answer using the provided recruitment knowledge. Do not invent exact job vacancies, salaries, pricing, or application status. If information is missing, collect relevant lead details and offer follow-up.",
          agentLanguage: "English",
          agentTone: "Professional and friendly",
          welcomeMessage: "Hi! I can help with jobs, applications, interviews, or hiring support.",
          primaryColor: "#0f766e",
          knowledgeText: upmatchKnowledge
        }
      });

  await prisma.user.upsert({
    where: { email: "admin@upmatch.test" },
    update: {
      name: "UpMatch Admin",
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: upmatchBusiness.id
    },
    create: {
      name: "UpMatch Admin",
      email: "admin@upmatch.test",
      passwordHash,
      role: Role.BUSINESS_ADMIN,
      businessId: upmatchBusiness.id
    }
  });

}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
