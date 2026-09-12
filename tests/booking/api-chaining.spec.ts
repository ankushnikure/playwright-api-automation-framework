import { test, expect } from "@playwright/test";
import createBookingPayload from "@testdata/booking/payloads/create-booking.json";
import updateBookingPayload from "@testdata/booking/payloads/update-booking.json";
import partialUpdateBookingPayload from "@testdata/booking/payloads/partial-update-booking.json";
import {
    generateTimestamp,
    generateUniqueValue
} from "@utils/test-data-generator";
import { getAuthToken } from "@auth/auth";
import { ApiClient } from "@api/clients/api.client";
import { BookingService } from "@api/services/booking.service";

test('API Chaining - Create Booking', async ({ request }) => {

    // Initialize Services
    const apiClient = new ApiClient(request);
    const bookingService = new BookingService(apiClient);

    const token = await getAuthToken(request);
    console.log("Auth Token:", token);

    const timestamp = generateTimestamp();

    const createPayload = structuredClone(createBookingPayload);

    createPayload.firstname = generateUniqueValue("John", timestamp);
    createPayload.lastname = generateUniqueValue("Doe", timestamp);
    createPayload.additionalneeds = generateUniqueValue("Breakfast", timestamp);

    const createResponse = await bookingService.createBooking(createPayload);

    expect(createResponse.status()).toBe(200);

    const createBody = await createResponse.json();
    console.log("Create Booking Response:", createBody);

    // Capture bookingId from POST response
    const bookingId = createBody.bookingid;
    console.log("Booking ID:", bookingId);

    // --------------------
    // API Chain Starts Here
    // --------------------

    // Retrieve the newly created booking using the bookingId returned by POST
    const getResponse = await bookingService.getBooking(bookingId);

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();
    console.log("Get Booking Response:", getBody);

    expect(getBody.firstname).toBe(createPayload.firstname);
    expect(getBody.lastname).toBe(createPayload.lastname);
    expect(getBody.totalprice).toBe(createPayload.totalprice);
    expect(getBody.depositpaid).toBe(createPayload.depositpaid);
    expect(getBody.additionalneeds).toBe(createPayload.additionalneeds);
    


    // --------------------
    // PUT request
    // --------------------

    const updatedPayload = structuredClone(updateBookingPayload);


    const updateTimestamp = generateTimestamp();

    updatedPayload.firstname = generateUniqueValue("UpdatedJohn", updateTimestamp);
    updatedPayload.lastname = generateUniqueValue("UpdatedDoe", updateTimestamp);
    updatedPayload.additionalneeds = generateUniqueValue("Lunch", updateTimestamp);

    const updateResponse = await bookingService.updateBooking(
        bookingId,
        updatedPayload,
        token
    );

    expect(updateResponse.status()).toBe(200);
    const updateBody = await updateResponse.json();
    console.log("Update Booking Response:", updateBody);

    expect(updateBody.firstname).toBe(updatedPayload.firstname);
    expect(updateBody.lastname).toBe(updatedPayload.lastname);
    expect(updateBody.totalprice).toBe(updatedPayload.totalprice);
    expect(updateBody.depositpaid).toBe(updatedPayload.depositpaid);
    expect(updateBody.additionalneeds).toBe(updatedPayload.additionalneeds);

    // --------------------
    // Verify Updated Booking (GET)
    // --------------------

    const verifyUpdatedResponse = await bookingService.getBooking(bookingId);

    expect(verifyUpdatedResponse.status()).toBe(200);

    const verifyUpdatedBody = await verifyUpdatedResponse.json();

    console.log("Verify Updated Booking Response:", verifyUpdatedBody);

    expect(verifyUpdatedBody.firstname).toBe(updatedPayload.firstname);
    expect(verifyUpdatedBody.lastname).toBe(updatedPayload.lastname);
    expect(verifyUpdatedBody.totalprice).toBe(updatedPayload.totalprice);
    expect(verifyUpdatedBody.depositpaid).toBe(updatedPayload.depositpaid);
    expect(verifyUpdatedBody.additionalneeds).toBe(updatedPayload.additionalneeds);

    // --------------------
    // PATCH Request
    // --------------------

    const patchPayload = structuredClone(partialUpdateBookingPayload);

    const patchTimestamp = generateTimestamp();

    patchPayload.firstname = generateUniqueValue("PatchedJohn", patchTimestamp);
    patchPayload.additionalneeds = generateUniqueValue("Dinner", patchTimestamp);

    const patchResponse = await bookingService.partialUpdateBooking(
        bookingId,
        patchPayload,
        token
    );

    expect(patchResponse.status()).toBe(200);

    const patchBody = await patchResponse.json();

    console.log("Patch Booking Response:", patchBody);

    expect(patchBody.firstname).toBe(patchPayload.firstname);
    expect(patchBody.additionalneeds).toBe(patchPayload.additionalneeds);

    // Unchanged fields should remain the same after PATCH
    expect(patchBody.lastname).toBe(updatedPayload.lastname);
    expect(patchBody.totalprice).toBe(updatedPayload.totalprice);
    expect(patchBody.depositpaid).toBe(updatedPayload.depositpaid);

    // --------------------
    // Verify Patched Booking (GET)
    // --------------------

    const verifyPatchedResponse = await bookingService.getBooking(bookingId);

    expect(verifyPatchedResponse.status()).toBe(200);
    const verifyPatchedBody = await verifyPatchedResponse.json();
    console.log("Verify Patched Booking Response:", verifyPatchedBody);

    expect(verifyPatchedBody.firstname).toBe(patchPayload.firstname);
    expect(verifyPatchedBody.additionalneeds).toBe(patchPayload.additionalneeds);
    expect(verifyPatchedBody.lastname).toBe(updatedPayload.lastname);
    expect(verifyPatchedBody.totalprice).toBe(updatedPayload.totalprice);
    expect(verifyPatchedBody.depositpaid).toBe(updatedPayload.depositpaid);

    // --------------------
    // DELETE Request
    // --------------------

    const deleteResponse = await bookingService.deleteBooking(
        bookingId,
        token
    )

    expect(deleteResponse.status()).toBe(201);
    console.log("Delete Booking Response: Booking deleted successfully");

    // --------------------
    // Verify Booking Deletion (GET)
    // --------------------

    const verifyDeleteResponse = await bookingService.getBooking(bookingId);

    expect(verifyDeleteResponse.status()).toBe(404);
    console.log("Verify Delete Response: Booking not found (404)");
})