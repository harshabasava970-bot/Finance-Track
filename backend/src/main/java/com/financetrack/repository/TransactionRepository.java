package com.financetrack.repository;

import com.financetrack.entity.Category;
import com.financetrack.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.category.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Transaction> findFilteredTransactions(
            @Param("userId") Long userId,
            @Param("type") Category.TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.user.id = :userId " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
           "AND (:endDate IS NULL OR t.transactionDate <= :endDate) " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.category.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Transaction> findFilteredTransactionsAll(
            @Param("userId") Long userId,
            @Param("type") Category.TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type")
    BigDecimal sumByUserIdAndType(@Param("userId") Long userId, @Param("type") Category.TransactionType type);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type " +
           "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate")
    BigDecimal sumByUserIdAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") Category.TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.type = 'EXPENSE' " +
           "AND t.category.id = :categoryId " +
           "AND EXTRACT(MONTH FROM t.transactionDate) = :month " +
           "AND EXTRACT(YEAR FROM t.transactionDate) = :year")
    BigDecimal sumExpenseByUserCategoryMonthYear(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("month") int month,
            @Param("year") int year);

    @Query("SELECT EXTRACT(YEAR FROM t.transactionDate) as year, " +
           "EXTRACT(MONTH FROM t.transactionDate) as month, " +
           "t.type as type, COALESCE(SUM(t.amount), 0) as total " +
           "FROM Transaction t WHERE t.user.id = :userId " +
           "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate " +
           "GROUP BY EXTRACT(YEAR FROM t.transactionDate), EXTRACT(MONTH FROM t.transactionDate), t.type " +
           "ORDER BY EXTRACT(YEAR FROM t.transactionDate), EXTRACT(MONTH FROM t.transactionDate)")
    List<Object[]> findMonthlyTotals(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT t.category.name as category, COALESCE(SUM(t.amount), 0) as total " +
           "FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' " +
           "AND t.transactionDate >= :startDate AND t.transactionDate <= :endDate " +
           "GROUP BY t.category.name ORDER BY total DESC")
    List<Object[]> findExpenseByCategoryInRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);
}
