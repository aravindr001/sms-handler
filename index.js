const express = require("express");
const admin = require("firebase-admin");
const twilio = require("twilio");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: false }));

// Initialize Firebase
const serviceAccount = require("./serviceAccountKey.json"); // 🔹 Download this from Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

// Handle incoming SMS
app.post("/sms", async (req, res) => {
    const fromNumber = req.body.From;
    const pincode = req.body.Body.trim(); // Get pincode from SMS

    const doc = await db.collection("pincodes").doc(pincode).get();
    let replyMessage = "Sorry, no information available for this pincode.";
    
    if (doc.exists) {
        replyMessage = doc.data().message;
    }

    // Send reply SMS
    await twilioClient.messages.create({
        body: replyMessage,
        from: twilioNumber,
        to: fromNumber
    });

    res.status(200).send("Message processed.");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

