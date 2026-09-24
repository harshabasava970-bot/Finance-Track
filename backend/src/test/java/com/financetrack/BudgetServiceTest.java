package com.financetrack;

import com.financetrack.dto.request.BudgetRequest;
import com.financetrack.dto.request.RegisterRequest;
import com.financetrack.dto.request.TransactionRequest;
import com.financetrack.dto.response.BudgetResponse;
import com.financetrack.dto.response.UserResponse;
import com.financetrack.entity.Category;
import com.financetrack.exception.BadRequestException;
import com.financetrack.repository.CategoryRepository;
import com.financetrack.service.AuthService;
import com.financetrack.service.BudgetService;
import com.financetrack.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BudgetServiceTest {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private AuthService authService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private CategoryRepository categoryRepository;

    private Long userId;
    private Long expenseCategoryId;

    @BeforeEach
    void setup() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Budget Test");
        req.setEmail("budgettest@example.com");
        req.setPassword("Test@1234");
        req.setConfirmPassword("Test@1234");
        UserResponse user = authService.register(req);
        userId = user.getId();

        expenseCategoryId = categoryRepository.findBySystemCategoryTrue().stream()
                .filter(c -> c.getType() == Category.TransactionType.EXPENSE).findFirst()
                .orElseThrow().getId();
    }

    @Test
    void testCreateBudget() {
        BudgetRequest req = new BudgetRequest();
        req.setCategoryId(expenseCategoryId);
        req.setAmount(new BigDecimal("10000.00"));
        req.setMonth(LocalDate.now().getMonthValue());
        req.setYear(LocalDate.now().getYear());

        BudgetResponse response = budgetService.createBudget(userId, req);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(0, new BigDecimal("10000.00").compareTo(response.getAmount()));
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getSpent()));
        assertEquals(0, new BigDecimal("10000.00").compareTo(response.getRemaining()));
        assertEquals(0.0, response.getPercentageUsed());
    }

    @Test
    void testBudgetCalculation() {
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        // Create budget of 10000
        BudgetRequest budgetReq = new BudgetRequest();
        budgetReq.setCategoryId(expenseCategoryId);
        budgetReq.setAmount(new BigDecimal("10000.00"));
        budgetReq.setMonth(month);
        budgetReq.setYear(year);
        BudgetResponse budget = budgetService.createBudget(userId, budgetReq);

        // Add expense of 6000 in same month
        TransactionRequest txReq = new TransactionRequest();
        txReq.setType(Category.TransactionType.EXPENSE);
        txReq.setAmount(new BigDecimal("6000.00"));
        txReq.setCategoryId(expenseCategoryId);
        txReq.setTransactionDate(LocalDate.of(year, month, 1));
        transactionService.createTransaction(userId, txReq);

        // Re-fetch budget
        BudgetResponse updated = budgetService.getBudgetById(budget.getId(), userId);

        assertEquals(0, new BigDecimal("6000.00").compareTo(updated.getSpent()));
        assertEquals(0, new BigDecimal("4000.00").compareTo(updated.getRemaining()));
        assertEquals(60.0, updated.getPercentageUsed(), 0.01);
    }

    @Test
    void testDuplicateBudgetRejected() {
        BudgetRequest req = new BudgetRequest();
        req.setCategoryId(expenseCategoryId);
        req.setAmount(new BigDecimal("5000.00"));
        req.setMonth(1);
        req.setYear(2025);

        budgetService.createBudget(userId, req);

        assertThrows(BadRequestException.class, () -> budgetService.createBudget(userId, req));
    }
}
