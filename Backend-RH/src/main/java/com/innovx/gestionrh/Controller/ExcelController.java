package com.innovx.gestionrh.Controller;

import com.innovx.gestionrh.Service.ExcelService;
import com.innovx.gestionrh.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/excel")
@RequiredArgsConstructor
public class ExcelController {

    private final ExcelService excelService;

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('SYSTEM_CONFIG')")
    public ResponseEntity<ApiResponse<Void>> importExcel(
            @RequestParam("file") MultipartFile file) throws IOException {
        excelService.importDataFromExcel(file.getInputStream());
        return ResponseEntity.ok(ApiResponse.ok("Data imported successfully."));
    }
}
