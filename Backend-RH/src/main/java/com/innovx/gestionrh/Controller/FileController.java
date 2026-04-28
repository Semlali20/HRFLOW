package com.innovx.gestionrh.Controller;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final String UPLOAD_DIR = "uploads/";

    static {
        // Set the path to the tessdata folder
        System.setProperty("TESSDATA_PREFIX", "C:/Program Files/Tesseract-OCR/");
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        List<String> uploadedFiles = new ArrayList<>();
        List<String> skippedFiles = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                Path path = Paths.get(UPLOAD_DIR + file.getOriginalFilename());

                if (Files.exists(path)) {
                    skippedFiles.add(file.getOriginalFilename());
                } else {
                    Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                    uploadedFiles.add(file.getOriginalFilename());
                }
            }

            StringBuilder responseMessage = new StringBuilder("Files uploaded successfully: " + uploadedFiles);
            if (!skippedFiles.isEmpty()) {
                responseMessage.append(". Files skipped (already exist): ").append(skippedFiles);
            }

            return ResponseEntity.ok(responseMessage.toString());

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload files");
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<String>> searchFiles(@RequestParam("keywords") String keywords) {
        System.out.println("Received keywords: " + keywords);
        List<String> resultFiles = new ArrayList<>();
        try {
            String[] keywordArray;
            if (keywords.contains(";")) {
                keywordArray = keywords.split(";");
            } else {
                keywordArray = new String[]{keywords};
            }

            Files.list(Paths.get(UPLOAD_DIR)).forEach(path -> {
                try {
                    File file = path.toFile();
                    String content = extractTextFromFile(file);
                    boolean containsAllKeywords = true;
                    for (String keyword : keywordArray) {
                        if (!content.toLowerCase().contains(keyword.toLowerCase().trim())) {
                            containsAllKeywords = false;
                            break;
                        }
                    }
                    if (containsAllKeywords) {
                        resultFiles.add(file.getName());
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
            return ResponseEntity.ok(resultFiles);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of("Failed to search files"));
        }
    }


    @GetMapping("/all")
    public ResponseEntity<List<String>> getAllFiles() {
        try {
            List<String> allFiles = Files.list(Paths.get(UPLOAD_DIR))
                    .map(path -> path.getFileName().toString())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(allFiles);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of("Failed to retrieve files"));
        }
    }

    @DeleteMapping("/deleteAll")
    public ResponseEntity<String> deleteAllFiles() {
        try {
            Files.walk(Paths.get(UPLOAD_DIR))
                    .filter(Files::isRegularFile)
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    });
            return ResponseEntity.ok("All files deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete files");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFile(@RequestParam("filename") String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR + filename);
            if (Files.deleteIfExists(path)) {
                return ResponseEntity.ok("File deleted successfully: " + filename);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("File not found: " + filename);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + filename);
        }
    }

    @GetMapping("/view")
    public ResponseEntity<Resource> viewFile(@RequestParam("filename") String filename) {
        try {
            Path file = Paths.get(UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private String extractTextFromFile(File file) throws IOException {
        String content = "";
        String fileName = file.getName().toLowerCase();

        if (fileName.endsWith(".pdf")) {
            content = extractTextFromPDF(file);
        } else if (fileName.endsWith(".docx")) {
            content = extractTextFromWord(file);
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".png")) {
            content = extractTextFromImage(file);
        }

        return content;
    }

    private String extractTextFromPDF(File file) throws IOException {
        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractTextFromWord(File file) throws IOException {
        try (XWPFDocument document = new XWPFDocument(Files.newInputStream(file.toPath()))) {
            return document.getParagraphs().stream()
                    .map(paragraph -> paragraph.getText())
                    .reduce("", String::concat);
        }
    }

    private String extractTextFromImage(File file) throws IOException {
        ITesseract tesseract = new Tesseract();
        tesseract.setDatapath(System.getProperty("TESSDATA_PREFIX") + "tessdata");
        tesseract.setLanguage("eng"); // or "fra" for French, depending on the document language

        BufferedImage image = ImageIO.read(file);
        try {
            return tesseract.doOCR(image);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}
