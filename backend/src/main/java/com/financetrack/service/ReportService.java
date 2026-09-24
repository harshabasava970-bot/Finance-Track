package com.financetrack.service;

import com.financetrack.dto.response.CategorySpendingResponse;
import com.financetrack.dto.response.ReportSummaryResponse;
import com.financetrack.dto.response.TransactionResponse;
import com.financetrack.entity.Category;
import com.financetrack.repository.TransactionRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportSummaryResponse getSummary(Long userId, LocalDate startDate, LocalDate endDate) {
        List<TransactionResponse> transactions = transactionRepository
                .findFilteredTransactionsAll(userId, null, null, startDate, endDate, null, null)
                .stream().map(TransactionResponse::from).toList();

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .map(TransactionResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .map(TransactionResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netBalance = totalIncome.subtract(totalExpenses);

        // Category breakdown
        List<Object[]> expenseRaw = transactionRepository.findExpenseByCategoryInRange(userId, startDate, endDate);
        BigDecimal expenseTotal = expenseRaw.stream().map(r -> (BigDecimal) r[1]).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CategorySpendingResponse> expenseByCategory = expenseRaw.stream().map(row -> {
            BigDecimal total = (BigDecimal) row[1];
            double pct = expenseTotal.compareTo(BigDecimal.ZERO) > 0
                    ? total.divide(expenseTotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0.0;
            return CategorySpendingResponse.builder()
                    .category((String) row[0])
                    .total(total)
                    .percentage(Math.round(pct * 100.0) / 100.0)
                    .build();
        }).toList();

        return ReportSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBalance(netBalance)
                .transactionCount(transactions.size())
                .expenseByCategory(expenseByCategory)
                .incomeByCategory(new ArrayList<>())
                .build();
    }

    public String generateCsvExport(Long userId,
                                     Category.TransactionType type,
                                     Long categoryId,
                                     LocalDate startDate,
                                     LocalDate endDate,
                                     String search) throws IOException {
        List<TransactionResponse> transactions = transactionRepository
                .findFilteredTransactionsAll(userId, type, categoryId, startDate, endDate,
                        (search != null && !search.isBlank()) ? search : null,
                        (search != null && !search.isBlank()) ? "%" + search.toLowerCase() + "%" : null)
                .stream().map(TransactionResponse::from).toList();

        StringWriter sw = new StringWriter();
        try (CSVWriter writer = new CSVWriter(sw)) {
            // Header
            writer.writeNext(new String[]{"Date", "Type", "Category", "Description", "Amount"});
            // Data
            for (TransactionResponse t : transactions) {
                writer.writeNext(new String[]{
                        t.getTransactionDate().toString(),
                        t.getType(),
                        t.getCategoryName(),
                        t.getDescription() != null ? t.getDescription() : "",
                        t.getAmount().toPlainString()
                });
            }
        }
        return sw.toString();
    }
}
