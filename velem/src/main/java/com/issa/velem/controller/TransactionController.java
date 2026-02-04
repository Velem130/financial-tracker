package com.issa.velem.controller;

import com.issa.velem.entity.Transaction;
import com.issa.velem.entity.User;
import com.issa.velem.repository.UserRepository;
import com.issa.velem.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    public TransactionController(TransactionService transactionService, UserRepository userRepository) {
        this.transactionService = transactionService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestParam(required = false) String monthYear,
            Authentication authentication) {

        UUID userId = getUserIdFromAuth(authentication);
        List<Transaction> transactions = transactionService.getTransactionsForMonth(userId, monthYear);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<Transaction> addTransaction(
            @RequestBody Transaction transaction,
            Authentication authentication) {

        UUID userId = getUserIdFromAuth(authentication);
        Transaction saved = transactionService.addTransaction(userId, transaction);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, BigDecimal>> getMonthlySummary(
            @RequestParam String monthYear,
            Authentication authentication) {

        UUID userId = getUserIdFromAuth(authentication);
        BigDecimal income = transactionService.getMonthlyIncome(userId, monthYear);
        BigDecimal expenses = transactionService.getMonthlyExpenses(userId, monthYear);
        BigDecimal balance = income.subtract(expenses);

        return ResponseEntity.ok(Map.of(
                "income", income,
                "expenses", expenses,
                "balance", balance
        ));
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }

        // Get email from JWT (subject)
        String email = authentication.getName();

        // Find user by email
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found for email: " + email);
        }

        return userOpt.get().getId();  // real UUID from database
    }
}