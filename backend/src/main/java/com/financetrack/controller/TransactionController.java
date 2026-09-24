package com.financetrack.controller;

import com.financetrack.dto.request.TransactionRequest;
import com.financetrack.dto.response.ApiResponse;
import com.financetrack.dto.response.PageResponse;
import com.financetrack.dto.response.TransactionResponse;
import com.financetrack.entity.Category;
import com.financetrack.security.UserDetailsImpl;
import com.financetrack.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TransactionResponse>>> getTransactions(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Category.TransactionType transactionType = null;
        if (type != null && !type.isBlank()) {
            transactionType = Category.TransactionType.valueOf(type.toUpperCase());
        }

        PageResponse<TransactionResponse> result = transactionService.getTransactions(
                userDetails.getId(), transactionType, categoryId, startDate, endDate,
                search, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransactionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        TransactionResponse transaction = transactionService.getTransactionById(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Transaction retrieved", transaction));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse transaction = transactionService.createTransaction(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Transaction created", transaction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody TransactionRequest request) {
        TransactionResponse transaction = transactionService.updateTransaction(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Transaction updated", transaction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        transactionService.deleteTransaction(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Transaction deleted"));
    }
}
