package com.issa.velem.repository;

import com.issa.velem.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByUserIdAndMonthYear(UUID userId, String monthYear);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.monthYear = :monthYear AND t.type = 'income'")
    BigDecimal sumIncomeByUserIdAndMonthYear(UUID userId, String monthYear);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.user.id = :userId AND t.monthYear = :monthYear AND t.type = 'expense'")
    BigDecimal sumExpensesByUserIdAndMonthYear(UUID userId, String monthYear);
}