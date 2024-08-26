// validationSchemas.ts
import { z } from "zod";

// Define a schema for the signup form
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must only contain digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter") 
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"), 
});


// Define a schema for the signin form
export const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
