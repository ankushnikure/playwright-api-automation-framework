import { expect } from "@playwright/test";
import createBookingPayload from "@testdata/booking/payloads/create-booking.json";
import {
    generateTimestamp,
    generateUniqueValue,
    generateFirstName
} from "@utils/test-data-generator";
import { BookingService } from "@api/services/booking.service";
import { CreateBookingResponse } from "@api/types/booking.types";

export async function createTestBooking(bookingService: BookingService): Promise<number> {

    const payload = structuredClone(createBookingPayload);

    const timestamp = generateTimestamp();

    payload.firstname = generateFirstName(timestamp);
    payload.lastname = generateUniqueValue("Doe", timestamp);
    payload.additionalneeds = generateUniqueValue("Breakfast", timestamp);

    // Send POST request through bookingService to retrieve booking details
    const response = await bookingService.createBooking(payload);

    expect(response.status()).toBe(200);

   // Parse API response as CreateBookingResponse type
    const body: CreateBookingResponse = await response.json();

    return body.bookingid;
}