const mongoose = require("mongoose");
const {Category} = require("./models/Category"); // adjust path

const seedCategories = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/skill-linker');

  const categories = [
    {
      category: "it",
      jobs: [
        "frontend developer",
        "backend developer",
        "full stack developer",
        "devops engineer"
      ]
    },
    {
      category: "design",
      jobs: [
        "ui designer",
        "ux designer",
        "graphic designer",
        "product designer"
      ]
    },
    {
      category: "marketing",
      jobs: [
        "digital marketer",
        "seo specialist",
        "content writer",
        "social media manager"
      ]
    },
    {
      category: "finance",
      jobs: [
        "accountant",
        "financial analyst",
        "auditor",
        "investment banker"
      ]
    },
    {
      category: "healthcare",
      jobs: [
        "nurse",
        "doctor",
        "medical assistant",
        "pharmacist"
      ]
    }
  ];

  await Category.deleteMany(); // clean old data
  await Category.insertMany(categories);

  console.log("🌱 Category seeds inserted!");
  mongoose.connection.close();
};

seedCategories();
