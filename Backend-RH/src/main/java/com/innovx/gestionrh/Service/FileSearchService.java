package com.innovx.gestionrh.Service;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileSearchService {

    @Autowired
    private FileStorageService fileStorageService;

    public List<String> searchKeyword(String keyword) {
        List<String> matchingFiles = new ArrayList<>();
        try (DirectoryStream<Path> directoryStream = Files.newDirectoryStream(fileStorageService.load(""))) {
            for (Path path : directoryStream) {
                if (containsKeyword(path, keyword)) {
                    matchingFiles.add(path.getFileName().toString());
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return matchingFiles;
    }

    private boolean containsKeyword(Path path, String keyword) {
        try {
            Tika tika = new Tika();
            String fileContent = tika.parseToString(path.toFile());
            System.out.println("File: " + path.getFileName() + " Content: " + fileContent);
            return fileContent.toLowerCase().contains(keyword.toLowerCase());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

}
