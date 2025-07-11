import { NextRequest, NextResponse } from "next/server";
import { ExpenseModel } from "@/models";
import { authenticateToken } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = authenticateToken(request);

    const userId = user.role === "employee" ? user.userId : undefined;
    const analytics = await ExpenseModel.getAnalytics(userId);

    return NextResponse.json(analytics);
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
