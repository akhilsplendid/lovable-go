// internal/services/export.go
package services

import (
	"archive/zip"
	"bytes"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"lovable-backend/internal/models"
)

type ExportService struct {
	db *gorm.DB
}

func NewExportService(db *gorm.DB) *ExportService {
	return &ExportService{
		db: db,
	}
}

func (s *ExportService) ExportHTML(userID, projectID uuid.UUID, minify bool) ([]byte, string, error) {
	var project models.Project
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return nil, "", fmt.Errorf("project not found")
	}

	if project.HTMLCode == nil || *project.HTMLCode == "" {
		return nil, "", fmt.Errorf("no HTML code available for this project")
	}

	htmlContent := *project.HTMLCode

	// Minify HTML if requested
	if minify {
		htmlContent = strings.ReplaceAll(htmlContent, "\n", "")
		htmlContent = strings.ReplaceAll(htmlContent, "\t", "")
		htmlContent = strings.ReplaceAll(htmlContent, "  ", " ")
	}

	filename := fmt.Sprintf("%s.html", strings.ReplaceAll(strings.ToLower(project.Name), " ", "-"))
	return []byte(htmlContent), filename, nil
}

func (s *ExportService) ExportZIP(userID, projectID uuid.UUID, includeAssets bool) ([]byte, string, error) {
	var project models.Project
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return nil, "", fmt.Errorf("project not found")
	}

	if project.HTMLCode == nil || *project.HTMLCode == "" {
		return nil, "", fmt.Errorf("no code available for this project")
	}

	// Create ZIP buffer
	var buf bytes.Buffer
	writer := zip.NewWriter(&buf)

	// Add main HTML file
	htmlWriter, err := writer.Create("index.html")
	if err != nil {
		return nil, "", err
	}
	htmlWriter.Write([]byte(*project.HTMLCode))

	// Add separate CSS file if external
	if project.CSSCode != nil && !strings.Contains(*project.HTMLCode, "<style>") {
		cssWriter, err := writer.Create("styles.css")
		if err != nil {
			return nil, "", err
		}
		cssWriter.Write([]byte(*project.CSSCode))
	}

	// Add separate JS file if external
	if project.JSCode != nil && !strings.Contains(*project.HTMLCode, "<script>") {
		jsWriter, err := writer.Create("script.js")
		if err != nil {
			return nil, "", err
		}
		jsWriter.Write([]byte(*project.JSCode))
	}

	// Add README
	readmeContent := s.generateReadme(&project)
	readmeWriter, err := writer.Create("README.md")
	if err != nil {
		return nil, "", err
	}
	readmeWriter.Write([]byte(readmeContent))

	// Add package.json
	packageJSON := s.generatePackageJSON(&project)
	packageWriter, err := writer.Create("package.json")
	if err != nil {
		return nil, "", err
	}
	packageWriter.Write([]byte(packageJSON))

	// Add basic assets if requested
	if includeAssets {
		s.addBasicAssets(writer)
	}

	writer.Close()

	filename := fmt.Sprintf("%s-website.zip", strings.ReplaceAll(strings.ToLower(project.Name), " ", "-"))
	return buf.Bytes(), filename, nil
}

func (s *ExportService) BatchExport(userID uuid.UUID, projectIDs []uuid.UUID, includeAssets bool) ([]byte, string, error) {
	// Get all projects
	var projects []models.Project
	if err := s.db.Where("user_id = ? AND id IN ?", userID, projectIDs).Find(&projects).Error; err != nil {
		return nil, "", err
	}

	if len(projects) == 0 {
		return nil, "", fmt.Errorf("no projects found")
	}

	// Create ZIP buffer
	var buf bytes.Buffer
	writer := zip.NewWriter(&buf)

	// Add each project to the archive
	for i, project := range projects {
		folderName := fmt.Sprintf("%d-%s", i+1, strings.ReplaceAll(strings.ToLower(project.Name), " ", "-"))

		if project.HTMLCode != nil {
			htmlWriter, _ := writer.Create(fmt.Sprintf("%s/index.html", folderName))
			htmlWriter.Write([]byte(*project.HTMLCode))
		}

		if project.CSSCode != nil && !strings.Contains(*project.HTMLCode, "<style>") {
			cssWriter, _ := writer.Create(fmt.Sprintf("%s/styles.css", folderName))
			cssWriter.Write([]byte(*project.CSSCode))
		}

		if project.JSCode != nil && !strings.Contains(*project.HTMLCode, "<script>") {
			jsWriter, _ := writer.Create(fmt.Sprintf("%s/script.js", folderName))
			jsWriter.Write([]byte(*project.JSCode))
		}

		// Add project README
		readmeContent := s.generateReadme(&project)
		readmeWriter, _ := writer.Create(fmt.Sprintf("%s/README.md", folderName))
		readmeWriter.Write([]byte(readmeContent))
	}

	// Add batch README
	batchReadme := s.generateBatchReadme(projects)
	batchReadmeWriter, _ := writer.Create("README.md")
	batchReadmeWriter.Write([]byte(batchReadme))

	writer.Close()

	filename := fmt.Sprintf("websites-batch-%d.zip", time.Now().Unix())
	return buf.Bytes(), filename, nil
}

func (s *ExportService) GetProjectForPreview(projectID uuid.UUID, userID *uuid.UUID) (*models.Project, error) {
	query := s.db.Where("id = ?", projectID)

	if userID != nil {
		// Authenticated user: check ownership OR public
		query = query.Where("user_id = ? OR is_public = ?", *userID, true)
	} else {
		// Unauthenticated: only public projects
		query = query.Where("is_public = ?", true)
	}

	var project models.Project
	if err := query.First(&project).Error; err != nil {
		return nil, err
	}

	// Increment view count
	s.db.Model(&project).Update("view_count", gorm.Expr("view_count + 1"))

	return &project, nil
}

func (s *ExportService) generateReadme(project *models.Project) string {
	description := "AI-generated website"
	if project.Description != nil {
		description = *project.Description
	}

	// Build additional files section
	additionalFiles := ""
	if project.CSSCode != nil && !strings.Contains(*project.HTMLCode, "<style>") {
		additionalFiles += "- `styles.css` - Stylesheet\n"
	}
	if project.JSCode != nil && !strings.Contains(*project.HTMLCode, "<script>") {
		additionalFiles += "- `script.js` - JavaScript code\n"
	}

	return fmt.Sprintf(`# %s

%s

## Files Included

- `+"`index.html`"+` - Main HTML file
%s

## Setup

1. Open `+"`index.html`"+` in your web browser
2. Or serve the files using a web server for best results

## Generated By

AI Website Builder
Generated on: %s
Project ID: %s`,
		project.Name,
		description,
		additionalFiles,
		project.CreatedAt.Format(time.RFC3339),
		project.ID.String())
}

func (s *ExportService) generatePackageJSON(project *models.Project) string {
	description := "AI-generated website"
	if project.Description != nil {
		description = *project.Description
	}

	return fmt.Sprintf(`{
  "name": "%s",
  "version": "1.0.0",
  "description": "%s",
  "main": "index.html",
  "scripts": {
    "start": "python -m http.server 8000",
    "serve": "npx serve ."
  },
  "keywords": ["website", "ai-generated", "html"],
  "author": "AI Website Builder",
  "license": "MIT"
}`, strings.ReplaceAll(strings.ToLower(project.Name), " ", "-"), description)
}

func (s *ExportService) generateBatchReadme(projects []models.Project) string {
	projectList := ""
	for i, project := range projects {
		description := "No description"
		if project.Description != nil && *project.Description != "" {
			description = *project.Description
		}
		projectList += fmt.Sprintf("%d. %s - %s\n", i+1, project.Name, description)
	}

	return fmt.Sprintf(`# Website Batch Export

This archive contains %d websites generated by AI Website Builder.

## Projects Included

%s

## Setup

Each project folder contains:
- `+"`index.html`"+` - Main HTML file
- Additional CSS/JS files if externalized
- `+"`README.md`"+` - Project information

## Generated By

AI Website Builder
Export Date: %s
Total Projects: %d
`, len(projects), projectList, time.Now().Format(time.RFC3339), len(projects))
}

func (s *ExportService) addBasicAssets(writer *zip.Writer) {
	// Add favicon
	faviconSVG := `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#667eea"/>
  <text x="16" y="20" font-family="Arial" font-size="18" fill="white" text-anchor="middle">W</text>
</svg>`
	faviconWriter, _ := writer.Create("favicon.svg")
	faviconWriter.Write([]byte(faviconSVG))

	// Add robots.txt
	robotsTxt := `User-agent: *
Allow: /

Sitemap: /sitemap.xml`
	robotsWriter, _ := writer.Create("robots.txt")
	robotsWriter.Write([]byte(robotsTxt))

	// Add .gitignore
	gitignore := `# Logs
*.log
npm-debug.log*

# Dependencies
node_modules/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
	gitignoreWriter, _ := writer.Create(".gitignore")
	gitignoreWriter.Write([]byte(gitignore))
}
