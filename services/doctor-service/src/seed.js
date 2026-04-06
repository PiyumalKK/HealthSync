const { Doctor, AvailabilitySlot } = require('./models');

const doctors = [
  {
    firstName: 'Kamal',
    lastName: 'Perera',
    email: 'kamal.perera@healthsync.lk',
    phone: '+94-77-123-4567',
    specialization: 'Cardiology',
    qualification: 'MD, FACC - University of Colombo',
    experience: 15,
    consultationFee: 5000.00,
    bio: 'Board-certified cardiologist with 15+ years of experience in interventional cardiology. Specializes in heart failure management and preventive cardiac care at National Hospital Colombo.',
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    totalReviews: 328,
    hospital: 'National Hospital Colombo',
    licenseNumber: 'SLMC-12345',
    languages: ['Sinhala', 'English', 'Tamil'],
    isVerified: true,
  },
  {
    firstName: 'Nishani',
    lastName: 'Fernando',
    email: 'nishani.fernando@healthsync.lk',
    phone: '+94-77-234-5678',
    specialization: 'Neurology',
    qualification: 'MD, PhD - University of Peradeniya',
    experience: 12,
    consultationFee: 6000.00,
    bio: 'Neurologist specializing in movement disorders, headache medicine, and neurodegenerative diseases. Published researcher in stroke treatment at Lanka Hospitals.',
    profileImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    rating: 4.8,
    totalReviews: 256,
    hospital: 'Lanka Hospitals',
    licenseNumber: 'SLMC-23456',
    languages: ['Sinhala', 'English'],
    isVerified: true,
  },
  {
    firstName: 'Amaya',
    lastName: 'Wickramasinghe',
    email: 'amaya.wickramasinghe@healthsync.lk',
    phone: '+94-77-345-6789',
    specialization: 'Pediatrics',
    qualification: 'MD, FAAP - University of Kelaniya',
    experience: 10,
    consultationFee: 3500.00,
    bio: 'Compassionate pediatrician dedicated to providing comprehensive healthcare for children from newborns to adolescents. Expert in developmental pediatrics at Lady Ridgeway Hospital.',
    profileImage: 'https://images.unsplash.com/photo-1594824476967-48c8b964f137?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    totalReviews: 412,
    hospital: 'Lady Ridgeway Hospital',
    licenseNumber: 'SLMC-34567',
    languages: ['Sinhala', 'English', 'Tamil'],
    isVerified: true,
  },
  {
    firstName: 'Ruwan',
    lastName: 'Jayawardena',
    email: 'ruwan.jayawardena@healthsync.lk',
    phone: '+94-77-456-7890',
    specialization: 'Orthopedics',
    qualification: 'MD, FAAOS - University of Sri Jayewardenepura',
    experience: 18,
    consultationFee: 5500.00,
    bio: 'Orthopedic surgeon specializing in sports medicine, joint replacement, and minimally invasive arthroscopic procedures. Consultant at Asiri Surgical Hospital.',
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
    rating: 4.7,
    totalReviews: 289,
    hospital: 'Asiri Surgical Hospital',
    licenseNumber: 'SLMC-45678',
    languages: ['Sinhala', 'English'],
    isVerified: true,
  },
  {
    firstName: 'Dilani',
    lastName: 'Silva',
    email: 'dilani.silva@healthsync.lk',
    phone: '+94-77-567-8901',
    specialization: 'Dermatology',
    qualification: 'MD, FAAD - University of Colombo',
    experience: 8,
    consultationFee: 4500.00,
    bio: 'Dermatologist with expertise in medical and cosmetic dermatology. Specializes in skin cancer screening, acne treatment, and anti-aging procedures at Nawaloka Hospital.',
    profileImage: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=face',
    rating: 4.8,
    totalReviews: 195,
    hospital: 'Nawaloka Hospital',
    licenseNumber: 'SLMC-56789',
    languages: ['Sinhala', 'English'],
    isVerified: true,
  },
  {
    firstName: 'Tharindu',
    lastName: 'Dissanayake',
    email: 'tharindu.dissanayake@healthsync.lk',
    phone: '+94-77-678-9012',
    specialization: 'Psychiatry',
    qualification: 'MD, MPH - University of Peradeniya',
    experience: 11,
    consultationFee: 4000.00,
    bio: 'Psychiatrist focused on mood disorders, anxiety, and PTSD. Integrates evidence-based psychotherapy with pharmacological treatment at Durdans Hospital.',
    profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
    rating: 4.9,
    totalReviews: 367,
    hospital: 'Durdans Hospital',
    licenseNumber: 'SLMC-67890',
    languages: ['Sinhala', 'English', 'Tamil'],
    isVerified: true,
  },
  {
    firstName: 'Sachini',
    lastName: 'Bandara',
    email: 'sachini.bandara@healthsync.lk',
    phone: '+94-77-789-0123',
    specialization: 'Ophthalmology',
    qualification: 'MD - University of Jaffna',
    experience: 14,
    consultationFee: 4800.00,
    bio: 'Ophthalmologist specializing in cataract surgery, LASIK, and retinal diseases. Pioneer in minimally invasive eye surgery techniques at Eye Hospital Colombo.',
    profileImage: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
    rating: 4.7,
    totalReviews: 213,
    hospital: 'Eye Hospital Colombo',
    licenseNumber: 'SLMC-78901',
    languages: ['Sinhala', 'English', 'Tamil'],
    isVerified: true,
  },
  {
    firstName: 'Chaminda',
    lastName: 'Rathnayake',
    email: 'chaminda.rathnayake@healthsync.lk',
    phone: '+94-77-890-1234',
    specialization: 'General Medicine',
    qualification: 'MD, FACP - University of Ruhuna',
    experience: 20,
    consultationFee: 3000.00,
    bio: 'Experienced internal medicine physician providing comprehensive primary care. Expert in managing chronic conditions like diabetes, hypertension at Teaching Hospital Karapitiya.',
    profileImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    rating: 4.8,
    totalReviews: 524,
    hospital: 'Teaching Hospital Karapitiya',
    licenseNumber: 'SLMC-89012',
    languages: ['Sinhala', 'English'],
    isVerified: true,
  }
];

const defaultSlots = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
  { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
  { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
  { dayOfWeek: 2, startTime: '14:00', endTime: '17:00' },
  { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
  { dayOfWeek: 3, startTime: '14:00', endTime: '17:00' },
  { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
  { dayOfWeek: 4, startTime: '14:00', endTime: '17:00' },
  { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' },
];

async function seedDoctors() {
  try {
    const count = await Doctor.count();
    if (count > 0) {
      console.log(`📋 ${count} doctors already exist, skipping seed`);
      return;
    }

    for (const doc of doctors) {
      const created = await Doctor.create(doc);
      for (const slot of defaultSlots) {
        await AvailabilitySlot.create({ ...slot, doctorId: created.id });
      }
    }

    console.log(`🌱 Seeded ${doctors.length} doctors with availability slots`);
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = seedDoctors;
