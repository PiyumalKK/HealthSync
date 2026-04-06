const { Doctor } = require('./models');
const Review = require('./models/Review');

const reviewsData = [
  { patientName: 'Sanduni Jayasuriya', patientAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Life-saving care', comment: 'Dr. Perera is an exceptional cardiologist. He diagnosed my condition early and the treatment plan has been remarkably effective. I feel so much better now!' },
  { patientName: 'Nuwan Gunawardena', patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Highly professional', comment: 'Incredible attention to detail. He explained every aspect of my heart condition in terms I could understand. The follow-ups have been thorough and reassuring.' },
  { patientName: 'Hasini De Silva', patientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', rating: 4, title: 'Great experience overall', comment: 'Very knowledgeable doctor. Wait time was a bit long but the consultation itself was excellent. She took her time with me and addressed all my concerns.' },
  { patientName: 'Lakshan Weerasinghe', patientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Best neurologist in Colombo', comment: 'Dr. Fernando\'s expertise in neurology is unmatched. She correctly identified the source of my chronic headaches after other doctors couldn\'t. Highly recommend!' },
  { patientName: 'Kavindi Rajapaksha', patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Amazing with children', comment: 'Dr. Wickramasinghe is wonderful with kids. My daughter actually looks forward to her checkups now. She makes the experience fun and stress-free for the whole family.' },
  { patientName: 'Sahan Madushanka', patientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', rating: 4, title: 'Knee surgery success', comment: 'Had ACL reconstruction with Dr. Jayawardena. The surgery went perfectly and his rehabilitation guidance has been spot on. Almost back to playing cricket!' },
  { patientName: 'Nethmi Abeysekara', patientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Transformed my skin', comment: 'Dr. Silva helped clear my adult acne when nothing else worked. Her approach combines science with genuine care. My confidence has soared!' },
  { patientName: 'Dinuka Herath', patientAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Changed my life', comment: 'Dr. Dissanayake helped me manage my anxiety and depression. His empathetic approach and evidence-based treatment has genuinely changed my quality of life.' },
  { patientName: 'Ishara Nanayakkara', patientAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face', rating: 4, title: 'LASIK was amazing', comment: 'Had LASIK with Dr. Bandara and the results are incredible. 20/20 vision now! The procedure was quick and the recovery was smooth.' },
  { patientName: 'Chamara Samarawickrama', patientAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Best family doctor', comment: 'Dr. Rathnayake has been our family doctor for years. He\'s thorough, patient, and really gets to know his patients. Manages my diabetes expertly.' },
  { patientName: 'Malsha Gunathilake', patientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face', rating: 5, title: 'Exceptional care', comment: 'Dr. Perera went above and beyond during my cardiac episode. His quick thinking and expertise were incredible. I owe him my health.' },
  { patientName: 'Ravindu Karunaratne', patientAvatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face', rating: 4, title: 'Very thorough', comment: 'Dr. Fernando ran comprehensive tests and was very meticulous in her diagnosis. The treatment for my migraines has been very effective.' },
];

async function seedReviews() {
  try {
    const count = await Review.count();
    if (count > 0) {
      console.log(`📝 ${count} reviews already exist, skipping seed`);
      return;
    }

    const doctors = await Doctor.findAll({ where: { isActive: true } });
    if (doctors.length === 0) return;

    let reviewIndex = 0;
    for (const doctor of doctors) {
      const numReviews = Math.min(2, reviewsData.length - reviewIndex);
      for (let i = 0; i < numReviews && reviewIndex < reviewsData.length; i++) {
        await Review.create({
          doctorId: doctor.id,
          patientId: `seed_patient_${reviewIndex}`,
          ...reviewsData[reviewIndex],
          isVerified: Math.random() > 0.3,
        });
        reviewIndex++;
      }
    }

    console.log(`🌱 Seeded ${reviewIndex} reviews across ${doctors.length} doctors`);
  } catch (err) {
    console.error('Review seed error:', err.message);
  }
}

module.exports = seedReviews;
