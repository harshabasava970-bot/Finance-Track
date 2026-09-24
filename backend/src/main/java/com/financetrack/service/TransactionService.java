package com.financetrack.service;

import com.financetrack.dto.request.TransactionRequest;
import com.financetrack.dto.response.PageResponse;
import com.financetrack.dto.response.TransactionResponse;
import com.financetrack.entity.Category;
import com.financetrack.entity.Transaction;
import com.financetrack.entity.User;
import com.financetrack.exception.BadRequestException;
import com.financetrack.exception.ResourceNotFoundException;
import com.financetrack.repository.CategoryRepository;
import com.financetrack.repository.TransactionRepository;
import com.financetrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public PageResponse<TransactionResponse> getTransactions(
            Long userId,
            Category.TransactionType type,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Transaction> transactions = transactionRepository.findFilteredTransactions(
                userId, type, categoryId, startDate, endDate,
                (search != null && !search.isBlank()) ? search : null,
                pageable);

        List<TransactionResponse> content = transactions.getContent()
                .stream().map(TransactionResponse::from).toList();

        return PageResponse.<TransactionResponse>builder()
                .content(content)
                .pageNumber(transactions.getNumber())
                .pageSize(transactions.getSize())
                .totalElements(transactions.getTotalElements())
                .totalPages(transactions.getTotalPages())
                .last(transactions.isLast())
                .build();
    }

    public TransactionResponse getTransactionById(Long transactionId, Long userId) {
        Transaction t = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return TransactionResponse.from(t);
    }

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getType().equals(request.getType())) {
            throw new BadRequestException("Category type does not match transaction type");
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .type(request.getType())
                .amount(request.getAmount())
                .description(request.getDescription())
                .transactionDate(request.getTransactionDate())
                .build();

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse updateTransaction(Long transactionId, Long userId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getType().equals(request.getType())) {
            throw new BadRequestException("Category type does not match transaction type");
        }

        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(category);
        transaction.setDescription(request.getDescription());
        transaction.setTransactionDate(request.getTransactionDate());

        return TransactionResponse.from(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(Long transactionId, Long userId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(transaction);
    }

    public List<TransactionResponse> getAllTransactionsForExport(
            Long userId,
            Category.TransactionType type,
            Long categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String search) {
        return transactionRepository.findFilteredTransactionsAll(
                userId, type, categoryId, startDate, endDate,
                (search != null && !search.isBlank()) ? search : null)
                .stream().map(TransactionResponse::from).toList();
    }
}
