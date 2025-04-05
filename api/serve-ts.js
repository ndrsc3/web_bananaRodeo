import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    const { path } = req.query;
    if (!path) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Ensure the path ends with .ts
    const tsPath = path.endsWith('.ts') ? path : `${path}.ts`;
    
    // Construct the full path to the TypeScript file
    const fullPath = join(process.cwd(), 'packages/client/src', tsPath);
    
    // Read the file
    const content = readFileSync(fullPath, 'utf8');
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/typescript');
    res.status(200).send(content);
  } catch (error) {
    console.error('Error serving TypeScript file:', error);
    res.status(404).json({ 
      error: 'File not found',
      requestedPath: req.query.path,
      fullPath: join(process.cwd(), 'packages/client/src', req.query.path + '.ts'),
      cwd: process.cwd()
    });
  }
} 