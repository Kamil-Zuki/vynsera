import connectDB from '../src/lib/mongodb';
import Resource from '../src/models/Resource';

async function exportResourcesToFile() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Get all resources from the database
    const resources = await Resource.find({});

    console.log(`\nFound ${resources.length} resources in database`);

    // Format the resources for the Refold Korean.txt file
    let fileContent = 'Refold - Korean Resources\n';
    fileContent += '=========================\n\n';
    
    // Group resources by category
    const groupedResources = {};
    resources.forEach(resource => {
      if (!groupedResources[resource.category]) {
        groupedResources[resource.category] = [];
      }
      groupedResources[resource.category].push(resource);
    });

    // Write each category and its resources to the file
    for (const [category, resourcesInCategory] of Object.entries(groupedResources)) {
      fileContent += `## ${category}\n\n`;
      
      resourcesInCategory.forEach(resource => {
        fileContent += `### ${resource.title}\n`;
        if (resource.titleKorean) {
          fileContent += `**Korean Title**: ${resource.titleKorean}\n`;
        }
        fileContent += `**Description**: ${resource.description}\n`;
        if (resource.descriptionKorean) {
          fileContent += `**Korean Description**: ${resource.descriptionKorean}\n`;
        }
        fileContent += `**Link**: ${resource.link}\n`;
        fileContent += `**Level**: ${resource.level}\n`;
        fileContent += `**Language**: ${resource.language}\n`;
        fileContent += `**Rating**: ${resource.rating}/5\n`;
        fileContent += `**Free**: ${resource.isFree ? 'Yes' : 'No'}\n`;
        if (resource.tags && resource.tags.length > 0) {
          fileContent += `**Tags**: ${resource.tags.join(', ')}\n`;
        }
        if (resource.features && resource.features.length > 0) {
          fileContent += `**Features**: ${resource.features.join(', ')}\n`;
        }
        fileContent += '\n';
      });
      
      fileContent += '\n';
    }

    // Write the content to the Refold Korean.txt file
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'Refold Korean.txt');
    fs.writeFileSync(filePath, fileContent, 'utf8');
    
    console.log(`Successfully wrote ${resources.length} resources to Refold Korean.txt`);
    console.log(`File location: ${filePath}`);
    
  } catch (error) {
    console.error('Error exporting resources:', error);
  } finally {
    console.log('\n✅ Process completed');
  }
}

exportResourcesToFile();