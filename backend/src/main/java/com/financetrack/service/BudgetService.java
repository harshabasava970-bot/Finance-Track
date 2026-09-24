package com.financetrack.service;

import com.financetrack.dto.request.BudgetRequest;
import com.financetrack.dto.response.BudgetResponse;
import com.financetrack.entity.Budget;
import com.financetrack.entity.Category;
import com.financetrack.entity.User;
import com.financetrack.exception.BadRequestException;
import com.financetrack.exception.ResourceNotFoundException;
import com.financetrack.repository.BudgetRepository;
import com.financetrack.repository.CategoryRepository;
import com.financetrack.repository.TransactionRepository;
import com.financetrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public List<BudgetResponse> getBudgets(Long userId) {
        List<Budget> budgets = budgetRepository.findByUserIdOrderByYearDescMonthDesc(userId);
        return budgets.stream().map(b -> mapToResponse(b, userId)).toList();
    }

    public BudgetResponse getBudgetById(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        return mapToResponse(budget, userId);
    }

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getType().equals(Category.TransactionType.EXPENSE)) {
            throw new BadRequestException("Budgets can only be created for expense categories");
        }

        if (budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
                userId, request.getCategoryId(), request.getMonth(), request.getYear())) {
            throw new BadRequestException("A budget for this category and month/year already exists");
        }

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .month(request.getMonth())
                .year(request.getYear())
                .build();

        return mapToResponse(budgetRepository.save(budget), userId);
    }

    @Transactional
    public BudgetResponse updateBudget(Long budgetId, Long userId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getType().equals(Category.TransactionType.EXPENSE)) {
            throw new BadRequestException("Budgets can only be for expense categories");
        }

        // Check for duplicate only if category/month/year changed
        boolean changed = !budget.getCategory().getId().equals(request.getCategoryId())
                || !budget.getMonth().equals(request.getMonth())
                || !budget.getYear().equals(request.getYear());

        if (changed && budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
                userId, request.getCategoryId(), request.getMonth(), request.getYear())) {
            throw new BadRequestException("A budget for this category and month/year already exists");
        }

        budget.setCategory(category);
        budget.setAmount(request.getAmount());
        budget.setMonth(request.getMonth());
        budget.setYear(request.getYear());

        return mapToResponse(budgetRepository.save(budget), userId);
    }

    @Transactional
    public void deleteBudget(Long budgetId, Long userId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BudgetResponse mapToResponse(Budget budget, Long userId) {
        BigDecimal spent = transactionRepository.sumExpenseByUserCategoryMonthYear(
                userId, budget.getCategory().getId(), budget.getMonth(), budget.getYear());

        if (spent == null) spent = BigDecimal.ZERO;

        BigDecimal remaining = budget.getAmount().subtract(spent);
        double percentageUsed = 0.0;
        if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentageUsed = spent.divide(budget.getAmount(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .amount(budget.getAmount())
                .spent(spent)
                .remaining(remaining)
                .percentageUsed(Math.round(percentageUsed * 100.0) / 100.0)
                .month(budget.getMonth())
                .year(budget.getYear())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}
