package com.innovx.gestionrh.Config;

/**
 * Elasticsearch has been removed from this project.
 *
 * Full-text CV search is now performed via PostgreSQL ILIKE queries on the
 * extracted_text column of cv_applications. Apache Tika extracts plain text
 * from uploaded CV files (PDF, DOCX) at upload time and stores it in the DB.
 *
 * This class is intentionally empty and kept only as a marker to document
 * the removal decision. It may be deleted once the team is aligned.
 */
public class ElasticsearchConfig {
    // Elasticsearch removed — use CvService.searchByText() backed by PostgreSQL ILIKE.
}
