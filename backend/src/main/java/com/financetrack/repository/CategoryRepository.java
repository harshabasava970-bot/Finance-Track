package com.financetrack.repository;

import com.financetrack.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // System categories
    List<Category> findBySystemCategoryTrue();

    // User-specific categories
    List<Category> findByUserIdAndSystemCategoryFalse(Long userId);

    // All categories available to a user (system + their own)
    @Query("SELECT c FROM Category c WHERE c.systemCategory = true OR c.user.id = :userId")
    List<Category> findAllAvailableForUser(@Param("userId") Long userId);

    // Filter by type
    @Query("SELECT c FROM Category c WHERE (c.systemCategory = true OR c.user.id = :userId) AND c.type = :type")
    List<Category> findAllAvailableForUserByType(@Param("userId") Long userId, @Param("type") Category.TransactionType type);

    boolean existsByNameAndSystemCategoryTrue(String name);
}
