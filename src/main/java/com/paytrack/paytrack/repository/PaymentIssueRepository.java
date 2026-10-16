package com.paytrack.paytrack.repository;

import com.paytrack.paytrack.entity.PaymentIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentIssueRepository extends JpaRepository<PaymentIssue, Long> {

    List<PaymentIssue> findAllByOwnerId(Long ownerId);

    Optional<PaymentIssue> findByIdAndOwnerId(Long id, Long ownerId);

}
