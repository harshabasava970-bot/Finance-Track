package com.financetrack.config;

import com.financetrack.entity.Category;
import com.financetrack.entity.User;
import com.financetrack.repository.CategoryRepository;
import com.financetrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            initializeSystemCategories();
        } catch (Exception e) {
            log.error("Failed to initialize system categories: {}", e.getMessage());
        }
        try {
            initializeAdminUser();
        } catch (Exception e) {
            log.error("Failed to initialize admin user: {}", e.getMessage());
        }
    }

    private void initializeSystemCategories() {
        if (categoryRepository.findBySystemCategoryTrue().isEmpty()) {
            log.info("Initializing system categories...");

            List<Category> categories = List.of(
                // INCOME categories
                Category.builder().name("Salary").type(Category.TransactionType.INCOME).systemCategory(true).build(),
                Category.builder().name("Freelance").type(Category.TransactionType.INCOME).systemCategory(true).build(),
                Category.builder().name("Business").type(Category.TransactionType.INCOME).systemCategory(true).build(),
                Category.builder().name("Investment").type(Category.TransactionType.INCOME).systemCategory(true).build(),
                Category.builder().name("Gift").type(Category.TransactionType.INCOME).systemCategory(true).build(),
                Category.builder().name("Other Income").type(Category.TransactionType.INCOME).systemCategory(true).build(),
                // EXPENSE categories
                Category.builder().name("Food").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Transport").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Shopping").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Bills").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Education").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Healthcare").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Entertainment").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Rent").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Travel").type(Category.TransactionType.EXPENSE).systemCategory(true).build(),
                Category.builder().name("Other Expense").type(Category.TransactionType.EXPENSE).systemCategory(true).build()
            );

            categoryRepository.saveAll(categories);
            log.info("System categories initialized.");
        }
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByEmail("admin@financetrack.com")) {
            log.info("Creating default admin user...");
            User admin = User.builder()
                    .fullName("Admin")
                    .email("admin@financetrack.com")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .role(User.Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin created: admin@financetrack.com / Admin@1234");
        }
    }
}
