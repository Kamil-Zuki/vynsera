const { parseRefoldKoreanDocument } = require('../parse_refold_korean.js');
const fs = require('fs');
const path = require('path');

// Parse the Korean learning resources
const resources = parseRefoldKoreanDocument();

console.log(`Parsed ${resources.length} Korean learning resources`);

// Create resources data with proper structure for the seed script
const resourcesForDB = [];
const usedSlugs = new Set();

resources.forEach((resource, index) => {
  let baseSlug = resource.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').trim();
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Ensure slug uniqueness
  while (usedSlugs.has(uniqueSlug)) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  usedSlugs.add(uniqueSlug);

  resourcesForDB.push({
    id: `resource_${index + 1}`,
    slug: uniqueSlug,
    title: resource.title,
    titleKorean: null, // Will need to be filled in later
    description: resource.description || 'Korean learning resource',
    descriptionKorean: null, // Will need to be filled in later
    image: 'https://via.placeholder.com/300x200.png', // Default placeholder image
    link: resource.url || 'https://example.com', // Default URL if none provided
    level: resource.level || 'Beginner',
    category: resource.subcategory || resource.category || 'Korean Learning',
    tags: [resource.resourceType || 'korean', resource.category || 'language'],
    rating: 0, // Default rating
    isFree: true, // Most resources in Refold are free
    language: 'en', // Using English as default for text indexing compatibility
    features: [], // Will need to be filled in later
    createdAt: new Date(),
    updatedAt: new Date()
  });
});

// Create a basic roadmap data as well (since the seed script expects it)
const roadmapData = {
  id: 'korean_learning_roadmap',
  title: 'Korean Learning Roadmap',
  titleKorean: '한국어 학습 로드맵',
  description: 'A comprehensive roadmap for learning Korean based on Refold methodology',
  descriptionKorean: 'Refold 방법론 기반의 한국어 학습을 위한 포괄적인 로드맵',
  level: 'Beginner',
  totalEstimatedTime: 'Several months to years',
  steps: [
    {
      id: 'step_1',
      title: 'Stage 0: Mindset',
      titleKorean: '단계 0: 마인드셋',
      description: 'Develop the right mindset for language learning',
      descriptionKorean: '언어 학습을 위한 올바른 마인드셋 개발',
      level: 'Beginner',
      order: 1,
      estimatedTime: '1-2 weeks',
      skills: ['Mindset', 'Motivation'],
      resources: [],
      prerequisites: []
    },
    {
      id: 'step_2',
      title: 'Stage 1: Foundation',
      titleKorean: '단계 1: 기초',
      description: 'Lay the foundation with tools and habits',
      descriptionKorean: '도구와 습관을 통해 기초를 닦기',
      level: 'Beginner',
      order: 2,
      estimatedTime: '1-3 months',
      skills: ['Basic Korean', 'Phonology', 'Grammar'],
      resources: [],
      prerequisites: ['step_1']
    },
    {
      id: 'step_3',
      title: 'Stage 2: Build Comprehension',
      titleKorean: '단계 2: 이해력 구축',
      description: 'Build comprehension through increasing difficulty',
      descriptionKorean: '점점 더 어려운 내용을 통해 이해력 구축',
      level: 'Intermediate',
      order: 3,
      estimatedTime: '3-6 months',
      skills: ['Intermediate Korean', 'Comprehension'],
      resources: [],
      prerequisites: ['step_2']
    },
    {
      id: 'step_4',
      title: 'Stage 3: Speaking Preparation',
      titleKorean: '단계 3: 말하기 준비',
      description: 'Prepare for output and speaking practice',
      descriptionKorean: '출력 및 말하기 연습을 위한 준비',
      level: 'Intermediate',
      order: 4,
      estimatedTime: '2-4 months',
      skills: ['Speaking', 'Pronunciation'],
      resources: [],
      prerequisites: ['step_3']
    },
    {
      id: 'step_5',
      title: 'Stage 4: Refine to Mastery',
      titleKorean: '단계 4: 숙련도 향상',
      description: 'Refine skills to achieve mastery',
      descriptionKorean: '숙련도를 향상시켜 마스터리 달성',
      level: 'Advanced',
      order: 5,
      estimatedTime: '6+ months',
      skills: ['Advanced Korean', 'Mastery'],
      resources: [],
      prerequisites: ['step_4']
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Ensure the data directory exists
const dataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Write the resources to resources.json
const resourcesPath = path.join(dataDir, 'resources.json');
fs.writeFileSync(resourcesPath, JSON.stringify(resourcesForDB, null, 2));
console.log(`Saved ${resourcesForDB.length} resources to ${resourcesPath}`);

// Write the roadmap to roadmap.json
const roadmapPath = path.join(dataDir, 'roadmap.json');
fs.writeFileSync(roadmapPath, JSON.stringify(roadmapData, null, 2));
console.log(`Saved roadmap to ${roadmapPath}`);

console.log('All data files created successfully!');