package com.financetrack;

import com.financetrack.dto.request.RegisterRequest;
import com.financetrack.dto.request.TransactionRequest;
import com.financetrack.dto.response.PageResponse;
import com.financetrack.dto.response.TransactionResponse;
import com.financetrack.dto.response.UserResponse;
import com.financetrack.entity.Category;
import com.financetrack.exception.ResourceNotFoundException;
import com.financetrack.repository.CategoryRepository;
import com.financetrack.service.AuthService;
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
class TransactionServiceTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AuthService authService;

    @Autowired
    private CategoryRepository categoryRepository;

    private Long userId;
    private Long incomeCategoryId;
    private Long expenseCategoryId;

    @BeforeEach
    void setup() {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Tx Test User");
        req.setEmail("txtest@example.com");
        req.setPassword("Test@1234");
        req.setConfirmPassword("Test@1234");
        UserResponse user = authService.register(req);
        userId = user.getId();

        List<Category> categories = categoryRepository.findBySystemCategoryTrue();
        incomeCategoryId = categories.stream()
                .filter(c -> c.getType() == Category.TransactionType.INCOME).findFirst()
                .orElseThrow().getId();
        expenseCategoryId = categories.stream()
                .filter(c -> c.getType() == Category.TransactionType.EXPENSE).findFirst()
                .orElseThrow().getId();
    }

    @Test
    void testCreateIncomeTransaction() {
        TransactionRequest req = new TransactionRequest();
        req.setType(Category.TransactionType.INCOME);
        req.setAmount(new BigDecimal("5000.00"));
        req.setCategoryId(incomeCategoryId);
        req.setDescription("Monthly salary");
        req.setTransactionDate(LocalDate.now());

        TransactionResponse response = transactionService.createTransaction(userId, req);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("INCOME", response.getType());
        assertEquals(0, new BigDecimal("5000.00").compareTo(response.getAmount()));
    }

    @Test
    void testCreateExpenseTransaction() {
        TransactionRequest req = new TransactionRequest();
        req.setType(Category.TransactionType.EXPENSE);
        req.setAmount(new BigDecimal("200.00"));
        req.setCategoryId(expenseCategoryId);
        req.setDescription("Groceries");
        req.setTransactionDate(LocalDate.now());

        TransactionResponse response = transactionService.createTransaction(userId, req);

        assertNotNull(response);
        assertEquals("EXPENSE", response.getType());
    }

    @Test
    void testUpdateTransaction() {
        TransactionRequest req = new TransactionRequest();
        req.setType(Category.TransactionType.INCOME);
        req.setAmount(new BigDecimal("1000.00"));
        req.setCategoryId(incomeCategoryId);
        req.setTransactionDate(LocalDate.now());

        TransactionResponse created = transactionService.createTransaction(userId, req);

        req.setAmount(new BigDecimal("1500.00"));
        TransactionResponse updated = transactionService.updateTransaction(created.getId(), userId, req);

        assertEquals(0, new BigDecimal("1500.00").compareTo(updated.getAmount()));
    }

    @Test
    void testDeleteTransaction() {
        TransactionRequest req = new TransactionRequest();
        req.setType(Category.TransactionType.INCOME);
        req.setAmount(new BigDecimal("500.00"));
        req.setCategoryId(incomeCategoryId);
        req.setTransactionDate(LocalDate.now());

        TransactionResponse created = transactionService.createTransaction(userId, req);
        transactionService.deleteTransaction(created.getId(), userId);

        assertThrows(ResourceNotFoundException.class,
                () -> transactionService.getTransactionById(created.getId(), userId));
    }

    @Test
    void testUserCannotAccessOtherUsersTransaction() {
        // Register second user
        RegisterRequest req2 = new RegisterRequest();
        req2.setFullName("Other User");
        req2.setEmail("other@example.com");
        req2.setPassword("Test@1234");
        req2.setConfirmPassword("Test@1234");
        UserResponse otherUser = authService.register(req2);

        // Create transaction for user 1
        TransactionRequest req = new TransactionRequest();
        req.setType(Category.TransactionType.INCOME);
        req.setAmount(new BigDecimal("100.00"));
        req.setCategoryId(incomeCategoryId);
        req.setTransactionDate(LocalDate.now());
        TransactionResponse created = transactionService.createTransaction(userId, req);

        // Try to get with user 2's ID
        assertThrows(ResourceNotFoundException.class,
                () -> transactionService.getTransactionById(created.getId(), otherUser.getId()));
    }

    @Test
    void testFilterTransactionsByType() {
        TransactionRequest incReq = new TransactionRequest();
        incReq.setType(Category.TransactionType.INCOME);
        incReq.setAmount(new BigDecimal("1000.00"));
        incReq.setCategoryId(incomeCategoryId);
        incReq.setTransactionDate(LocalDate.now());
        transactionService.createTransaction(userId, incReq);

        TransactionRequest expReq = new TransactionRequest();
        expReq.setType(Category.TransactionType.EXPENSE);
        expReq.setAmount(new BigDecimal("200.00"));
        expReq.setCategoryId(expenseCategoryId);
        expReq.setTransactionDate(LocalDate.now());
        transactionService.createTransaction(userId, expReq);

        PageResponse<TransactionResponse> incomeOnly = transactionService.getTransactions(
                userId, Category.TransactionType.INCOME, null, null, null, null, 0, 10, "transactionDate", "desc");

        assertTrue(incomeOnly.getContent().stream().allMatch(t -> "INCOME".equals(t.getType())));
    }
}
