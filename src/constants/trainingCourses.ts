export const trainingCourses = {
  Skoda: [
    "ŠKODA Basic Qualification Fundamental",
    "ŠKODA Basic Qualification Electrics",
    "ŠKODA Basic Qualification Technology",
    "ŠKODA Advance Qualification Engines",
    "ŠKODA Advance Qualification Transmission",
    "ŠKODA Advance Qualification HVAC & Convenience Systems",
    "ŠKODA Advance Qualification Running Gear",
    "ŠKODA Diagnostic Qualification Diagnostic Technology",
    "ŠKODA Diagnostic Qualification Master Certification",
    "ŠKODA Basic Body Repair",
    "ŠKODA Advance Body Repair",
    "ŠKODA Expert Body Repair",
  ],
  Volkswagen: [
    "VW Basic Qualification Fundamental",
    "VW Basic Qualification Electrics",
    "VW Basic Qualification Technology",
    "VW Advance Qualification Engines",
    "VW Advance Qualification Transmission",
    "VW Advance Qualification HVAC & Convenience Systems",
    "VW Advance Qualification Running Gear",
    "VW Expert Qualification Diagnostic Technology",
    "VW Expert Qualification Master Certification",
    "VW Basic Body Repair",
    "VW Advance Body Repair",
    "VW Expert Body Repair",
  ],
  Audi: [
    "Audi Basic Qualification Certification",
    "Audi Basics of Engine Technology",
    "Audi Petrol & Diesel Injection Systems",
    "Audi Power Transmission",
    "Audi Electronic Control in Brakes, Suspension & Damping Systems",
    "Audi AC Systems",
    "Audi Advance Electrics & Electronics",
    "Audi Screening Test & Customer Communication",
    "Audi DT Training 2",
    "Audi Diagnostic Practical Test, Viva-Voce",
    "Audi Basic Body Repair",
    "Audi Body Assembly and Sunroof System",
    "Audi Advance Body Repair",
    "Audi Expert Body Repair",
  ],
};

export const getAllTrainingCourses = () => {
  const allCourses: { value: string; label: string; brand: string }[] = [];
  
  Object.entries(trainingCourses).forEach(([brand, courses]) => {
    courses.forEach(course => {
      allCourses.push({
        value: course,
        label: course,
        brand: brand,
      });
    });
  });
  
  return allCourses;
};