package com.innovx.gestionrh.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final Tika tika;

    @Value("${app.file.upload-dir:./uploads}")
    private String uploadDir;

    /** GET /api/files/all */
    @GetMapping("/all")
    public ResponseEntity<List<String>> listAll() throws IOException {
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) return ResponseEntity.ok(List.of());
        try (Stream<Path> stream = Files.list(dir)) {
            List<String> names = stream
                    .filter(Files::isRegularFile)
                    .map(p -> p.getFileName().toString())
                    .sorted()
                    .collect(Collectors.toList());
            return ResponseEntity.ok(names);
        }
    }

    /** POST /api/files/upload */
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Void> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return ResponseEntity.badRequest().build();
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String originalName = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
        String filename = System.currentTimeMillis() + "_" + originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/files/search?keywords=x — searches filename AND extracted text content */
    @GetMapping("/search")
    public ResponseEntity<List<String>> search(@RequestParam String keywords) throws IOException {
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) return ResponseEntity.ok(List.of());
        String kw = keywords.toLowerCase().trim();
        try (Stream<Path> stream = Files.list(dir)) {
            List<String> names = stream
                    .filter(Files::isRegularFile)
                    .filter(p -> matchesKeyword(p, kw))
                    .map(p -> p.getFileName().toString())
                    .sorted()
                    .collect(Collectors.toList());
            return ResponseEntity.ok(names);
        }
    }

    private boolean matchesKeyword(Path file, String kw) {
        if (file.getFileName().toString().toLowerCase().contains(kw)) return true;
        try {
            String text = tika.parseToString(file.toFile());
            return text != null && text.toLowerCase().contains(kw);
        } catch (Exception e) {
            log.debug("Could not extract text from {}: {}", file.getFileName(), e.getMessage());
            return false;
        }
    }

    /** DELETE /api/files/delete?filename=x */
    @DeleteMapping("/delete")
    public ResponseEntity<Void> delete(@RequestParam String filename) throws IOException {
        Path base = Paths.get(uploadDir).normalize();
        Path file = base.resolve(filename).normalize();
        if (!file.startsWith(base)) return ResponseEntity.badRequest().build();
        Files.deleteIfExists(file);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/files/deleteAll */
    @DeleteMapping("/deleteAll")
    public ResponseEntity<Void> deleteAll() throws IOException {
        Path dir = Paths.get(uploadDir);
        if (Files.exists(dir)) {
            try (Stream<Path> stream = Files.list(dir)) {
                stream.filter(Files::isRegularFile).forEach(p -> {
                    try { Files.delete(p); } catch (IOException ignored) {}
                });
            }
        }
        return ResponseEntity.noContent().build();
    }

    /** GET /api/files/view?filename=x */
    @GetMapping("/view")
    public ResponseEntity<Resource> view(@RequestParam String filename) throws IOException {
        Path base = Paths.get(uploadDir).normalize();
        Path file = base.resolve(filename).normalize();
        if (!file.startsWith(base) || !Files.exists(file)) return ResponseEntity.notFound().build();
        Resource resource = new FileSystemResource(file);
        String contentType = Files.probeContentType(file);
        if (contentType == null) contentType = "application/octet-stream";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
