package com.awd.monolith.notification.repository;

import com.awd.monolith.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("""
            select n from Notification n
            where (:recipient is null or lower(n.recipient) = lower(:recipient))
            order by n.id
            """)
    List<Notification> search(@Param("recipient") String recipient);

    boolean existsByApplicationIdAndIdNot(Long applicationId, Long id);

    boolean existsByApplicationId(Long applicationId);
}
