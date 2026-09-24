package com.financetrack.controller;

import com.financetrack.dto.response.ApiResponse;
import com.financetrack.dto.response.PageResponse;
import com.financetrack.dto.response.ReportSummaryResponse;
import com.financetrack.dto.response.TransactionResponse;
import com.financetrack.entity.Category;
import com.financetrack.security.UserDetailsImpl;
import com.financetrack.service.ReportService;
import com.financetrack.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final TransactionService transactionService;
    private final ReportService reportService;

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getReportTransactions(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Category.TransactionType transactionType = null;
        if (type != null && !type.isBlank()) {
            transactionType = Category.TransactionType.valueOf(type.toUpperCase());
        }

        PageResponse<TransactionResponse> result = transactionService.getTransactions(
                userDetails.getId(), transactionType, categoryId, startDate, endDate,
                search, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success("Report transactions retrieved", result));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ReportSummaryResponse>> getReportSummary(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().withDayOfYear(1);
        if (endDate == null) endDate = LocalDate.now();

        ReportSummaryResponse summary = reportService.getSummary(userDetails.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Report summary retrieved", summary));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search) throws IOException {

        Category.TransactionType transactionType = null;
        if (type != null && !type.isBlank()) {
            transactionType = Category.TransactionType.valueOf(type.toUpperCase());
        }

        String csv = reportService.generateCsvExport(
                userDetails.getId(), transactionType, categoryId, startDate, endDate, search);

        String filename = "transactions_" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }
}
