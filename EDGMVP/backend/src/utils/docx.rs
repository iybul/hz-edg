use crate::errors::AppError;

pub fn markdown_to_docx(markdown: &str) -> Result<Vec<u8>, AppError> {
    use std::fs;

    use rdocx::Document;
    use tempfile::NamedTempFile;

    let mut document = Document::new();

    for line in markdown.lines() {
        let text = line.trim();

        if text.is_empty() {
            continue;
        }

        let normalized = text.trim_start_matches('#').trim();
        document.add_paragraph(normalized);
    }

    let temp_file = NamedTempFile::new().map_err(|error| AppError::Docx(error.to_string()))?;
    document
        .save(temp_file.path())
        .map_err(|error| AppError::Docx(error.to_string()))?;

    fs::read(temp_file.path()).map_err(|error| AppError::Docx(error.to_string()))
}
