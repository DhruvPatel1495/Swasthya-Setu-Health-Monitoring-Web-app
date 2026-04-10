import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/Doctor.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const updatePricesToINR = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Price Update...');

    const doctors = await Doctor.find({});
    
    for (const doc of doctors) {
      // If the old price was low (e.g., 50, 60, 70, 80), it was in $
      // Let's set it to a realistic Indian Rupee value below 1000.
      let newPrice;
      if (doc.pricing < 150) {
        // Just multiply by 10 or set a fixed realistic value based on specialization
        if (doc.specialization === 'General Health') newPrice = 500;
        else if (doc.specialization === 'Cardiology') newPrice = 800;
        else if (doc.specialization === 'Neurology') newPrice = 900;
        else if (doc.specialization === 'Pediatrics') newPrice = 600;
        else if (doc.specialization === 'Psychiatry') newPrice = 850;
        else newPrice = 700; // default for unknown
      } else if (doc.pricing >= 1000) {
        // If someone accidentally set a very high price already, clamp it
        newPrice = 900;
      } else {
        // If it's already between 150 and 1000, leave it or round it
        newPrice = doc.pricing;
      }

      await Doctor.updateOne({ _id: doc._id }, { $set: { pricing: newPrice } });
      console.log(`Updated pricing for Doctor ID ${doc._id} to ₹${newPrice}`);
    }

    console.log('All prices updated successfully in INR.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update prices:', error);
    process.exit(1);
  }
};

updatePricesToINR();
