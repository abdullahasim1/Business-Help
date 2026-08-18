import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required")
});

export const agentSchema = yup.object({
  name: yup.string().min(2, "At least 2 characters").required("Agent name is required"),
  systemInstructions: yup.string().min(10, "At least 10 characters").required("Instructions are required"),
  language: yup.string().min(2, "At least 2 characters").required("Language is required"),
  tone: yup.string().min(2, "At least 2 characters").required("Tone is required"),
  status: yup.string().oneOf(["ACTIVE", "INACTIVE"]).required(),
  calendlyUrl: yup.string().url("Use a full link like https://calendly.com/your-name").notRequired()
});

export const widgetSchema = yup.object({
  chatEnabled: yup.boolean(),
  callEnabled: yup.boolean(),
  allowedOrigins: yup.string().max(2000).nullable()
});

export const knowledgeSchema = yup.object({
  type: yup.string().oneOf(["WEBSITE", "MANUAL"]).required(),
  url: yup.string().when("type", {
    is: "WEBSITE",
    then: (schema) => schema.url("Enter a valid URL").required("Website URL is required"),
    otherwise: (schema) => schema.notRequired()
  }),
  content: yup.string().when("type", {
    is: "MANUAL",
    then: (schema) => schema.min(10, "At least 10 characters").required("Knowledge content is required")
  })
});

export const businessSchema = yup.object({
  name: yup.string().min(2, "At least 2 characters").required("Business name is required"),
  website: yup.string().url("Enter a valid URL").nullable(),
  adminName: yup.string().min(2, "At least 2 characters").required("Admin name is required"),
  adminEmail: yup.string().email("Enter a valid email").required("Admin email is required"),
  adminPassword: yup.string().min(8, "At least 8 characters").required("Password is required")
});
