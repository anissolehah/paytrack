package com.paytrack.paytrack.repository;

import com.paytrack.paytrack.entity.PaymentIssue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentIssueRepository extends JpaRepository<PaymentIssue, Long> {
}
