import { NextRequest, NextResponse } from 'next/server';
import { getActiveCompanies, createCompany, getAllCompanies } from '@/services/companyService';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { handleError } from '@/middleware/errorHandler';
import { companySchema, queryParamsSchema } from '@/utils/validation';

/**
 * GET /api/companies
 * Get all active companies (public) or all companies (admin)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Try to authenticate (optional for this endpoint)
    const authResponse = await authenticateToken(request);
    const isAdmin = !authResponse; // If auth succeeded, user might be admin

    if (isAdmin && searchParams.get('all') === 'true') {
      // Admin: Get all companies with pagination
      const result = await getAllCompanies(page, limit);
      return NextResponse.json({
        success: true,
        data: result.companies,
        pagination: result.pagination,
      });
    } else {
      // Public: Get active companies only
      const companies = await getActiveCompanies();
      return NextResponse.json({
        success: true,
        data: companies,
      });
    }
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/companies
 * Create a new company (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResponse = await authenticateToken(request);
    if (authResponse) {
      return authResponse;
    }

    // Verify admin role
    const adminResponse = await requireAdmin(request as any);
    if (adminResponse) {
      return adminResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = companySchema.parse(body);

    // Create company
    const company = await createCompany(validatedData);

    return NextResponse.json(
      {
        success: true,
        message: 'Company created successfully',
        data: company,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
