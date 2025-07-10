import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserModel } from "@/models";
import { handleApiError } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "employee" } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const user = await UserModel.findById(userId.toString());
    if (!user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { user: userResponse, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
