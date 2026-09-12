import { test as base } from "@playwright/test";
import { ApiClient } from "@api/clients/api.client";
import { BookingService } from "@api/services/booking.service";
import { getAuthToken } from "@auth/auth";

// Define the objects that our custom test will provide
type ApiFixtures = {
    apiClient: ApiClient;
    bookingService: BookingService
    authToken: string;
}

// Extend Playwright's test with our custom fixtures
export const test = base.extend<ApiFixtures>({

    // Create ApiClient using Playwright's built-in request fixture
    apiClient: async ({ request }, use) => {

        const apiClient = new ApiClient(request);

        // Make ApiClient available to the test
        await use(apiClient);
    },

    // Create BookingService using our ApiClient fixture
    bookingService: async ({ apiClient }, use) => {

        const bookingService = new BookingService(apiClient);

        // Make BookingService available to the test
        await use(bookingService);
    },

    // Generate authentication token
    authToken: async ({ request }, use) => {

        const token = await getAuthToken(request);

        // Make authentication token available to the test
        await use(token);
    }
});

// Re-export expect so tests can import both from this fixture
export { expect } from "@playwright/test";