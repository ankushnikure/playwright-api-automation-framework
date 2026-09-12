import { test, expect } from "@fixtures/api.fixture";
import Ajv from "ajv";
import bookingSchema  from "@schemas/booking.schema.json";
import { createTestBooking } from "@utils/booking-helper";
import { Booking } from "@api/types/booking.types";

// Initialize AJV instance
const ajv = new Ajv();

// Compile JSON schema
const validateSchema = ajv.compile(bookingSchema);

test("Booking - Get Booking", async ({ apiClient, bookingService }) => {

    const bookingId = await createTestBooking(bookingService)

    const startTime = Date.now();

    // Send GET request through bookingService to retrieve booking details
    const getResponse = await bookingService.getBooking(bookingId);

    const responseTime = Date.now() - startTime;

    // Print response time for debugging/reference
    console.log(`Response Time: ${responseTime} ms`);

    // Validate response time
    expect(responseTime).toBeLessThan(2000);

    // Validate response status code
    expect(getResponse.status()).toBe(200);

    // Parse API response as Booking type
    const getBody = await apiClient.parseJsonResponse<Booking>(getResponse);

    // Validate response body
    expect(getBody.firstname).toBeDefined();

    // Validate response JSON schema
    const isSchemaValid = validateSchema(getBody);

    // Print schema validation errors (if any)
    if (!isSchemaValid) {
        console.log(validateSchema.errors);
    }

    expect(isSchemaValid).toBe(true);

    // Print response body for debugging/reference
    console.log(getBody);
    console.log("First Name:", getBody.firstname);

    // Retrieve all response headers
    const headers = getResponse.headers();

    // Print response headers for debugging/reference
    console.log(headers);
    console.log("Content-Length:", headers["content-length"]);
    console.log("Content-Type:", headers["content-type"]);
    console.log("Date:", headers["date"]);
    console.log("Server:", headers["server"]);

    // Content-Type may include charset (e.g. application/json; charset=utf-8)
    expect(getResponse.headers()["content-type"]).toContain("application/json");

    // These headers are dynamic or infrastructure-dependent, so only verify they exist
    expect(headers["content-length"]).toBeDefined();
    expect(headers["server"]).toBeDefined();
    expect(headers["date"]).toBeDefined();

});