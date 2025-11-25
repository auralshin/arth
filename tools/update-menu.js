#!/usr/bin/env node
/**
 * Menu Component Update Script
 *
 * Reads ROUTES.md and updates menu.component.ts with the correct menu structure
 */

const fs = require('fs');
const path = require('path');

const ROUTES_FILE = path.join(__dirname, '../ROUTES.md');
const MENU_FILE = path.join(__dirname, '../src/app/homepage/menu/menu.component.ts');

/**
 * Parse ROUTES.md and build menu structure
 */
function parseRoutesToMenu() {
  const content = fs.readFileSync(ROUTES_FILE, 'utf-8');
  const lines = content.split('\n');

  const menu = [];
  let currentSection = null;
  let currentSubsection = null;
  let sectionDescription = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip header and top-level routes
    if (line.includes('## Top-level') || line.includes('## Other')) {
      continue;
    }

    // Detect section headers (## Title)
    const sectionMatch = line.match(/^## (.+)$/);
    if (sectionMatch) {
      const sectionTitle = sectionMatch[1];

      // Get description from next line if it starts with _
      sectionDescription = '';
      if (i + 1 < lines.length && lines[i + 1].startsWith('_')) {
        sectionDescription = lines[i + 1].replace(/^_|_$/g, '').trim();
      }

      currentSection = {
        title: sectionTitle,
        description: sectionDescription,
        isOpened: false,
        children: []
      };

      currentSubsection = null;
      menu.push(currentSection);
      continue;
    }

    // Detect subsection headers (### Title)
    const subsectionMatch = line.match(/^### (.+)$/);
    if (subsectionMatch && currentSection) {
      const subsectionTitle = subsectionMatch[1];
      
      // Skip "Removed from this section" subsections
      if (subsectionTitle.includes('Removed from this section')) {
        currentSubsection = null;
        continue;
      }

      currentSubsection = {
        title: subsectionTitle,
        isOpened: false,
        children: []
      };

      currentSection.children.push(currentSubsection);
      continue;
    }

    // Detect route items
    const routeMatch = line.match(/^-\s+\/([\w\-\/]+)/);
    if (routeMatch) {
      const route = routeMatch[1];
      const slug = route.split('/').pop();

      // Convert slug to title
      const title = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const routeItem = {
        title,
        path: `/${route}`
      };

      // Add to subsection if exists, otherwise to section
      if (currentSubsection) {
        currentSubsection.children.push(routeItem);
      } else if (currentSection) {
        currentSection.children.push(routeItem);
      }
    }
  }

  return menu;
}

/**
 * Generate menu items TypeScript code
 */
function generateMenuItems(menu) {
  const items = [];

  // Add intro as first item
  items.push(`    {
      title: 'Intro',
      path: '/',
    }`);

  for (const section of menu) {
    if (section.children.length === 0) continue;

    // Check if this section has subsections (nested structure)
    const hasSubsections = section.children.some(child => child.children && child.children.length > 0);

    if (hasSubsections) {
      // Generate nested structure with subsections
      const subsections = section.children
        .filter(child => child.children && child.children.length > 0)
        .map(subsection => {
          const subsectionChildren = subsection.children.map(item =>
            `            { title: '${item.title.replace(/'/g, "\\'")}', path: '${item.path}' }`
          ).join(',\n');

          return `        {
          title: '${subsection.title.replace(/'/g, "\\'")}',
          isOpened: false,
          children: [
${subsectionChildren}
          ],
        }`;
        }).join(',\n');

      items.push(`    {
      title: '${section.title.replace(/'/g, "\\'")}',
      isOpened: false,
      children: [
${subsections}
      ],
    }`);
    } else if (section.children.length === 1) {
      // If only one child, make it a direct link
      items.push(`    {
      title: '${section.title.replace(/'/g, "\\'")}',
      path: '${section.children[0].path}',
    }`);
    } else {
      // Flat structure
      const children = section.children.map(child =>
        `        { title: '${child.title.replace(/'/g, "\\'")}', path: '${child.path}' }`
      ).join(',\n');

      items.push(`    {
      title: '${section.title.replace(/'/g, "\\'")}',
      isOpened: false,
      children: [
${children}
      ],
    }`);
    }
  }

  return items.join(',\n');
}

/**
 * Update menu.component.ts
 */
function updateMenuComponent(menuItemsCode, dryRun = false) {
  const menuContent = fs.readFileSync(MENU_FILE, 'utf-8');

  // Find the readonly items array
  const startMarker = 'readonly items: MenuItem[] = [';
  const startIndex = menuContent.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error('Could not find menu items array in menu.component.ts');
  }

  // Find the closing bracket
  let bracketCount = 0;
  let endIndex = startIndex + startMarker.length;
  let foundStart = false;

  for (let i = endIndex; i < menuContent.length; i++) {
    if (menuContent[i] === '[') {
      if (!foundStart) {
        foundStart = true;
        bracketCount = 1;
      } else {
        bracketCount++;
      }
    } else if (menuContent[i] === ']') {
      bracketCount--;
      if (bracketCount === 0) {
        endIndex = i;
        break;
      }
    }
  }

  const newMenuContent =
    menuContent.substring(0, startIndex + startMarker.length) +
    '\n' + menuItemsCode + '\n  ' +
    menuContent.substring(endIndex);

  if (!dryRun) {
    fs.writeFileSync(MENU_FILE, newMenuContent, 'utf-8');
  }

  return newMenuContent;
}

/**
 * Main execution
 */
function main() {
  const dryRun = !process.argv.includes('--execute');

  console.log('Menu Component Update Tool\n');

  const menu = parseRoutesToMenu();
  console.log(`Parsed ${menu.length} menu sections from ROUTES.md`);

  // Count total items recursively
  const countItems = (items) => {
    let count = 0;
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        count += countItems(item.children);
      } else if (item.path) {
        count += 1;
      }
    }
    return count;
  };

  const totalItems = countItems(menu.flatMap(section => section.children));
  console.log(`Total menu items: ${totalItems}\n`);

  if (dryRun) {
    console.log('Menu structure:');
    menu.forEach(section => {
      const itemCount = countItems(section.children);
      const hasNested = section.children.some(child => child.children && child.children.length > 0);
      console.log(`  ${section.title} (${itemCount} items${hasNested ? ', nested' : ''})`);
      if (hasNested) {
        section.children.forEach(subsection => {
          if (subsection.children && subsection.children.length > 0) {
            console.log(`    - ${subsection.title} (${subsection.children.length} items)`);
          }
        });
      }
    });
    console.log('\n[DRY RUN] No changes made. Run with --execute to apply changes.\n');
    return;
  }

  console.log('=== Updating Menu Component ===\n');

  const menuItemsCode = generateMenuItems(menu);
  updateMenuComponent(menuItemsCode, dryRun);

  console.log(`  ✓ Updated ${path.relative(process.cwd(), MENU_FILE)}`);
  console.log('\n=== Complete ===\n');
}

if (require.main === module) {
  main();
}

module.exports = { parseRoutesToMenu, generateMenuItems };
