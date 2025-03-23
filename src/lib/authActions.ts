import { redirect } from "next/navigation";
import { TokenContent } from "hybrid-types/DBTypes";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import CustomError from "../classes/CustomError";
import { getUserByUsername } from "@/models/userModels";
import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs";
const key = process.env.JWT_SECRET;

export async function login(formData: FormData) {
  // Verify credentials && get the user
  if (!key)
    throw new CustomError("Internal server error: JWT secret not found", 500);

  const userLogin = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const user = await getUserByUsername(userLogin.username);

  if (!user || !bycrypt.compareSync(userLogin.password, user.password))
    throw new CustomError("Invalid credentials", 401);

  const tokenContent: TokenContent = {
    user_id: user.user_id,
    level_name: user.level_name,
  };

  // Create the session
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = jwt.sign(tokenContent, key, { expiresIn: "7d" });

  // Save the session in a cookie
  (await cookies()).set("session", session, { expires, httpOnly: true });
}

export async function logout() {
  // Destroy the session
  (await cookies()).set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;

  if (!key)
    throw new CustomError("Internal server error: JWT secret not found", 500);

  return jwt.verify(session, key) as TokenContent;
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  if (!key)
    throw new CustomError("Internal server error: JWT secret not found", 500);

  const tokenContent = jwt.verify(session, key) as TokenContent;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: jwt.sign(tokenContent, key, { expiresIn: "7d" }),
    httpOnly: true,
    expires,
  });
  return res;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user_id) redirect("/login");
}
