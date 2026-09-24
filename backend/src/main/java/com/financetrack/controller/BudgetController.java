package com.financetrack.controller;

import com.financetrack.dto.request.BudgetRequest;
import com.financetrack.dto.response.ApiResponse;
import com.financetrack.dto.response.BudgetResponse;
import com.financetrack.security.UserDetailsImpl;
import com.financetrack.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<BudgetResponse> budgets = budgetService.getBudgets(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Budgets retrieved", budgets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        BudgetResponse budget = budgetService.getBudgetById(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget retrieved", budget));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse budget = budgetService.createBudget(userDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Budget created", budget));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody BudgetRequest request) {
        BudgetResponse budget = budgetService.updateBudget(id, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Budget updated", budget));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        budgetService.deleteBudget(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Budget deleted"));
    }
}
