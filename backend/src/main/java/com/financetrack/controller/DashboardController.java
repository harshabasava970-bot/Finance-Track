package com.financetrack.controller;

import com.financetrack.dto.response.*;
import com.financetrack.security.UserDetailsImpl;
import com.financetrack.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        DashboardSummaryResponse summary = dashboardService.getSummary(userDetails.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Summary retrieved", summary));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<MonthlyDataResponse>>> getMonthlyData(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        List<MonthlyDataResponse> data = dashboardService.getMonthlyData(userDetails.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Monthly data retrieved", data));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategorySpendingResponse>>> getCategorySpending(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now().withDayOfMonth(1);
        if (endDate == null) endDate = LocalDate.now();

        List<CategorySpendingResponse> data = dashboardService.getCategorySpending(userDetails.getId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Category spending retrieved", data));
    }

    @GetMapping("/budget-analysis")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgetAnalysis(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {

        if (month == 0) month = LocalDate.now().getMonthValue();
        if (year == 0) year = LocalDate.now().getYear();

        List<BudgetResponse> data = dashboardService.getBudgetAnalysis(userDetails.getId(), month, year);
        return ResponseEntity.ok(ApiResponse.success("Budget analysis retrieved", data));
    }
}
