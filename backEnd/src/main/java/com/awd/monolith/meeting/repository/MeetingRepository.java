package com.awd.monolith.meeting.repository;

import com.awd.monolith.meeting.entity.Meeting;
import com.awd.monolith.meeting.entity.MeetingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    @Query("""
            select m from Meeting m
            join fetch m.application a
            join fetch a.candidate
            join fetch a.job
            where (:status is null or m.status = :status)
            order by m.id
            """)
    List<Meeting> search(@Param("status") MeetingStatus status);

    boolean existsByReferenceAndIdNot(String reference, Long id);

    boolean existsByReference(String reference);

    boolean existsByApplicationIdAndIdNot(Long applicationId, Long id);

    boolean existsByApplicationId(Long applicationId);
}
