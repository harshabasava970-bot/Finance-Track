package com.financetrack.service;

import com.financetrack.dto.response.*;
import com.financetrack.entity.Category;
import com.financetrack.repository.BudgetRepository;
import com.financetrack.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public DashboardSummaryResponse getSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        BigDecimal totalIncome = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Category.TransactionType.INCOME, startDate, endDate);
        BigDecimal totalExpenses = transactionRepository.sumByUserIdAndTypeAndDateRange(
                userId, Category.TransactionType.EXPENSE, startDate, endDate);

        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal balance = totalIncome.subtract(totalExpenses);
        BigDecimal savings = balance.compareTo(BigDecimal.ZERO) > 0 ? balance : BigDecimal.ZERO;

        long transactionCount = transactionRepository.findFilteredTransactionsAll(
                userId, null, null, startDate, endDate, null, null).size();

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .balance(balance)
                .totalSavings(savings)
                .totalTransactions(transactionCount)
                .build();
    }

    public List<MonthlyDataResponse> getMonthlyData(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> rawData = transactionRepository.findMonthlyTotals(userId, startDate, endDate);

        // Organize into map: (year,month) -> {income, expense}
        Map<String, MonthlyDataResponse> monthMap = new LinkedHashMap<>();

        for (Object[] row : rawData) {
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            String type = row[2].toString();
            BigDecimal total = (BigDecimal) row[3];

            String key = year + "-" + month;
            MonthlyDataResponse data = monthMap.computeIfAbsent(key, k -> MonthlyDataResponse.builder()
                    .year(year)
                    .month(month)
                    .monthName(Month.of(month).getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + year)
                    .income(BigDecimal.ZERO)
                    .expenses(BigDecimal.ZERO)
                    .balance(BigDecimal.ZERO)
                    .build());

            if ("INCOME".equals(type)) {
                data.setIncome(total);
            } else {
                data.setExpenses(total);
            }
            data.setBalance(data.getIncome().subtract(data.getExpenses()));
        }

        return new ArrayList<>(monthMap.values());
    }

    public List<CategorySpendingResponse> getCategorySpending(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Object[]> rawData = transactionRepository.findExpenseByCategoryInRange(userId, startDate, endDate);

        BigDecimal grandTotal = rawData.stream()
                .map(row -> (BigDecimal) row[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return rawData.stream().map(row -> {
            String category = (String) row[0];
            BigDecimal total = (BigDecimal) row[1];
            double pct = grandTotal.compareTo(BigDecimal.ZERO) > 0
                    ? total.divide(grandTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            return CategorySpendingResponse.builder()
                    .category(category)
                    .total(total)
                    .percentage(Math.round(pct * 100.0) / 100.0)
                    .build();
        }).toList();
    }

    public List<BudgetResponse> getBudgetAnalysis(Long userId, int month, int year) {
        var budgets = budgetRepository.findBudgetsForUserMonthYear(userId, month, year);

        return budgets.stream().map(budget -> {
            BigDecimal spent = transactionRepository.sumExpenseByUserCategoryMonthYear(
                    userId, budget.getCategory().getId(), month, year);
            if (spent == null) spent = BigDecimal.ZERO;

            BigDecimal remaining = budget.getAmount().subtract(spent);
            double pct = 0.0;
            if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                pct = spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
            }

            return BudgetResponse.builder()
                    .id(budget.getId())
                    .categoryId(budget.getCategory().getId())
                    .categoryName(budget.getCategory().getName())
                    .amount(budget.getAmount())
                    .spent(spent)
                    .remaining(remaining)
                    .percentageUsed(Math.round(pct * 100.0) / 100.0)
                    .month(budget.getMonth())
                    .year(budget.getYear())
                    .createdAt(budget.getCreatedAt())
                    .build();
        }).toList();
    }
}
